//go:build integration

package integration

import (
	"context"
	"github.com/Netcracker/qubership-profiler-backend/libs/tests/helpers/generator"
	"os"
	"testing"
	"time"

	"github.com/Netcracker/qubership-profiler-backend/libs/tests/helpers"
	"github.com/Netcracker/qubership-profiler-backend/libs/log"
	"github.com/stretchr/testify/suite"
)

type IntegrationTestSuite struct {
	suite.Suite
	ctx           context.Context
	timestamp     time.Time
	fileVersionId string

	pgContainer    *helpers.PostgresContainer
	minioContainer *helpers.MinioContainer
	gen            *generator.Generator
}

func (suite *IntegrationTestSuite) SetupSuite() {
	suite.ctx = log.SetLevel(context.Background(), log.DEBUG)
	suite.timestamp = time.Date(2024, 4, 3, 0, 0, 0, 0, time.UTC)

	suite.minioContainer = helpers.CreateMinioContainer(suite.ctx)
	suite.pgContainer = helpers.CreatePgContainer(suite.ctx, suite.timestamp)

	genCfg := generator.SimpleConfig(1, 1, 1)
	suite.gen = generator.NewGenerator(genCfg, suite.timestamp)
	suite.gen.GenerateCalls(suite.ctx)
	suite.gen.GenerateDumps(suite.ctx)
}

func (suite *IntegrationTestSuite) TearDownSuite() {
	if err := suite.minioContainer.Terminate(suite.ctx); err != nil {
		log.Error(suite.ctx, err, "error terminating minio container")
		os.Exit(1)
	}
	if err := suite.pgContainer.Terminate(suite.ctx); err != nil {
		log.Error(suite.ctx, err, "error terminating postgres container")
	}
}

func TestIntegration(t *testing.T) {
	suite.Run(t, new(IntegrationTestSuite))
}
