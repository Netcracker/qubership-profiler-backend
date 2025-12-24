-- Get Unique Namespaces
SELECT DISTINCT namespace FROM pods;

-- Get Calls With Trace
SELECT c.*, t.trace
	FROM calls_%TIMESTAMP% c
	LEFT JOIN traces_%TIMESTAMP% t
	ON c.pod = t.pod AND c.restart_time = t.restart_time AND c.trace_file_index = t.trace_file_index AND c.buffer_offset = t.buffer_offset AND c.record_index = t.record_index
	WHERE c.namespace = $1 AND c.service_name = $2 AND c.pod = $3
	ORDER BY service_name ASC, pod ASC, time DESC;

-- Get Unique Pods
SELECT DISTINCT service_name, pod FROM %PODS_TABLE% WHERE namespace = $1 AND active_since > %PREVIOUS_HOUR% ORDER BY service_name ASC, pod ASC;

-- Insert To S3 Table
INSERT INTO %S3_FILES_TABLE% (
    uuid, ts, file_type, dump_type, namespace, duration_range, file_name, status, services, 
    created_time, api_version, rows_count, file_size, remote_storage_path, local_file_path) 
    VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15);

-- Update S3 Table
UPDATE %S3_FILES_TABLE% SET
    status=$1, services=$2, rows_count=$3, file_size=$4, remote_storage_path=$5
    WHERE uuid=$6;

-- Update temp_table_inventory
UPDATE %TEMP_TABLE_INVENTORY% SET status=$1 WHERE uuid=$2;

-- Insert to Inverted Index table
INSERT INTO %INVERTED_INDEX_TABLE% (value, file_id) VALUES ($1, $2);

-- Get tables from Inventory table with specific status
SELECT * FROM %TEMP_TABLE_INVENTORY% WHERE status = $1

