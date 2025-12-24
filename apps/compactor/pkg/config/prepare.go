package config

import (
	"context"
	"fmt"
	"github.com/Netcracker/qubership-profiler-backend/libs/storage/index"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/Netcracker/qubership-profiler-backend/libs/parquet"
	"github.com/Netcracker/qubership-profiler-backend/libs/pg"
	"github.com/Netcracker/qubership-profiler-backend/libs/s3"

	"github.com/Netcracker/qubership-profiler-backend/libs/common"
	"github.com/Netcracker/qubership-profiler-backend/libs/log"
)

func prepareConfig(ctx context.Context) (*Config, error) {
	var timeRun *time.Time = nil
	if *timeRunStr != "" {
		if t, err := common.ParseHourTime(*timeRunStr); err != nil {
			log.Error(ctx, err, "error parsing run-time parameter")
			return nil, fmt.Errorf("invalid date format for 'run.time'")
		} else {
			timeRun = &t
		}
	}

	cronSchedule := prepareCronSchedule(ctx, os.Getenv("CRON_SCHEDULE"))
	outputDir := prepareOutputDir(ctx, os.Getenv("OUTPUT_DIR"))
	if err := os.MkdirAll(outputDir, 0777); err != nil && !os.IsExist(err) {
		log.Error(ctx, err, "cannot create output directory %s", outputDir)
		return nil, err
	}

	s3Params, err := prepareS3Config(ctx)
	if err != nil {
		return nil, err
	}
	pgParams, err := preparePostgresConfig(ctx)
	if err != nil {
		return nil, err
	}
	parquetParams := prepareParquetConfig()

	invertedIndexConfig, err := prepareInvertedIndexConfig(ctx)
	if err != nil {
		return nil, err
	}

	cfg := &Config{
		CronRun:             *cronRun,
		CronJobSchedule:     cronSchedule,
		TimeRun:             timeRun,
		TableStatus:         *tableStatus,
		OutputDir:           outputDir,
		MetricsAddress:      *metricsAddress,
		S3:                  s3Params,
		Postgres:            pgParams,
		Parquet:             parquetParams,
		InvertedIndexConfig: invertedIndexConfig,
	}
	return cfg, nil
}

func prepareOutputDir(ctx context.Context, outputDir string) string {
	if outputDir == "" {
		log.Info(ctx, "Env variable OUTPUT_DIR is empty. Default output directory is '%s'", DefaultOutputDir)
		outputDir = filepath.Join(DefaultOutputDir)
	}
	return outputDir
}

func prepareCronSchedule(ctx context.Context, cronSchedule string) string {
	if cronSchedule == "" {
		log.Info(ctx, "Env variable CRON_SCHEDULE is empty. Default cron schedule is '%s'", DefaultCronSchedule)
		cronSchedule = DefaultCronSchedule
	}
	return cronSchedule
}

func prepareS3Config(_ context.Context) (*s3.Params, error) {

	s3params := &s3.Params{
		Endpoint:        *minioEndpoint,
		AccessKeyID:     *minioAccessKey,
		SecretAccessKey: *minioSecretKey,
		InsecureSSL:     *minioInsecureSSL,
		UseSSL:          *minioUseSSL,
		BucketName:      *minioBucket,
		CAFile:          *minioPathToCA,
	}

	if s3params.IsEmpty() {
		return nil, fmt.Errorf("no credentials for S3. " +
			"In order to upload data to S3 provide minio.url/minio.key/minio.secret cli arguments" +
			" or env variables MINIO_ENDPOINT/MINIO_ACCESS_KEY_ID/MINIO_SECRET_ACCESS_KEY")
	}

	s3params.Prepare()

	if err := s3params.IsValid(); err != nil {
		return nil, err
	}

	return s3params, nil
}

func preparePostgresConfig(_ context.Context) (*pg.Params, error) {
	connStr := *pgConnectionUrl

	if connStr == "" {
		url := os.Getenv("POSTGRES_URL")
		user := os.Getenv("POSTGRES_USER")
		password := os.Getenv("POSTGRES_PASSWORD")
		dbName := os.Getenv("POSTGRES_DB")

		if url == "" || user == "" || password == "" || dbName == "" {
			return nil, fmt.Errorf("no credentials for Postgres. " +
				"In order to work with Postgres DB provide pg.url cli arguments or env variables POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_URL")
		}

		connStr = fmt.Sprintf("postgres://%s:%s@%s/%s", user, password, url, dbName)
	}

	pgParams := &pg.Params{
		ConnStr: connStr,
		SSLMode: *pgSslMode,
		CAFile:  *pgPathToCA,
	}

	if err := pgParams.IsValid(); err != nil {
		return nil, err
	}

	return pgParams, nil
}

func prepareParquetConfig() *parquet.Params {
	return &parquet.Params{
		RowGroupSize:    RowGroupSize,
		PageSize:        PageSize,
		CompressionType: CompressionType,
		S3FileLifeTime:  S3FileLifeTime,
	}
}

// prepareInvertedIndexConfig loads and parses the inverted index configuration
// from environment variables. If a variable is not set, a default constant is used.
// The result includes granularity, lifetime, and a list of tracked index parameters.
func prepareInvertedIndexConfig(ctx context.Context) (*index.InvertedIndexConfig, error) {
	// Load granularity (e.g. "30m", "1h") from env, fallback to default if unset
	granularityStr := os.Getenv("INVERTED_INDEX_GRANULARITY")
	var granularity time.Duration
	if granularityStr == "" {
		granularity = pg.InvertedIndexGranularity
		log.Info(ctx, "Env variable INVERTED_INDEX_GRANULARITY is empty. Default value will be used: %s", granularity)
	} else {
		var err error
		granularity, err = common.ParseGranularity(granularityStr)
		if err != nil {
			return nil, fmt.Errorf("invalid granularity duration format: %v", err)
		}
	}

	// Load lifetime (e.g. "24h", "14d") from env, fallback to default if unset
	lifetimeStr := os.Getenv("INVERTED_INDEX_LIFETIME")
	var lifetime time.Duration
	if lifetimeStr == "" {
		lifetime = pg.InvertedIndexLifetime
		log.Info(ctx, "Env variable INVERTED_INDEX_LIFETIME is empty. Default value will be used: %s", lifetime)
	} else {
		var err error
		lifetime, err = common.ParseLifetime(lifetimeStr)
		if err != nil {
			return nil, fmt.Errorf("invalid lifetime duration format: %v", err)
		}
	}

	// Load a comma-separated list of parameter names to index
	paramsRaw := os.Getenv("INVERTED_INDEX_PARAMS")
	if paramsRaw == "" {
		paramsRaw = pg.InvertedIndexParams
		log.Info(ctx, "Env variable INVERTED_INDEX_PARAMS is empty. Default value is '%s'", paramsRaw)
	}
	params := strings.Split(paramsRaw, ",")

	prefixes := make([]string, 0, len(params))
	for _, p := range params {
		prefix, err := common.NormalizeParam(p)
		if err != nil {
			return nil, fmt.Errorf("invalid param format: %w", err)
		}
		prefixes = append(prefixes, prefix)
	}

	// Construct final config object
	config := &index.InvertedIndexConfig{
		Granularity: granularity,
		Lifetime:    lifetime,
		Params:      params,
		Prefixes:    prefixes,
	}

	return config, nil
}
