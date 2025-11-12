package cmd

import (
	"context"
	"net/http"

	"github.com/Netcracker/qubership-profiler-backend/apps/compactor/pkg/config"

	"github.com/Netcracker/qubership-profiler-backend/libs/log"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

func runHttpServer(ctx context.Context) error {
	log.Info(ctx, "start metrics HTTP server")
	http.Handle("/metrics", promhttp.Handler())
	http.HandleFunc("/health", health)
	http.HandleFunc("/ready", ready)
	err := http.ListenAndServe(config.Cfg.MetricsAddress, nil)
	log.Error(ctx, err, "problem with metrics server")
	return err
}

func health(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
}

func ready(w http.ResponseWriter, _ *http.Request) {
	w.WriteHeader(http.StatusOK)
}
