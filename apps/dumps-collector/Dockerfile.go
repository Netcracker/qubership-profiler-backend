# Build context: repository root
# Go binary (dumps-collector server) – uses Postgres when enabled.
# Usage: docker build -f apps/dumps-collector/Dockerfile.go -t qubership-profiler-dumps-collector-go .

FROM golang:1.25.7-alpine3.22@sha256:20c8a94b529a9a127b6990c5e03537bd71ce3ebfdd744741e96168ac338bd862 AS builder

ARG TARGETOS=linux
ARG TARGETARCH

WORKDIR /workspace
COPY go.mod go.sum ./
RUN go mod download

COPY apps/dumps-collector/ apps/dumps-collector/
COPY libs/ libs/

RUN cd apps/dumps-collector && \
    CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} go build -a -o /workspace/dumps-collector main.go

FROM alpine:3.20

RUN apk --no-cache add ca-certificates && rm -rf /var/cache/apk/*

ENV USER_UID=10001
RUN adduser -D -u ${USER_UID} appuser

COPY --from=builder /workspace/dumps-collector /dumps-collector
RUN chown appuser /dumps-collector

USER appuser

EXPOSE 8000

# Server listens on DIAG_BIND_ADDRESS (default :8000). Postgres optional via DIAG_POSTGRES_ENABLED.
CMD ["/dumps-collector", "run"]
