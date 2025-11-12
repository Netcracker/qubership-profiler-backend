package cmd

import (
	"context"
	"os"
	"syscall"

	"github.com/Netcracker/qubership-profiler-backend/apps/compactor/pkg/compactor"
	"github.com/Netcracker/qubership-profiler-backend/apps/compactor/pkg/config"
	"github.com/Netcracker/qubership-profiler-backend/apps/compactor/pkg/metrics"

	"github.com/Netcracker/qubership-profiler-backend/libs/storage"
	"github.com/Netcracker/qubership-profiler-backend/libs/cron"
	"github.com/Netcracker/qubership-profiler-backend/libs/log"
	"github.com/oklog/run"
	"github.com/spf13/cobra"
)

var runCmd = &cobra.Command{
	Use:   "run",
	Short: "Run compactor",
	Run:   Run,
}

func init() {
	rootCmd.AddCommand(runCmd)
	config.InitFlags(runCmd.Flags())
}

func Run(cmd *cobra.Command, args []string) {
	ctx := cmd.Context()

	err := config.PrepareConfig(ctx)
	if err != nil {
		log.Error(ctx, err, "Error during reading configuration")
		os.Exit(1)
	}

	metrics.Register()

	comp, err := compactor.NewCompactor(ctx)
	if err != nil {
		log.Error(ctx, err, "Error during preparing compactor")
		os.Exit(1)
	}

	if config.Cfg.CronRun {
		runService(ctx, comp)
	} else {
		executeOnce(ctx, comp)
	}
}

func execute(ctx context.Context, c *compactor.Compactor) func() { // for cron
	return func() {
		executeOnce(ctx, c)
	}
}

func executeOnce(ctx context.Context, c *compactor.Compactor) {
	var err error
	if config.Cfg.TimeRun == nil {
		err = c.Execute(ctx)
	} else if config.Cfg.TableStatus != "" {
		err = c.ExecuteForSpecificTimeAndStatus(ctx, *config.Cfg.TimeRun, model.TableStatus(config.Cfg.TableStatus))
	} else {
		err = c.ExecuteForSpecificTime(ctx, *config.Cfg.TimeRun)
	}
	if err != nil {
		log.Error(ctx, err, "Error during execution")
	}
}

func runService(ctx context.Context, comp *compactor.Compactor) {
	ctx, cancel := context.WithCancel(ctx)
	defer cancel()

	var gr run.Group
	gr.Add(run.SignalHandler(ctx, os.Interrupt, syscall.SIGINT, syscall.SIGTERM))
	gr.Add(
		func() error {
			return runCron(ctx, comp)
		},
		func(_ error) {
			log.Warning(ctx, "run cron exiting")
			cancel()
		},
	)
	gr.Add(
		func() error {
			return runHttpServer(ctx)
		},
		func(_ error) {
			log.Warning(ctx, "metrics server exiting")
			cancel()
		},
	)
	if err := gr.Run(); err != nil {
		log.Warning(ctx, "terminating... reason: %s", err)
		os.Exit(1)
	}
}

func runCron(ctx context.Context, compactor *compactor.Compactor) error {
	c := cron.NewCron(ctx)
	_, err := c.AddFunc(config.Cfg.CronJobSchedule, execute(ctx, compactor))
	if err != nil {
		log.Error(ctx, err, "problem with cron")
		return err
	}

	c.Start()
	<-ctx.Done()
	log.Warning(ctx, "Stop cron, context is done")
	c.Stop()
	return nil
}
