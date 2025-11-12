package compactor

import (
	"context"
	"fmt"
	"os"
	"strings"
	"time"

	"github.com/Netcracker/qubership-profiler-backend/libs/storage/index"
	"github.com/Netcracker/qubership-profiler-backend/libs/storage/inventory"

	"github.com/Netcracker/qubership-profiler-backend/apps/compactor/pkg/config"
	"github.com/Netcracker/qubership-profiler-backend/apps/compactor/pkg/metrics"

	"github.com/Netcracker/qubership-profiler-backend/libs/storage"
	"github.com/Netcracker/qubership-profiler-backend/libs/parquet"
	"github.com/Netcracker/qubership-profiler-backend/libs/common"
	"github.com/Netcracker/qubership-profiler-backend/libs/files"
	"github.com/Netcracker/qubership-profiler-backend/libs/log"
)

type (
	NamespaceJob struct {
		*CompactorJob
		namespace            string
		filemap              *parquet.FileMap         // parquet files for calls and dumps
		indexmap             *index.Map               // important parameters from calls which will be stored as inverted index in DB
		services             map[string]*FoundService // key - file name, value - set of services for specific file
		insertedS3FilesUUIDs map[common.UUID]bool     // set of s3 file uuids, that are inserted
		invertedIndexConfig  *index.InvertedIndexConfig
	}

	FoundService struct {
		set map[string]bool
	}
)

func NewNamespaceJob(ctx context.Context, cj *CompactorJob, namespace string) *NamespaceJob {
	log.Debug(ctx, "Create new NamespaceJob for namespace %s", namespace)

	// convert []string → map[string]bool
	paramSet := make(map[string]bool, len(config.Cfg.InvertedIndexConfig.Params))
	for _, p := range config.Cfg.InvertedIndexConfig.Params {
		paramSet[p] = true
	}

	return &NamespaceJob{
		cj,
		namespace,
		parquet.NewFileMap(config.Cfg.OutputDir, *config.Cfg.Parquet),
		index.NewMap(paramSet),
		make(map[string]*FoundService),
		make(map[common.UUID]bool),
		config.Cfg.InvertedIndexConfig,
	}
}

func (nsj *NamespaceJob) AddService(ctx context.Context, fileName, service string) {
	var fs *FoundService
	var ok bool
	if fs, ok = nsj.services[fileName]; !ok {
		fs = newFoundServices()
		nsj.services[fileName] = fs
	}

	fs.add(ctx, service)
}

// executeNamespaceJob orchestrates the workflow execution for a specific namespace, including file operations and database updates.
func (nsj *NamespaceJob) executeNamespaceJob(ctx context.Context) error {
	startTime := time.Now()
	log.Info(ctx, "Start workflow execution for namespace: %s", nsj.namespace)

	if err := nsj.runCompaction(ctx); err != nil {
		log.Error(ctx, err, "Error during compation calls %w", err)
	}

	// close files for current namespace
	if err := nsj.closeFiles(ctx); err != nil {
		log.Error(ctx, err, "cannot close parquet files")
	}

	if err := nsj.updateFileInfo(ctx); err != nil {
		log.Error(ctx, err, "problem during update file information")
	}

	if _, _, err := nsj.UploadFiles(ctx); err != nil {
		log.Error(ctx, err, "cannot upload files")
	}

	log.Debug(ctx, "Index map: %v", nsj.indexmap.Indexes)

	// insert index map to postgres.
	if err := nsj.InsertInvertIndex(ctx); err != nil {
		log.Error(ctx, err, "cannot insert inverted indexes")
	}

	log.Info(ctx, "Workflow execution is finished for namespace: %s. [Execution time - %v]", nsj.namespace, time.Since(startTime))

	return nil
}

// runCompaction executes the main compaction logic for a specific namespace.
// It loads all distinct pods from the "pods" table where:
//   - namespace equals current namespace
//   - pod's last_active > current job timestamp (cj.ts)
//
// Then, for each such pod, it initializes and runs a pod-specific compaction job (PodJob),
// which will handle merging data from calls, traces, dumps, etc.
// Metrics are updated after all pods are processed.
func (nsj *NamespaceJob) runCompaction(ctx context.Context) error {
	startTime := time.Now()
	log.Info(ctx, "Start execution RunCallsCompaction for %s", nsj.namespace)

	// Step 1: Load all pods in this namespace with last_active > cj.ts
	pods, err := nsj.Postgres.GetUniquePodsForNamespaceActiveAfter(ctx, nsj.namespace, nsj.ts)
	if err != nil {
		log.Error(ctx, err, "Error during getting unique pods from Postgres")
		return err
	}

	// Step 2: For each pod, run compaction logic (calls, traces, dumps, etc.)
	log.Info(ctx, "Scheduling %d pod jobs", len(pods))
	for _, pod := range pods {
		pj := NewPodJob(ctx, nsj, pod)
		if err := pj.runPodCompaction(ctx); err != nil {
			log.Error(ctx, err, err.Error())
			return err
		}
	}

	// Step 3: Update metrics for the number of processed pods
	metrics.Common.UpdatePodsCount(len(pods), nsj.namespace)

	log.Info(ctx, "RunCallsCompaction is finished for %s. [Execution time - %v]", nsj.namespace, time.Since(startTime))
	return nil
}

func (nsj *NamespaceJob) closeFiles(ctx context.Context) error {
	// close all parquet files (calls and dumps)
	log.Debug(ctx, "closing parquet files for namespace: %s", nsj.namespace)
	if err := nsj.filemap.CloseAllFiles(); err != nil {
		log.Error(ctx, err, "problem during closing parquet files.")
		return err
	}

	log.Info(ctx, "all parquet files are closed.")
	return nil
}

func (nsj *NamespaceJob) updateFileInfo(ctx context.Context) error {
	// Update info about files in Database
	list := nsj.filemap.Files
	log.Debug(ctx, "Start updating files info in s3 files table in database. len(files): %d", len(list))

	var err error
	for _, file := range list {
		// prepare services for file
		services := make([]string, 0)
		if fs, ok := nsj.services[file.FileName]; ok {
			for service := range fs.set {
				services = append(services, service)
			}
		}

		var size int64
		size, err = files.FileSize(ctx, file.LocalFilePath)
		if err != nil {
			log.Error(ctx, err, "Cannot get size for file %s", file.FileName)
		}

		file.UpdateLocalInfo(services, size)

		if err = nsj.Postgres.UpdateS3File(ctx, file.S3FileInfo); err != nil {
			log.Error(ctx, err, "Problem during updating information in s3 files table.")
		}

		log.Info(ctx, "File '%s' {%d bytes, %d rows, %d fail rows, %d services}",
			file.Info().FileName, file.Info().FileSize, file.Info().RowsCount, file.FailRowsCount, file.Info().Services.Size())
	}

	if err == nil {
		log.Info(ctx, "Files information has been successfully updated for %d files", len(list))
	}

	return err
}

func (nsj *NamespaceJob) UploadFiles(ctx context.Context) (c, total int, err error) {
	startTime := time.Now()
	log.Info(ctx, "Start uploading files for %s", nsj.namespace)

	bucketDir := common.DateHour(nsj.ts)

	list, err := files.List(ctx, config.Cfg.OutputDir)
	if err != nil {
		log.Error(ctx, err, "cannot read output directory %s", config.Cfg.OutputDir)
		return 0, -1, err
	}

	var totalSize int64
	for _, file := range list {
		origin, ok := nsj.filemap.Get(strings.ReplaceAll(file.Name(), ".parquet", ""))
		if !ok {
			log.Info(ctx, "Don't have information in cache about file '%v'", file.Name())
			continue
		}

		fileInfo := TransferFileInfo{
			origin.S3FileInfo,
			file, nsj.filemap.CurrentDir,
			fmt.Sprintf("%s/%s", nsj.filemap.CurrentDir, file.Name()),
			fmt.Sprintf("%s/%s", bucketDir, file.Name()),
		}

		fileSize, ok := nsj.uploadFile(ctx, fileInfo)
		if ok {
			c++
			totalSize += fileSize
		}
	}

	log.Info(ctx, "[%s] Upload %d files (%d Mb) in directory '%s' [in %v]", nsj.namespace,
		len(list), totalSize/1024/1024, nsj.filemap.CurrentDir, time.Since(startTime))
	return c, len(list), err
}

func (nsj *NamespaceJob) uploadFile(ctx context.Context, file TransferFileInfo) (int64, bool) {
	var err error

	info := file.PrepareInfo(ctx, nsj.ts)

	err = nsj.Postgres.UpdateS3File(ctx, *info)
	if err != nil {
		log.Error(ctx, err, "error during updating db for '%s'", file.localFilePath)
	}

	startTime := time.Now()

	fileInfo, err := nsj.MinioClient.PutObject(ctx, file.localFilePath, file.bucketPath)

	if info.Type == model.FileCalls {
		metrics.S3.WriteCalls(startTime, info.Namespace, err)
	} else if info.Type == model.FileDumps {
		metrics.S3.WriteDumps(startTime, info.Namespace, err)
	} else {
		log.Warning(ctx, "found unsupported file type for metrics: %s", info.Type)
	}

	if err != nil {
		log.Error(ctx, err, "error during uploading '%s'", file.localFilePath)
		return 0, false
	}

	if info.Type == model.FileCalls {
		metrics.S3.AddCallsDataRowsCount(info.RowsCount, info.Namespace)
		metrics.S3.AddCallsDataSizeBytes(info.FileSize, info.Namespace)
	} else if info.Type == model.FileDumps {
		metrics.S3.AddDumpsDataRowsCount(info.RowsCount, info.Namespace)
		metrics.S3.AddDumpsDataSizeBytes(info.FileSize, info.Namespace)
	}

	// info.UpdateRemoteInfo(file.bucketPath)
	info.UpdateRemoteInfo(fileInfo.Size)

	err = nsj.Postgres.UpdateS3File(ctx, *info)
	if err != nil {
		log.Error(ctx, err, "error during updating db for '%s'", file.localFilePath)
	}
	return fileInfo.Size, true
}

func (nsj *NamespaceJob) InsertFile(ctx context.Context, file inventory.S3FileInfo) error {
	fUuid := file.Uuid.Val
	if _, ok := nsj.insertedS3FilesUUIDs[fUuid]; !ok {
		if err := nsj.Postgres.InsertS3File(ctx, file); err != nil {
			log.Error(ctx, err, "Error during saving s3 file info to db")
			return err
		}
		nsj.insertedS3FilesUUIDs[fUuid] = true
	}
	return nil
}

// InsertInvertIndex persists the in-memory inverted index (nsj.indexmap)
// into the database using the configured time granularity.
// The timestamp is truncated to match the granularity window
// so that each index table corresponds to a specific time bucket.
func (nsj *NamespaceJob) InsertInvertIndex(ctx context.Context) error {
	if err := nsj.Postgres.InsertInvertedIndex(ctx, nsj.ts.Truncate(nsj.invertedIndexConfig.Granularity), nsj.indexmap); err != nil {
		log.Error(ctx, err, "problem during insertion index map to Database.")
		return err
	}
	return nil
}

func newFoundServices() *FoundService {
	return &FoundService{
		make(map[string]bool),
	}
}

func (fs *FoundService) add(ctx context.Context, service string) {
	if _, ok := fs.set[service]; ok {
		log.Debug(ctx, "service %s already exists in found services set. Skip", service)
		return
	}

	fs.set[service] = true
}

type (
	TransferFileInfo struct {
		origin        inventory.S3FileInfo
		file          os.DirEntry
		localDir      string
		localFilePath string
		bucketPath    string
	}
)

func (fi *TransferFileInfo) PrepareInfo(ctx context.Context, t time.Time) *inventory.S3FileInfo {
	fi.origin.Status = model.FileTransferring
	return &fi.origin
}
