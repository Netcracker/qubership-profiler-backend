package compactor

import (
	"context"
	"fmt"
	"time"

	"github.com/Netcracker/qubership-profiler-backend/libs/storage/parquet"

	"github.com/Netcracker/qubership-profiler-backend/libs/storage"
	"github.com/Netcracker/qubership-profiler-backend/libs/pg"
	"github.com/Netcracker/qubership-profiler-backend/libs/log"
)

const (
	UndefinedTag = "undefined"
)

type ParquetTransformer struct {
	pgClient  pg.DbClient
	DictCache map[int]string
}

func (pt *ParquetTransformer) TransformCall(ctx context.Context, call model.CallWithTraces) (*parquet.CallParquet, error) {
	callParquet := &parquet.CallParquet{
		Time:              call.Time.UnixMilli(),
		CpuTime:           call.CpuTime,
		WaitTime:          call.WaitTime,
		MemoryUsed:        call.MemoryUsed,
		Duration:          call.Duration,
		NonBlocking:       call.NonBlocking,
		QueueWaitDuration: call.QueueWaitDuration,
		SuspendDuration:   call.SuspendDuration,
		Calls:             call.Calls,
		Transactions:      call.Transactions,
		LogsGenerated:     call.LogsGenerated,
		LogsWritten:       call.LogsWritten,
		FileRead:          call.FileRead,
		FileWritten:       call.FileWritten,
		NetRead:           call.NetRead,
		NetWritten:        call.NetWritten,
		Namespace:         call.Namespace,
		ServiceName:       call.ServiceName,
		PodName:           call.PodName,
		RestartTime:       call.RestartTime.UnixMilli(),
		TraceId:           fmt.Sprintf("%d_%d_%d", call.TraceFileIndex, call.BufferOffset, call.RecordIndex),
		Trace:             string(call.Trace),
	}

	callParquet.Method = pt.transformMethod(ctx, call)
	callParquet.Params = pt.transformParams(ctx, call)

	return callParquet, nil
}

func (pt *ParquetTransformer) preparePodIdWithPodName(ctx context.Context, podName string, restartTime time.Time) string {
	return fmt.Sprintf("%s_%d", podName, restartTime.UnixMilli())
}

func (pt *ParquetTransformer) transformMethod(ctx context.Context, call model.CallWithTraces) string {
	method, ok := pt.DictCache[call.Method]
	if !ok {
		podId := pt.preparePodIdWithPodName(ctx, call.PodName, call.RestartTime)
		method = pt.getTagByPositionAndPodId(ctx, call.Method, podId)
		pt.DictCache[call.Method] = method
	}

	return method
}

func (pt *ParquetTransformer) transformParams(ctx context.Context, call model.CallWithTraces) parquet.Parameters {
	params := parquet.Parameters{}
	for key, value := range call.Params {
		paramName, ok := pt.DictCache[key]
		if !ok {
			podId := pt.preparePodIdWithPodName(ctx, call.PodName, call.RestartTime)
			paramName = pt.getTagByPositionAndPodId(ctx, key, podId)
			pt.DictCache[call.Method] = paramName
		}

		params.AddVal(paramName, value...)
	}

	return params
}

func (pt *ParquetTransformer) getTagByPositionAndPodId(ctx context.Context, position int, podId string) string {
	tag, err := pt.pgClient.GetTagByPositionAndPodId(ctx, position, podId)
	if err != nil || tag == "" {
		log.Error(ctx, err, "cannot get tag by position or tag is empty")
		tag = UndefinedTag
	}

	return tag
}

func (pt *ParquetTransformer) TransformDump(ctx context.Context, dump *model.Dump) (*parquet.DumpParquet, error) {
	return &parquet.DumpParquet{
		Time:        dump.CreatedTime.UnixMilli(),
		Namespace:   dump.Namespace,
		ServiceName: dump.ServiceName,
		PodName:     dump.PodName,
		RestartTime: dump.RestartTime.UnixMilli(),
		PodType:     string(dump.PodType),
		DumpType:    string(dump.DumpType),
		BytesSize:   dump.BytesSize,
		Info:        dump.Info,
		BinaryData:  string(dump.BinaryData),
	}, nil
}
