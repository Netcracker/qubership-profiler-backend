package metrics

const (
	// operation type label for cdt_compactor_operation_latency_seconds: read or write
	operationTypeLabelName = "operation"
	operationTypeRead      = "read"
	operationTypeWrite     = "write"

	// data type label for cdt_compactor_operation_latency_seconds: calls/dumps
	dataTypeLabelName = "data"
	dataTypeCalls     = "calls"
	dataTypeDumps     = "dumps"

	// result label for cdt_compactor_operation_latency_seconds: success or fail
	resultLabelName = "result"
	resultSuccess   = "success"
	resultFail      = "fail"

	// Namespace and service labels
	namespaceLabelName = "namespace"
	serviceLabelName   = "service"
)

type (
	pgImpl     struct{}
	tempImpl   struct{}
	s3Impl     struct{}
	commonImpl struct{}
)

var (
	PG     pgOperations   = pgImpl{}
	Files  fileOperations = tempImpl{}
	S3     s3Operations   = s3Impl{}
	Common commonData     = commonImpl{}
)
