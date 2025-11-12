package compactor

import (
	"context"
	"time"

	"github.com/Netcracker/qubership-profiler-backend/apps/compactor/pkg/metrics"

	"github.com/Netcracker/qubership-profiler-backend/libs/storage"
	"github.com/Netcracker/qubership-profiler-backend/libs/log"
)

type PodJob struct {
	*NamespaceJob
	pod *model.PodInfo
	pt  *ParquetTransformer
}

func NewPodJob(ctx context.Context, nsj *NamespaceJob, pod *model.PodInfo) *PodJob {
	return &PodJob{
		nsj,
		pod,
		&ParquetTransformer{
			pgClient:  nsj.Postgres,
			DictCache: make(map[int]string),
		},
	}
}

// runPodCompaction executes the compaction logic for a specific pod.
// It iterates over all collected ready temp tables (calls, dumps) and processes their data
// into Parquet files within a specific 5-minute window (split into minute chunks).
func (pj *PodJob) runPodCompaction(ctx context.Context) error {
	var err error
	startTime := time.Now()
	log.Info(ctx, "[%s] start pod execution flow", pj.pod)

	// Step 1: Compact all calls (and optionally traces) for the pod
	if len(pj.processTables.Calls) > 0 {
		for _, callItem := range pj.processTables.Calls {

			// Define compaction window for 5 minutes ahead of the table time
			// FIXME period should be configurable - move to ENV Variable
			upperBound := callItem.tableTime.Add(5 * time.Minute)
			lowerBound := upperBound.Add(-1 * time.Minute)

			// Iterate in reverse 1-minute steps: [upperBound, lowerBound)
			for upperBound.Hour() > callItem.tableTime.Hour() || upperBound.Minute() > callItem.tableTime.Minute() {
				// FIXME if callItem.TraceTable is nil ????
				if err = pj.callsCompaction(ctx, callItem.CallTable.TableName, callItem.TraceTable.TableName, callItem.tableTime, upperBound, lowerBound); err != nil {
					log.Error(ctx, err, "problem during compaction calls for %v", pj.pod)
					// OPTIMIZE fail fast: we can't save parquet with incomplete data
				}
				// Move the window 1 minute back
				upperBound = lowerBound
				lowerBound = lowerBound.Add(-1 * time.Minute)
			}
		}
	}

	log.Debug(ctx, "[%s] pod execution flow is finished. [Execution time - %v]", pj.pod, time.Since(startTime))

	return err
}

// callsCompaction processes call records within a given time range, writes them to Parquet files, and updates relevant indices.
func (pj *PodJob) callsCompaction(ctx context.Context, callsTb, tracesTb string, tableTime, upperBound, lowerBound time.Time) error {
	startTime := time.Now()

	calls, err := pj.Postgres.GetCallsWithTraceTimeBetween(ctx, pj.namespace, pj.pod, callsTb, tracesTb, upperBound, lowerBound)

	metrics.PG.ReadCalls(startTime, pj.namespace, pj.pod.ServiceName, err)

	if err != nil {
		log.Error(ctx, err, "problem during getting calls")
		return err
	}

	if len(calls) > 0 {
		for _, call := range calls {
			log.Debug(ctx, "Start call execution for call from ns: %s, duration: %d", call.Namespace, call.Duration)

			dr := model.Durations.Get(call.Duration)
			parqFile, err := pj.filemap.GetCallsFile(ctx, pj.namespace, &dr, pj.ts)
			if err != nil {
				log.Error(ctx, err, "Get file error")
				return err
			}

			pj.AddService(ctx, parqFile.FileName, call.ServiceName)
			pj.InsertFile(ctx, parqFile.Info())

			log.Debug(ctx, "Start writing call to file [%v:%v]", parqFile.Uuid, parqFile.FileName)

			parquetCall, err := pj.pt.TransformCall(ctx, *call)
			if err != nil {
				log.Error(ctx, err, "problem during trasformation call to parquet format")
				continue
			}

			// add important parameters to index map
			parquetCall.AppendParamsToIndex(parqFile.Uuid, pj.indexmap)

			log.Debug(ctx, "Call parquet: %v", parquetCall)

			startTime = time.Now()

			err = parqFile.Write(ctx, parquetCall)

			metrics.Files.WriteCalls(startTime, pj.namespace, pj.pod.ServiceName, err)

			if err != nil {
				log.Error(ctx, err, "problem during writing call to file [%v:%v]", parqFile.Uuid, parqFile.FileName)
				continue
				// OPTIMIZE fail fast: shouldn't skip call
			}

			log.Debug(ctx, "Call was written successfully to file [%v]", parqFile.Info().FileName)
		}

	} else {
		log.Info(ctx, "There are not any calls for condition: namespace: %s, pod: %+v, timestamp: %v and table in ready status", pj.namespace, pj.pod, tableTime)
	}

	return nil
}
