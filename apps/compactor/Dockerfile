# build
FROM golang:1.25.1-alpine3.22 as builder

WORKDIR /compactor

COPY go.mod go.sum ./
RUN go mod download

# copy go sources
COPY cmd/ cmd/
COPY pkg/ pkg/
COPY main.go main.go

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 GO111MODULE=on go build -a -o compactor main.go

# Use alpine tiny images as a base
FROM alpine:3.22.1

ENV USER_UID=2001 \
    USER_NAME=compactor \
    GROUP_NAME=compactor

WORKDIR /

COPY --from=builder --chown=${USER_UID} /compactor/compactor .

RUN addgroup ${GROUP_NAME} && adduser -D -G ${GROUP_NAME} -u ${USER_UID} ${USER_NAME}
USER ${USER_UID}

ENTRYPOINT ["/compactor"]
