package config

import (
	"context"
	"github.com/Netcracker/qubership-profiler-backend/libs/storage/index"
	"time"

	"github.com/Netcracker/qubership-profiler-backend/libs/parquet"
	"github.com/Netcracker/qubership-profiler-backend/libs/pg"
	"github.com/Netcracker/qubership-profiler-backend/libs/s3"
)

var Cfg *Config

type (
	Config struct {
		CronRun             bool
		CronJobSchedule     string
		TimeRun             *time.Time
		TableStatus         string
		OutputDir           string
		MetricsAddress      string
		Parquet             *parquet.Params
		S3                  *s3.Params
		Postgres            *pg.Params
		InvertedIndexConfig *index.InvertedIndexConfig
	}
)

func PrepareConfig(ctx context.Context) (err error) {
	Cfg, err = prepareConfig(ctx)
	return err
}
