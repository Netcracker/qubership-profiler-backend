---- for test keyspace

CREATE KEYSPACE IF NOT EXISTS cdt
            WITH replication = {'class':'SimpleStrategy', 'replication_factor':1};

CREATE TABLE IF NOT EXISTS cdt.db_version
(
    version int,
    primary key (version)
);

