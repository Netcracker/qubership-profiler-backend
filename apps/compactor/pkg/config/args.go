package config

import (
	"os"

	"github.com/spf13/pflag"
)

// ----------------------------------------------------------------------------------
// command line options
var (
	cronRun          *bool
	timeRunStr       *string
	tableStatus      *string
	metricsAddress   *string
	pgConnectionUrl  *string
	pgSslMode        *string
	pgPathToCA       *string
	minioEndpoint    *string
	minioAccessKey   *string
	minioSecretKey   *string
	minioBucket      *string
	minioInsecureSSL *bool
	minioUseSSL      *bool
	minioPathToCA    *string
)

func InitFlags(flags *pflag.FlagSet) {
	cronRun = flags.Bool("run.cron", false, "Run comparator with cron")
	timeRunStr = flags.String("run.time", "", "Run time in yyyy/mm/dd/hh format. If specified, compactor runs for this time")
	tableStatus = flags.String("ru.status", "", "Run compactor for specific table status")
	metricsAddress = flags.String("bind_metrics_address", "0.0.0.0:6060", "Compactor bind metrics address")
	pgConnectionUrl = flags.String("pg.url", "", "Full connection string to Postgres instance")
	pgSslMode = flags.String("pg.ssl_mode", "prefer", "SSL mode for PG connections. Possible values: disable, allow, prefer, require, verify-ca, verify-full")
	pgPathToCA = flags.String("pg.ca_file", "", "Path to custom CA certificate for PG")
	minioEndpoint = flags.String("minio.url", os.Getenv("MINIO_ENDPOINT"), "Url to Minio instance")
	minioAccessKey = flags.String("minio.key", os.Getenv("MINIO_ACCESS_KEY_ID"), "Minio access key")
	minioSecretKey = flags.String("minio.secret", os.Getenv("MINIO_SECRET_ACCESS_KEY"), "Minio secret key")
	minioBucket = flags.String("minio.bucket", os.Getenv("MINIO_BUCKET"), "Bucket in Minio")
	minioInsecureSSL = flags.Bool("minio.insecure", false, "Use flag insecure for Minio")
	minioUseSSL = flags.Bool("minio.use_ssl", false, "Use TLS access for Minio")
	minioPathToCA = flags.String("minio.ca_file", "", "Path to custom CA certificate for Minio")
}
