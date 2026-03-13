# Cloud Profiler Dumps Collector Makefile
# Go application with Docker build

.PHONY: help build clean docker-build docker-build-scripts docker-tag archive test test-scripts test-docker-scripts run

# Variables
ARTIFACT_NAME := cloud-profiler-dumps-collector
BUILD_DIR := build
OUTPUT_DIR := $(BUILD_DIR)/_output
SAAS_MANIFEST_DIR := deployments
DOCKER_IMAGE := $(ARTIFACT_NAME)
# Image name for Dockerfile.scripts (from .qubership/docker-build-config.cfg)
DOCKER_IMAGE_SCRIPTS := qubership-profiler-dumps-collector-scripts
BINARY_NAME := prf_dump_writer

# Build settings - can be overridden for cross-compilation
GOOS ?= $(shell go env GOOS)
GOARCH ?= $(shell go env GOARCH)

# Default target
help:
	@echo "Available targets:"
	@echo "  build               - Build the Go application"
	@echo "  clean               - Clean build artifacts"
	@echo "  docker-build        - Build Docker image (full: Nginx + Go server)"
	@echo "  docker-build-scripts - Build Dockerfile.scripts image (Nginx + cleanup, no Postgres required)"
	@echo "  docker-tag          - Tag Docker image (requires DOCKER_NAMES variable)"
	@echo "  archive             - Create deployment archive"
	@echo "  test                - Run Go tests"
	@echo "  test-scripts        - Run Go tests for Dockerfile.scripts (envconfig, no PG params)"
	@echo "  test-docker-scripts - Build and run Dockerfile.scripts container without PG (requires Docker)"
	@echo "  run                 - Run the application locally"
	@echo "  all                 - Build, docker-build, and archive"

# Clean build artifacts
clean:
	@echo "==> Removing old artifacts"
	rm -rf $(BUILD_DIR)
	rm -f $(BINARY_NAME)

# Build Go application
build: clean
	@echo "==> Building Go application for $(GOOS)/$(GOARCH)..."
	@if command -v go >/dev/null 2>&1; then \
		CGO_ENABLED=0 GOOS=$(GOOS) GOARCH=$(GOARCH) go build -a -o $(BINARY_NAME) main.go; \
	else \
		echo "Go not found, skipping Go build. Use docker-build to build with Docker."; \
	fi

# Run tests
test:
	@echo "==> Running tests..."
	@if command -v go >/dev/null 2>&1; then \
		go test ./...; \
	else \
		echo "Go not found, skipping tests."; \
	fi

# Run tests relevant to Dockerfile.scripts (deploy without Postgres params)
test-scripts:
	@echo "==> Running Dockerfile.scripts tests..."
	@if command -v go >/dev/null 2>&1; then \
		go test ./pkg/envconfig/... -v -run 'DockerfileScripts|PostgresParamNames|InitConfig'; \
	else \
		echo "Go not found, skipping tests."; \
	fi

# Build Dockerfile.scripts image (from repo root; run from apps/dumps-collector)
docker-build-scripts:
	@echo "==> Building Dockerfile.scripts image ($(DOCKER_IMAGE_SCRIPTS))..."
	docker build --pull -t $(DOCKER_IMAGE_SCRIPTS) -f Dockerfile.scripts ../..

# Build and run Dockerfile.scripts container without Postgres params (integration test)
test-docker-scripts: docker-build-scripts
	@echo "==> Running Dockerfile.scripts container test (no PG params)..."
	@chmod +x tests/scripts/test-dockerfile-scripts.sh 2>/dev/null || true
	@cd ../.. && apps/dumps-collector/tests/scripts/test-dockerfile-scripts.sh $(DOCKER_IMAGE_SCRIPTS)

# Run the application locally
run: build
	@echo "==> Running application..."
	./$(BINARY_NAME)

# Setup build directories
setup:
	@echo "==> Setting up build directories"
	mkdir -p $(OUTPUT_DIR)
	mkdir -p $(SAAS_MANIFEST_DIR)
	cp -R ../charts $(SAAS_MANIFEST_DIR)/

# Build Docker image (runs from repository root context)
docker-build: setup
	@echo "==> Building Docker image..."
	docker build \
		--pull \
		-t $(DOCKER_IMAGE) \
		--no-cache \
		-f Dockerfile \
		../..

# Tag Docker image (requires DOCKER_NAMES environment variable)
docker-tag:
	@if [ -z "$(DOCKER_NAMES)" ]; then \
		echo "Error: DOCKER_NAMES environment variable not set"; \
		exit 1; \
	fi
	@echo "==> Tagging Docker image..."
	@for id in $(DOCKER_NAMES); do \
		docker tag $(DOCKER_IMAGE) "$$id"; \
	done

# Create deployment archive
archive: docker-build
	@echo "==> Archiving artifacts..."
	zip -x build.sh \
		-x description.yaml \
		-x "\*.git\*" \
		-r "$(OUTPUT_DIR)/$(ARTIFACT_NAME).zip" \
		$(SAAS_MANIFEST_DIR)/*

# Build everything
all: build docker-build archive
