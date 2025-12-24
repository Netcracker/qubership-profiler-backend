package metrics

import "github.com/prometheus/client_golang/prometheus"

var (
	// cdt_compactor_pg_operation_latency_seconds metric
	// supported labels:
	// * "operation": "read" or "write"
	// * "data": "calls" or "dumps"
	// * "result": "success" or "fail"
	// * "namespace": the processed namespace
	// * "service": the procecced service name
	operationPGLatencySeconds = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "cdt_compactor_pg_operation_latency_seconds",
			Help: "Processing postgres operation time in seconds for compactor",
		},
		[]string{operationTypeLabelName, dataTypeLabelName, resultLabelName, namespaceLabelName, serviceLabelName},
	)

	// cdt_compactor_temp_file_operation_latency_seconds metric
	// supported labels:
	// * "data": "calls" or "dumps"
	// * "result": "success" or "fail"
	// * "namespace": the processed namespace
	// * "service": the procecced service name
	operationTempLatencySeconds = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "cdt_compactor_temp_file_operation_latency_seconds",
			Help: "Processing temp file operation time in seconds for compactor",
		},
		[]string{operationTypeLabelName, dataTypeLabelName, resultLabelName, namespaceLabelName, serviceLabelName},
	)

	// cdt_compactor_s3_operation_latency_seconds metric
	// supported labels:
	// * "operation": "read" or "write"
	// * "data": "calls" or "dumps"
	// * "result": "success" or "fail"
	// * "namespace": the processed namespace
	operationS3LatencySeconds = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name: "cdt_compactor_s3_operation_latency_seconds",
			Help: "Processing s3 operation time in seconds for compactor",
		},
		[]string{operationTypeLabelName, dataTypeLabelName, resultLabelName, namespaceLabelName},
	)

	// cdt_compactor_data_rows_count metric
	// supported labels:
	// * "data": "calls" or "dumps"
	// * "namespace": the processed namespace
	dataRowsCount = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "cdt_compactor_data_rows_count",
			Help: "Processing rows count for compactor uploaded files",
		},
		[]string{dataTypeLabelName, namespaceLabelName},
	)

	// cdt_compactor_data_size_bytes metric
	// supported labels:
	// * "data": "calls" or "dumps"
	// * "namespace": the processed namespace
	dataFileSize = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "cdt_compactor_data_size_bytes",
			Help: "Processing data size for compactor uploaded files",
		},
		[]string{dataTypeLabelName, namespaceLabelName},
	)

	// cdt_compactor_processed_pods_count metric
	// supported labels:
	// * "namespace": the processed namespace
	processedPodsCount = prometheus.NewGaugeVec(
		prometheus.GaugeOpts{
			Name: "cdt_compactor_processed_pods_count",
			Help: "Processed pods count for compactor",
		},
		[]string{namespaceLabelName},
	)

	// cdt_compactor_processed_namespaces_count metric
	processedNamespacesCount = prometheus.NewGauge(
		prometheus.GaugeOpts{
			Name: "cdt_compactor_processed_namespaces_count",
			Help: "Processed namespaces count for compactor",
		},
	)
)

// Register registers custom prometheus metrics
func Register() {
	prometheus.Register(operationPGLatencySeconds)
	prometheus.Register(operationTempLatencySeconds)
	prometheus.Register(operationS3LatencySeconds)
	prometheus.Register(dataRowsCount)
	prometheus.Register(dataFileSize)
	prometheus.Register(processedPodsCount)
	prometheus.Register(processedNamespacesCount)
}
