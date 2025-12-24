package compactor

import (
	"context"
	"fmt"
	"sort"
	"time"

	"github.com/Netcracker/qubership-profiler-backend/libs/storage/inventory"
	"github.com/Netcracker/qubership-profiler-backend/libs/pg"

	"github.com/Netcracker/qubership-profiler-backend/apps/compactor/pkg/metrics"

	"github.com/Netcracker/qubership-profiler-backend/libs/storage"
	"github.com/Netcracker/qubership-profiler-backend/libs/log"
)

type (
	// CompactorJob context of execution for the compactor job in particular moment
	CompactorJob struct {
		*Compactor
		ts            time.Time // hour of interest (usually it's a previous hour) (00:00)
		tableStatus   model.TableStatus
		processTables *ProcessTables // tables call/traces/dumps for hour of interest
	}

	ProcessTables struct {
		Calls           []*CallTraceCombination // the list of calls and traces tables for compaction calls, which are in ready tables for hour of interest
		Dumps           []*DumpCombination      // the list of dumps tables which are in ready status for hour of interest
		InvertedIndexes []*InvertedIndexCombination
	}

	// CallTraceCombination store combination of calls and trace tables name for the same time for further using
	CallTraceCombination struct {
		CallTable  *inventory.TempTableInfo
		TraceTable *inventory.TempTableInfo
		tableTime  time.Time
	}

	DumpCombination struct {
		DumpTable *inventory.TempTableInfo
		tableTime time.Time
	}

	InvertedIndexCombination struct {
		InvertedIndexTable *inventory.TempTableInfo
		tableTime          time.Time
	}
)

func NewCompactorJob(ctx context.Context, compactor *Compactor, ts time.Time, status model.TableStatus) (*CompactorJob, error) {
	log.Debug(ctx, "Create new CompactorJob. Compaction time: %v", ts)

	return &CompactorJob{
		compactor,
		ts,
		status,
		nil, // will be filled later in executeCompactorJob method
	}, nil
}

// executeCompactorJob is the main entry point for the compaction process
// for the previous full hour. It processes temporary tables with READY status,
// updating their metadata (row count, size, total size) and changing the status to PERSISTING.
func (cj *CompactorJob) executeCompactorJob(ctx context.Context) error {
	startTime := time.Now()
	log.Info(ctx, "Start execution of compactor job. Time: %v", cj.ts)

	// Step 1: Load all ready tables for the previous hour (calls, traces, dumps, etc.)
	err := cj.NewReadyTables(ctx, cj.tableStatus)
	if err != nil {
		log.Error(ctx, err, "problem during getting tables which has ready status.")
		return err
	}

	// Step 2: Fetch metadata and update status from READY to PERSISTING in the inventory table
	err = cj.UpdateTablesInfo(ctx)
	if err != nil {
		log.Error(ctx, err, "cannot update tables info")
		return err
	}

	// Step 3: Load all unique namespaces from the pods table.
	// Each namespace will be processed independently by a separate NamespaceJob.
	namespaces, err := cj.Postgres.GetUniqueNamespaces(ctx)
	if err != nil {
		log.Error(ctx, err, "cannot get unique namespaces")
		return err
	}

	// Step 4: Execute Namespace Job for every namespace
	log.Info(ctx, "Scheduling %d namespace jobs", len(namespaces))
	for _, namespace := range namespaces {
		nsj := NewNamespaceJob(ctx, cj, namespace)
		if err := nsj.executeNamespaceJob(ctx); err != nil {
			log.Error(ctx, err, "problem during namespace job execution for namespace: %s", namespace)
			return err
		}
	}

	metrics.Common.UpdateNamespacesCount(len(namespaces))

	// set tables status as persisted
	if err = cj.UpdateTablesStatus(ctx, model.TableStatusPersisted); err != nil {
		log.Error(ctx, err, "problem during update tables status to %s", model.TableStatusPersisted)
		// FIXME should return err or continue working
	}

	log.Info(ctx, "Compactor Job for %v is finished. [Execution time - %v]", cj.ts, time.Since(startTime))

	return nil
}

// NewReadyTables collects and prepares the set of "ready" temp tables (calls, traces, dumps)
// for further compaction. It scans a 1-hour time window starting from cj.ts
// and builds combinations of related tables (by time).
func (cj *CompactorJob) NewReadyTables(ctx context.Context, status model.TableStatus) error {

	// Initialize a container for selected combinations of ready tables
	rt := &ProcessTables{
		Calls:           make([]*CallTraceCombination, 0),
		Dumps:           make([]*DumpCombination, 0),
		InvertedIndexes: make([]*InvertedIndexCombination, 0),
	}

	// Define the time window [start, end), e.g., from 2025-07-03 15:00:00 +0000 to 2025-07-03 15:59:59.999999999 +0000
	start := cj.ts
	end := cj.ts.Add(time.Hour).Add(-time.Nanosecond)

	// Load all temporary tables with the specified status in the time window [ts, ts + 1h)
	tables, err := cj.Postgres.GetTempTableByStatusAndStartTimeBetween(ctx, status, start, end)
	if err != nil {
		log.Error(ctx, err, "failed to fetch ready temp tables")
		return err
	}

	// Build combinations for calls and traces tables
	rt.collectCallsAndTraces(ctx, tables, start, end)
	rt.collectDumps(ctx, tables)
	rt.collectInvertedIndexes(ctx, tables)

	// Save the result into the compactor job for later use
	cj.processTables = rt

	log.Debug(ctx, "processed tables: %v", cj.processTables)
	return nil
}

// collectCallsAndTraces builds CallTraceCombination entries for each 5-minute time slot
// within the [start, end] interval. It looks up CALLS and optional TRACES tables by name.
// Table names are assumed to follow the format: calls_<unix>, traces_<unix>.
func (rt *ProcessTables) collectCallsAndTraces(ctx context.Context, tables map[string]*inventory.TempTableInfo, start, end time.Time) {

	for ts := start; !ts.After(end); ts = ts.Add(pg.Granularity) {
		// Build table names for this time slot
		unix := ts.Unix()
		callsName := fmt.Sprintf("calls_%d", unix)
		tracesName := fmt.Sprintf("traces_%d", unix)

		// Look up the CALLS table
		callsTable := tables[callsName]
		if callsTable == nil {
			log.Info(ctx, "Skipping slot - calls table not found - time: %v", ts)
			continue
		}

		// Look up the TRACES table (optional)
		tracesTable := tables[tracesName]
		if tracesTable == nil {
			log.Info(ctx, "Traces table not found - fallback to calls only - time: %v", ts)
		}

		// Add the combination to the list
		rt.Calls = append(rt.Calls, &CallTraceCombination{
			CallTable:  callsTable,
			TraceTable: tracesTable,
			tableTime:  ts,
		})

		log.Debug(ctx, "CallTraceCombination added - calls: %s traces: %s time: %v",
			callsTable.TableName,
			func() string {
				if tracesTable != nil {
					return tracesTable.TableName
				}
				return "none"
			}(),
			ts,
		)
	}

	// Reverse the slice to go from newest to oldest
	for i, j := 0, len(rt.Calls)-1; i < j; i, j = i+1, j-1 {
		rt.Calls[i], rt.Calls[j] = rt.Calls[j], rt.Calls[i]
	}
}

// collectDumps selects all dump_objects tables from the input tables map.
func (rt *ProcessTables) collectDumps(ctx context.Context, tables map[string]*inventory.TempTableInfo) {
	for _, table := range tables {
		// Only process dump_objects temp tables
		if table.Type != model.TableDumps {
			continue
		}

		// Add a new dump combination for this table
		rt.Dumps = append(rt.Dumps, &DumpCombination{
			DumpTable: table,
			tableTime: table.StartTime,
		})

		log.Debug(ctx, "DumpCombination added - table: %s time: %v", table.TableName, table.StartTime)
	}

	// Reverse the slice to go from newest to oldest
	sort.Slice(rt.Dumps, func(i, j int) bool {
		return rt.Dumps[i].tableTime.After(rt.Dumps[j].tableTime)
	})
}

// collectInvertedIndexes selects all inverted_index tables from the input tables map.
func (rt *ProcessTables) collectInvertedIndexes(ctx context.Context, tables map[string]*inventory.TempTableInfo) {
	for _, table := range tables {
		// Only process inverted index tables
		if table.Type != model.TableInvertedIndex {
			continue
		}

		// Add a new inverted index entry
		rt.InvertedIndexes = append(rt.InvertedIndexes, &InvertedIndexCombination{
			InvertedIndexTable: table,
			tableTime:          table.StartTime,
		})

		log.Debug(ctx, "InvertedIndexCombination added - table: %s time: %v", table.TableName, table.StartTime)
	}

	// Reverse the slice to go from newest to oldest
	sort.Slice(rt.InvertedIndexes, func(i, j int) bool {
		return rt.InvertedIndexes[i].tableTime.After(rt.InvertedIndexes[j].tableTime)
	})
}

// UpdateTablesInfo fetches metadata (row count, size, total size) for each temp table
// involved in the current compaction job, and updates the inventory with new stats.
// Tables include: calls, traces (optional), dumps, and inverted index tables.
func (cj *CompactorJob) UpdateTablesInfo(ctx context.Context) error {
	var err error

	// Update calls and traces tables
	for _, cc := range cj.processTables.Calls {
		// Always update calls table
		if err = cj.updateTableInfo(ctx, cc.CallTable); err != nil {
			log.Error(ctx, err, "cannot update table info for %s", cc.CallTable.TableName)
		}

		// traces table is optional
		if cc.TraceTable != nil {
			if err = cj.updateTableInfo(ctx, cc.TraceTable); err != nil {
				log.Error(ctx, err, "cannot update table info for %s", cc.TraceTable.TableName)
			}
		}
	}

	// Update inverted_index tables
	for _, idx := range cj.processTables.InvertedIndexes {
		err = cj.updateTableInfo(ctx, idx.InvertedIndexTable)
		if err != nil {
			log.Error(ctx, err, "cannot update table info for %s", idx.InvertedIndexTable.TableName)
		}
	}

	return err
}

// updateTableInfo retrieves row count and size info for a temp table
// and updates the corresponding record in the temp table inventory.
func (cj *CompactorJob) updateTableInfo(ctx context.Context, info *inventory.TempTableInfo) error {
	rowsCount, size, totalSize, err := cj.Postgres.GetTableMetadata(ctx, info.TableName)
	if err != nil {
		log.Error(ctx, err, "cannot get metadata for %s", info.TableName)
		return err
	}

	// Update the in-memory TempTableInfo struct with new metadata:
	// - sets status to "PERSISTING"
	// - updates row count, table size, and total size
	info.UpdateInfo(model.TableStatusPersisting, rowsCount, size, totalSize)

	// Persist changes to the database
	if err = cj.Postgres.UpdateTempTableInventory(ctx, *info); err != nil {
		log.Error(ctx, err, "cannot update information for %s in database", info.TableName)
		return err
	}

	return nil
}

func (cj *CompactorJob) UpdateTablesStatus(ctx context.Context, status model.TableStatus) error {
	var err error
	for _, dp := range cj.processTables.Dumps {
		dp.DumpTable.Status = status
		err = cj.Postgres.UpdateTempTableInventory(ctx, *dp.DumpTable)
		if err != nil {
			log.Error(ctx, err, "cannot update status for %s", dp.DumpTable.TableName)
		}
	}

	for _, cc := range cj.processTables.Calls {
		cc.CallTable.Status = status
		err = cj.Postgres.UpdateTempTableInventory(ctx, *cc.CallTable)
		if err != nil {
			log.Error(ctx, err, "cannot update status for %s", cc.CallTable.TableName)
		}

		cc.TraceTable.Status = status
		err = cj.Postgres.UpdateTempTableInventory(ctx, *cc.TraceTable)
		if err != nil {
			log.Error(ctx, err, "cannot update status for %s", cc.TraceTable.TableName)
		}
	}

	for _, ii := range cj.processTables.InvertedIndexes {
		ii.InvertedIndexTable.Status = status
		err = cj.Postgres.UpdateTempTableInventory(ctx, *ii.InvertedIndexTable)
		if err != nil {
			log.Error(ctx, err, "cannot update status for %s", ii.InvertedIndexTable.TableName)
		}
	}

	return err
}
