---- for old schema

CREATE TABLE IF NOT EXISTS pod_details
(
    pod_name     text,
    namespace    text,
    service_name text,
    pod_info     text,
    rc_info      text,
    dc_info      text,
    primary key (pod_name)
);

CREATE TABLE IF NOT EXISTS active_pods
(
    active_during_hour timestamp,
    pod_name           text,
    active_since       timestamp,
    last_active        timestamp,
    primary key (active_during_hour, pod_name)
)
            WITH gc_grace_seconds = 60;

CREATE TABLE IF NOT EXISTS pod_active_time
(
    pod_name     text,
    active_since timestamp,
    last_active  timestamp,

    primary key (pod_name)
)
            WITH gc_grace_seconds = 60;

CREATE TABLE IF NOT EXISTS pod_statistics
(
    pod_name         text,
    stream_name      text,
    cur_date         timestamp,
    active_since     timestamp,
    data_accumulated bigint,
    primary key ((pod_name, stream_name), cur_date)
)
    WITH clustering order by (cur_date desc)
-- and default_time_to_live = 60
     and gc_grace_seconds = 60;


CREATE TABLE IF NOT EXISTS stream_registry
(
    pod_name            text,
    stream_name         text,
    rolling_sequence_id int,
    create_when         timestamp,
    modified_when       timestamp,
    data_accumulated    bigint,
    primary key (pod_name, stream_name, rolling_sequence_id)
)
    WITH clustering order by (stream_name asc, rolling_sequence_id desc)
     and gc_grace_seconds = 60;

CREATE TABLE IF NOT EXISTS stream_chunks
(
    pod_name            text,
    stream_name         text,
    rolling_sequence_id int,
    start_pos           bigint,
    length              bigint,
    chunk               blob,
    primary key (pod_name, stream_name, rolling_sequence_id, start_pos)
)
    WITH clustering order by (stream_name desc, rolling_sequence_id desc, start_pos asc)
     and gc_grace_seconds = 60;

CREATE TABLE IF NOT EXISTS stream_suspend
(
    pod_name     text,
    time         timestamp,
    suspend_time int,
    primary key (pod_name, time)
)
            WITH clustering order by (time asc);

CREATE TABLE IF NOT EXISTS stream_params
(
    pod_name    text,
    param_name  text,
    param_index boolean,
    param_list  boolean,
    param_order int,
    signature   text,
    primary key (pod_name, param_name)
);

CREATE TABLE IF NOT EXISTS stream_dictionary
(
    pod_name text,
    position int,
    tag      text,
    primary key (pod_name, position)
)
            WITH clustering order by (position desc);
