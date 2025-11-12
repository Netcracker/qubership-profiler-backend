# Build context is the repository root (not apps/compactor) because go.mod uses:
#   replace github.com/Netcracker/qubership-profiler-backend => ../..
# This requires access to the root go.mod and libs/ directory during build.

FROM golang:1.25-alpine AS builder

WORKDIR /build

# Copy root module files (for shared libs)
COPY go.mod go.sum ./

# Copy compactor module files
COPY apps/compactor/go.mod apps/compactor/go.sum ./apps/compactor/

# Copy shared libs
COPY libs/ libs/

# Download dependencies
WORKDIR /build/apps/compactor
RUN go mod download

# Copy compactor sources
COPY apps/compactor/cmd/ cmd/
COPY apps/compactor/pkg/ pkg/
COPY apps/compactor/main.go main.go

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -o compactor main.go

# Runtime image
FROM alpine:3.22.1

ENV USER_UID=2001 \
    USER_NAME=compactor \
    GROUP_NAME=compactor

WORKDIR /

COPY --from=builder --chown=${USER_UID} /build/apps/compactor/compactor .

RUN addgroup ${GROUP_NAME} && adduser -D -G ${GROUP_NAME} -u ${USER_UID} ${USER_NAME} \
    && mkdir -p /output && chown ${USER_UID}:${GROUP_NAME} /output

ENV OUTPUT_DIR=/output

USER ${USER_UID}

ENTRYPOINT ["/compactor"]
