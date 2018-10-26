#!/usr/bin/env node

require("dotenv").config();
TimeboardService = require("./services/timeboards");

HostGraphFactory = require("./factories/host/host");
CloudwatchAsgGraphFactory = require("./factories/cloudwatch/asg");
CloudwatchDynamoPanelFactory = require("./factories/cloudwatch/dynamodb");
CloudwatchEc2GraphFactory = require("./factories/cloudwatch/ec2");
CloudwatchElasticacheGraphFactory = require("./factories/cloudwatch/elasticache");
CloudwatchElbGraphFactory = require("./factories/cloudwatch/elb");
CloudwatchKinesisGraphFactory = require("./factories/cloudwatch/kinesis");
CloudwatchLambdaGraphFactory = require("./factories/cloudwatch/lambda");
CloudwatchRdsGraphFactory = require("./factories/cloudwatch/rds");
CloudwatchSqsGraphFactory = require("./factories/cloudwatch/sqs");
CloudwatchS3GraphFactory = require("./factories/cloudwatch/s3");

const chalk = require("chalk");
const CLI = require("clui");
const figlet = require("figlet");

const prompt = require("prompt-sync")();
const Spinner = CLI.Spinner;
const path = require("path");
const ROOT_PATH = process.cwd();

const program = require("commander");

program
  .version("0.1.0")
  .usage("[options] <file ...>")
  .option("-d, --dashboards [value]", "The dasboards config file")
  .parse(process.argv);

console.log(
  chalk.magenta(figlet.textSync("Datadog", { horizontalLayout: "full" }))
);
console.log(
  chalk.magenta(figlet.textSync("Dashboards", { horizontalLayout: "full" }))
);

const DATADOG_API_APP_KEY = process.env.DATADOG_API_APP_KEY;
const DATADOG_API_API_KEY = process.env.DATADOG_API_API_KEY;

const dashboard =
  program.dashboards ||
  process.env.DATADOG_DASHBOARD_JS ||
  prompt("Dashboards path: ");

console.log(`Dashboard: ${dashboard}`);
const dashboardsConfig = require(path.join(ROOT_PATH, dashboard));

function getDashboardJsonString(dashboardConfig, prettyPrint = false) {
  const generated = generateEnvironmentDashboard(dashboardConfig);
  return JSON.stringify(generated, null, prettyPrint ? 2 : null);
}

/**
 * Creates the dashboards based on the config.
 * Determines whether to do a create or an updated based on the title of the dashboard.
 * @param {*} dashboardsConfig
 */
function createDashboards(dashboardsConfig) {
  const spinnerStatus = new Spinner(
    "Retrieving existing dashboards, please wait..."
  );
  spinnerStatus.start();

  const timeboardSvc = new TimeboardService(
    DATADOG_API_API_KEY,
    DATADOG_API_APP_KEY
  );

  timeboardSvc.getAllDashboards().then(res => {
    spinnerStatus.stop();

    return Promise.all(
      dashboardsConfig.dashboardsByEnvironment.map(dashboardConfig => {
        const existingTimeboardId = timeboardSvc.getDashboardIdByTitle(
          dashboardConfig.title
        );
        const jsonString = getDashboardJsonString(dashboardConfig);
        if (existingTimeboardId) {
          console.log(`Updating ${dashboardConfig.title}`);
          return timeboardSvc.updateDashboard(
            existingTimeboardId,
            dashboardConfig.title,
            jsonString
          );
        } else {
          console.log(`Creating ${dashboardConfig.title}`);
          return timeboardSvc.createDashboard(
            dashboardConfig.title,
            jsonString
          );
        }
      })
    )
      .then(() => {
        console.log();
        console.log(chalk.green.bold("Done!"));
      })
      .catch(err => {
        console.log(chalk.red.bold("Failed!"));
        console.log(err);
      });
  });
}

createDashboards(dashboardsConfig);

function generateAlbGraphs(alb, graphs = []) {
  if (!alb) return;

  const factoryElb = new CloudwatchElbGraphFactory();

  graphs.push({
    title: "ALB Hits",
    definition: factoryElb.elb_hits(alb)
  });

  graphs.push({
    title: "ALB Request Count",
    definition: factoryElb.elb_totalRequests(alb)
  });

  graphs.push({
    title: "ALB Host Health (per A-Z)",
    definition: factoryElb.elb_health(alb)
  });

  graphs.push({
    title: "ALB Latency",
    definition: factoryElb.elb_latency(alb)
  });

  return graphs;
}

function generateElbGraphs(elb, graphs = []) {
  if (!elb) return;

  const factoryElb = new CloudwatchElbGraphFactory();

  graphs.push({
    title: "ELB Hits",
    definition: factoryElb.elb_hits(elb)
  });

  graphs.push({
    title: "ELB Request Count",
    definition: factoryElb.elb_totalRequests(elb)
  });

  graphs.push({
    title: "ELB Host Health (per A-Z)",
    definition: factoryElb.elb_health(elb)
  });

  graphs.push({
    title: "ELB Latency",
    definition: factoryElb.elb_latency(elb)
  });
  return graphs;
}

function generateHostGraphs(project, environment, region, graphs = []) {
  if (!project || !environment) return;

  const factoryHost = new HostGraphFactory(region);

  graphs.push({
    title: "Hosts: CPU Load",
    definition: factoryHost.host_cpuLoad({ project, environment }, ["role"])
  });

  graphs.push({
    title: "Hosts: Memory Used",
    definition: factoryHost.host_memUsed({ project, environment }, ["role"])
  });
  return graphs;
}

/**
 * Generates the graphs for instances in service for an ASG.
 * @param {object} asg
 * @param {array} graphs
 */
function generateAsgGraphs(asg, graphs = []) {
  if (!asg) return;

  const factoryAsg = new CloudwatchAsgGraphFactory();

  graphs.push({
    title: "Number of Instances",
    definition: factoryAsg.asg_instancesInService(asg)
  });
  return graphs;
}

/**
 * Generates the graphs for instances in service for an ASG.
 * @param {object} asg
 * @param {array} graphs
 */
function generateEc2Graphs(asg, graphs = []) {
  if (!asg) return;

  const factoryEc2 = new CloudwatchEc2GraphFactory();
  graphs.push({
    title: "CPU Utilization",
    definition: factoryEc2.ec2_cpu(asg)
  });

  return graphs;
}

function generateLambdasGraphs(lambdas, region, graphs = []) {
  if (!lambdas) return;

  const factory = new CloudwatchLambdaGraphFactory(region);
  Object.keys(lambdas).forEach(key => {
    graphs.push({
      title: `${lambdas[key].title} - Invocations`,
      definition: factory.lambda_invocations(lambdas[key].name)
    });
    graphs.push({
      title: `${lambdas[key].title} - Runtime`,
      definition: factory.lambda_duration(lambdas[key].name)
    });
  });
  return graphs;
}

function generateKinesisStreamsGraphs(streams, graphs = []) {
  if (!streams) return;

  const factory = new CloudwatchKinesisGraphFactory();

  Object.keys(streams).forEach(key => {
    graphs.push({
      title: `${streams[key].title} - Records`,
      definition: factory.kinesis_records(streams[key].name)
    });
    graphs.push({
      title: `${streams[key].title} - Iterator Age`,
      definition: factory.kinesis_iteratorAge(streams[key].name)
    });
  });
  return graphs;
}

function generateDyanmoTablesGraphs(tables, region, graphs = []) {
  if (!tables || !region) return;

  const factory = new CloudwatchDynamoPanelFactory(region);

  Object.keys(tables).forEach(function(key) {
    graphs.push({
      title: `Dynamo: ${tables[key].title} - Read`,
      definition: factory.dynamodb_units("Read", {
        tablename: tables[key].name
      })
    });
    graphs.push({
      title: `Dynamo: ${tables[key].title} - Write`,
      definition: factory.dynamodb_units("Write", {
        tablename: tables[key].name
      })
    });
  });
  return graphs;
}

function generateCachesGraphs(caches, graphs = []) {
  if (!caches) return;

  const factory = new CloudwatchElasticacheGraphFactory();

  Object.keys(caches).forEach(function(key) {
    graphs.push({
      title: `${caches[key].title}: Hits/Misses`,
      definition: factory.elasticache_hits(caches[key].name)
    });
    graphs.push({
      title: `${caches[key].title}: Bytes Used`,
      definition: factory.elasticache_bytesUsed(caches[key].name)
    });
    graphs.push({
      title: `${caches[key].title}: Current Items`,
      definition: factory.elasticache_currentItems(caches[key].name)
    });
    graphs.push({
      title: `${caches[key].title}: Freeable Memory`,
      definition: factory.elasticache_freeableMemory(caches[key].name)
    });
    graphs.push({
      title: `${caches[key].title}: Evictions`,
      definition: factory.elasticache_evictions(caches[key].name)
    });
    if (caches[key].type === 'redis') {
      graphs.push({
        title: `${caches[key].title}: Commands`,
        definition: factory.elasticache_redis_commands(caches[key].name)
      });
    }
  });
  return graphs;
}

function generateSqsGraphs(queues, region, graphs = []) {
  if (!queues || !region) return;

  const factory = new CloudwatchSqsGraphFactory(region);
  Object.keys(queues).forEach(function(key) {
    graphs.push({
      title: `${queues[key].title}: Message Visibility`,
      definition: factory.sqs_visibility(queues[key].name)
    });
    graphs.push({
      title: `${queues[key].title}: Last Count`,
      definition: factory.sqs_visibilityCount(queues[key].name)
    });
    graphs.push({
      title: `${queues[key].title}: Processed`,
      definition: factory.sqs_deleted(queues[key].name)
    });
    graphs.push({
      title: `${queues[key].title}: Processed`,
      definition: factory.sqs_deletedCount(queues[key].name)
    });
  });
  return graphs;
}

function generateRdsGraphs(rdsId, graphs = []) {
  if (!rdsId) return;

  const factoryRds = new CloudwatchRdsGraphFactory();

  graphs.push({
    title: "RDS CPU Usage",
    definition: factoryRds.rds_cpu(rdsId)
  });
  graphs.push({
    title: "RDS Burst Balance",
    definition: factoryRds.rds_burstBalance(rdsId)
  });
  graphs.push({
    title: "RDS DB Connections",
    definition: factoryRds.rds_connections(rdsId)
  });
  graphs.push({
    title: "RDS IOPS",
    definition: factoryRds.rds_iops(rdsId)
  });
  graphs.push({
    title: "RDS Memory",
    definition: factoryRds.rds_memory(rdsId)
  });
  graphs.push({
    title: "RDS Storage",
    definition: factoryRds.rds_storage(rdsId)
  });
  graphs.push({
    title: "RDS Network Throughput",
    definition: factoryRds.rds_throughput(rdsId)
  });

  return graphs;
}

function generateS3BucketGraphs(s3Buckets, graphs = []) {
  if (!s3Buckets) return;

  const factory = new CloudwatchS3GraphFactory();
  Object.keys(s3Buckets).forEach(key => {
    graphs.push({
      title: `${s3Buckets[key].title} Bucket Size`,
      definition: factory.s3_bucketSize(s3Buckets[key].name)
    });
  });

  return graphs;
}

function generateEnvironmentDashboard(vars) {
  var dashboard = {
    title: vars.title,
    description: vars.description || "A great dashboard!",
    graphs: []
  };

  // ALB
  if (vars.alb) {
    generateAlbGraphs(vars.alb, dashboard.graphs);
  }

  // ELB
  if (vars.elb) {
    generateElbGraphs(vars.elb, dashboard.graphs);
  }

  // Host map
  if (vars.project && vars.environment_host) {
    generateHostGraphs(
      vars.project,
      vars.environment_host,
      vars.region,
      dashboard.graphs
    );
  }

  // ASGS
  if (vars.asgs) {
    generateAsgGraphs(vars.asgs, dashboard.graphs);
  }

  // EC2
  if (vars.asgs) {
    generateEc2Graphs(vars.asgs, dashboard.graphs);
  }

  // Lambdas
  if (vars.lambdas) {
    generateLambdasGraphs(vars.lambdas, vars.region, dashboard.graphs);
  }

  // Kinesis
  if (vars.kinesis_streams) {
    generateKinesisStreamsGraphs(vars.kinesis_streams, dashboard.graphs);
  }

  // Dynamo tables
  if (vars.dynamo_tables) {
    generateDyanmoTablesGraphs(
      vars.dynamo_tables,
      vars.region,
      dashboard.graphs
    );
  }

  // Caches
  if (vars.caches) {
    generateCachesGraphs(vars.caches, dashboard.graphs);
  }

  // SQS Queues
  if (vars.sqs_queues) {
    generateSqsGraphs(vars.sqs_queues, vars.region, dashboard.graphs);
  }

  // RDS
  if (vars.rds_id) {
    generateRdsGraphs(vars.rds_id, dashboard.graphs);
  }

  // S3
  if (vars.s3_buckets) {
    generateS3BucketGraphs(vars.s3_buckets, dashboard.graphs);
  }
  return dashboard;
}
