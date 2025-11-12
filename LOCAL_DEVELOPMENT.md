# Local Development Guide

This guide explains how to run the Cloud Profiler services locally using Docker Compose instead of Kubernetes.

## Prerequisites

- Docker and Docker Compose installed
- Java 17+ (for running the collector app locally)
- Maven (or use the included Maven wrapper `./mvnw`)

## Quick Start

### 1. Start the required services (PostgreSQL and MinIO)

```bash
./scripts/local-dev.sh start
```

This will start:
- PostgreSQL on port 5432
- MinIO on port 9000 (API) and 9001 (Console)
- Automatically create the required S3 bucket

### 2. Run the collector application locally

In a new terminal:

```bash
cd apps/collector
./mvnw quarkus:dev -Dquarkus.profile=local
```

The collector will be available at http://localhost:8080

## Docker Compose Services

The `docker-compose.yml` file includes:

- **postgres**: PostgreSQL 15 database
  - Port: 5432
  - Credentials: postgres/postgres
  - Database: cdt_test

- **minio**: S3-compatible object storage
  - API Port: 9000
  - Console Port: 9001 (http://localhost:9001)
  - Credentials: test/test12345
  - Bucket: profiler (auto-created)

- **minio-init**: Automatically creates the S3 bucket

- **collector** (optional profile): The collector application
  - Use `docker-compose --profile app up` to run it in Docker

## Available Commands

```bash
# Start only infrastructure services
./scripts/local-dev.sh start

# Start everything including the app in Docker
./scripts/local-dev.sh start-with-app

# Check service status
./scripts/local-dev.sh status

# View logs
./scripts/local-dev.sh logs            # All services
./scripts/local-dev.sh logs postgres   # Specific service

# Stop services
./scripts/local-dev.sh stop

# Stop and remove all data
./scripts/local-dev.sh clean
```

## Direct Docker Compose Commands

You can also use docker-compose directly:

```bash
# Start services with health monitoring
docker-compose up -d

# Check health status
docker-compose ps

# View real-time logs
docker-compose logs -f

# Stop everything
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## Configuration

The local configuration is in `apps/collector/src/main/resources/application-local.properties`.

Key settings:
- PostgreSQL: localhost:5432/cdt_test
- MinIO: http://localhost:9000
- S3 Bucket: profiler

## Docker Compose Features

The setup uses Docker Compose v3.8 features for better local development:

1. **Health Checks**: Each service has health checks configured
2. **Dependencies**: Services wait for dependencies to be healthy
3. **Auto-initialization**: MinIO bucket is created automatically
4. **Profiles**: Optional services can be enabled with profiles
5. **Networks**: All services use a common network for communication

## Monitoring

Docker Compose automatically monitors service health. Services will only start when their dependencies are healthy:

- PostgreSQL: Checks with `pg_isready`
- MinIO: Checks the `/minio/health/ready` endpoint
- minio-init: Waits for MinIO to be healthy before creating the bucket
- collector (when using profile): Waits for both PostgreSQL and MinIO to be healthy

## Troubleshooting

If services fail to start:

1. Check if ports are already in use:
   ```bash
   lsof -i :5432  # PostgreSQL
   lsof -i :9000  # MinIO
   ```

2. View service logs:
   ```bash
   docker-compose logs postgres
   docker-compose logs minio
   ```

3. Reset everything:
   ```bash
   ./scripts/local-dev.sh clean
   ./scripts/local-dev.sh start
   ```

## Why Docker Compose?

This approach is preferred for local development because:

- **Simplicity**: No need for Kubernetes knowledge or tools
- **Resource Efficiency**: Much lighter than running a local K8s cluster
- **Standard Practice**: Docker Compose is the industry standard for local development
- **Quick Setup**: Get running in seconds vs. minutes with K8s
- **Easy Cleanup**: Simple commands to reset everything

## Next Steps

After services are running, you can:

1. Access MinIO Console at http://localhost:9001
2. Connect to PostgreSQL at localhost:5432
3. Run the collector app with hot-reload using Quarkus dev mode
4. Develop and test without needing a full Kubernetes environment