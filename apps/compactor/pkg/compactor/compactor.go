package compactor

import (
	"context"
	"time"

	"github.com/Netcracker/qubership-profiler-backend/libs/storage/index"

	"github.com/Netcracker/qubership-profiler-backend/apps/compactor/pkg/config"

	"github.com/Netcracker/qubership-profiler-backend/libs/storage"
	"github.com/Netcracker/qubership-profiler-backend/libs/pg"
	"github.com/Netcracker/qubership-profiler-backend/libs/s3"
	"github.com/Netcracker/qubership-profiler-backend/libs/log"
)

type Compactor struct {
	Postgres            pg.DbClient
	MinioClient         *s3.MinioClient
	InvertedIndexConfig *index.InvertedIndexConfig
}

func NewCompactor(ctx context.Context) (*Compactor, error) {
	postgres, err := pg.NewClient(ctx, *config.Cfg.Postgres)
	if err != nil {
		log.Error(ctx, err, "cannot create new PostgresDB client")
		return nil, err
	}

	mClient, err := s3.NewClient(ctx, *config.Cfg.S3)
	if err != nil {
		log.Error(ctx, err, "cannot create new minio client")
		return nil, err
	}

	return &Compactor{
		Postgres:            postgres,
		MinioClient:         mClient,
		InvertedIndexConfig: config.Cfg.InvertedIndexConfig,
	}, nil
}

// Execute runs workflow for previous hour (time is previous hour, tables status is ready)
func (c *Compactor) Execute(ctx context.Context) error {

	// create compactor job for previous hour
	cj, err := NewCompactorJob(ctx, c, time.Now().UTC().Truncate(time.Hour).Add(-time.Hour), model.TableStatusReady)
	if err != nil {
		log.Error(ctx, err, "cannot create new compactor job.")
	}

	if err := cj.executeCompactorJob(ctx); err != nil {
		log.Error(ctx, err, "problem during execution compactor job")
		return err
	}

	return nil
}

// ExecuteForSpecificTime runs workflow for time, which specify in argument (tables status is ready)
func (c *Compactor) ExecuteForSpecificTime(ctx context.Context, ts time.Time) error {

	cj, err := NewCompactorJob(ctx, c, ts, model.TableStatusReady)
	if err != nil {
		log.Error(ctx, err, "cannot create new compactor job.")
	}

	if err := cj.executeCompactorJob(ctx); err != nil {
		log.Error(ctx, err, "problem during execution compactor job")
		return err
	}

	return nil
}

// ExecuteForSpecificTimeAndStatus runs workflow for time and status, which specify in argument
func (c *Compactor) ExecuteForSpecificTimeAndStatus(ctx context.Context, ts time.Time, status model.TableStatus) error {

	cj, err := NewCompactorJob(ctx, c, ts, status)
	if err != nil {
		log.Error(ctx, err, "cannot create new compactor job.")
	}

	if err := cj.executeCompactorJob(ctx); err != nil {
		log.Error(ctx, err, "problem during execution compactor job")
		return err
	}

	return nil
}
