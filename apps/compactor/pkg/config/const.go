package config

import (
	"time"

	"github.com/Netcracker/qubership-profiler-backend/libs/parquet"
)

const (
	DefaultCronSchedule = "7 * * * *"
	DefaultOutputDir    = "./output"

	RowGroupSize    = 128 * 1024 * 1024       // 128Mb
	PageSize        = 4 * 1024 * 1024         // 4Mb
	CompressionType = parquet.CompressionGzip // CompressionCodec_SNAPPY?
	S3FileLifeTime  = time.Hour               // 1 hour
)
