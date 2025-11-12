#!/bin/bash

# Cloud Profiler Local Development Script
# Simple wrapper around docker-compose commands

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "$PROJECT_ROOT"

case "${1:-}" in
    start)
        echo "Starting PostgreSQL and MinIO services..."
        docker-compose up -d postgres minio minio-init
        echo ""
        echo "Services starting up. Docker Compose will handle health checks."
        echo "View status: docker-compose ps"
        echo "View logs: docker-compose logs -f"
        echo ""
        echo "Service URLs:"
        echo "  PostgreSQL: localhost:5432 (postgres/postgres)"
        echo "  MinIO API: http://localhost:9000"
        echo "  MinIO Console: http://localhost:9001 (test/test12345)"
        ;;

    start-with-app)
        echo "Starting all services including collector app..."
        docker-compose --profile app up -d
        echo "Services started. View logs: docker-compose logs -f"
        ;;

    stop)
        echo "Stopping services..."
        docker-compose --profile app --profile monitor down --remove-orphans
        ;;

    clean)
        echo "Stopping services and removing volumes..."
        docker-compose --profile app --profile monitor down -v --remove-orphans
        ;;

    status)
        docker-compose ps
        echo ""
        echo "Health status:"
        docker-compose --profile monitor up healthcheck
        ;;

    logs)
        docker-compose logs -f ${2:-}
        ;;

    *)
        echo "Usage: $0 {start|start-with-app|stop|clean|status|logs [service]}"
        echo ""
        echo "Commands:"
        echo "  start           - Start only PostgreSQL and MinIO"
        echo "  start-with-app  - Start everything including collector app"
        echo "  stop            - Stop all services"
        echo "  clean           - Stop services and remove data volumes"
        echo "  status          - Show service status and health"
        echo "  logs [service]  - Follow logs (optionally for specific service)"
        echo ""
        echo "Run collector locally (with services running):"
        echo "  cd apps/collector"
        echo "  ./mvnw quarkus:dev -Dquarkus.profile=local"
        exit 1
        ;;
esac
