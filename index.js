#!/usr/bin/env node

require("dotenv").config();

const { version } = require('./package.json');

ScreenboardService = require("./services/screenboard");
CloudwatchAlbGraphFactory = require("./factories/cloudwatch/alb");
CloudwatchAsgGraphFactory = require("./factories/cloudwatch/asg");
CloudwatchDynamoPanelFactory = require("./factories/cloudwatch/dynamodb");
CloudwatchElasticacheGraphFactory = require("./factories/cloudwatch/elasticache");
CloudwatchKinesisGraphFactory = require("./factories/cloudwatch/kinesis");
CloudwatchLambdaGraphFactory = require("./factories/cloudwatch/lambda");
CloudwatchRdsGraphFactory = require("./factories/cloudwatch/rds");
CloudwatchSqsGraphFactory = require("./factories/cloudwatch/sqs");
CloudwatchS3GraphFactory = require("./factories/cloudwatch/s3");
CustomGraphFactory = require("./factories/custom");

const chalk = require("chalk");
const CLI = require("clui");
const figlet = require("figlet");

const prompt = require("prompt-sync")();
const Spinner = CLI.Spinner;
const path = require("path");
const ROOT_PATH = process.cwd();

const program = require("commander");

program
  .version(version)
  .usage("[options] <file ...>")
  .option("-d, --dashboards [value]", "The dasboards config file")
  .option("-p, --preview", "Preview the JSON, don't create the dashboard")
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

let dashboardsConfig;

try {
  dashboardsConfig = require(path.join(ROOT_PATH, dashboard));
} catch (err) {
  exitProgram(`Dashboard file error: ${err}`);
}

if (!DATADOG_API_APP_KEY || !DATADOG_API_API_KEY) {
  exitProgram("Datadog keys DATADOG_API_APP_KEY && DATADOG_API_API_KEY not found");
}

function exitProgram(text) {
  console.log(chalk.red(text))
  program.outputHelp();
  process.exit(1);
}

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

  const screenboardSvc = new ScreenboardService(
    DATADOG_API_API_KEY,
    DATADOG_API_APP_KEY
  );

  screenboardSvc.getAllScreenboards().then(res => {
    spinnerStatus.stop();

    return Promise.all(
      dashboardsConfig.dashboardsByEnvironment.map(dashboardConfig => {
        const existingBoardId = screenboardSvc.getScreenboardIdByTitle(
          dashboardConfig.title
        );
        const jsonString = getDashboardJsonString(dashboardConfig);
        if (existingBoardId) {
          console.log(`Updating ${dashboardConfig.title}`);
          return screenboardSvc.updateScreenboard(
            existingBoardId,
            dashboardConfig.title,
            jsonString
          );
        } else {
          console.log(`Creating ${dashboardConfig.title}`);
          return screenboardSvc.createScreenboard(
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

/**
 * Previews the dashboard JSON and outputs it to stdout
 * @param {*} dashboardsConfig
 */
function previewDashboards(dashboardsConfig) {
  dashboardsConfig.dashboardsByEnvironment.map(dashboardConfig => {
    console.log(chalk.green.bold(`Dashboard - ${dashboardConfig.title}`));
    const jsonString = getDashboardJsonString(dashboardConfig, true);
    console.log(jsonString)
  })
}

if (program.preview) {
  previewDashboards(dashboardsConfig);
} else {
  createDashboards(dashboardsConfig);
}

function titleWidget(title, state) {
  var widget = {
    type: 'free_text',
    font_size: '24',
    title: true,
    text: title,
    height: 3,
    width: 117,
    x: 0,
    y: state.position
  }
  state.position += 4;

  return widget;
}

function generateCustomWidgets(customWidgets, widgets = [], state) {
  if (!customWidgets) return;

  const factory = new CustomGraphFactory();

  Object.keys(customWidgets).forEach(function(key) {
    widgets.push(factory.render(customWidgets[key], state));
  })
}

/**
 * Generates widgets for all load balancers.
 *
 * @param {object} load_balancers
 * @param {array} widgets
 * @param {object} state
 */
function generateAlbGraphs(load_balancers, widgets = [], state) {
  if (!load_balancers) return;

  const factoryAlb = new CloudwatchAlbGraphFactory();

  for (var lb of load_balancers) {
    widgets.push(titleWidget(`Load Balancer`, state));

    widgets.push(...factoryAlb.alb_totalRequests(lb, state));
    widgets.push(factoryAlb.alb_hits(lb, state));
    widgets.push(factoryAlb.alb_latency(lb, state));
    widgets.push(factoryAlb.alb_health(lb, state));

    state.position += 30;
  }
}

/**
 * Generates widgets for instances in all auto scaling groups.
 *
 * @param {object} vars
 * @param {array} widgets
 * @param {object} state
 */
function generateAsgGraphs(vars, widgets = [], state) {
  if (!vars.asgs) return;

  const factoryAsg = new CloudwatchAsgGraphFactory();

  widgets.push(titleWidget('Auto Scaling Groups', state));

  widgets.push(factoryAsg.asg_cpu(vars.asgs, state));
  widgets.push(factoryAsg.asg_instancesInService(vars.asgs, state));
  widgets.push(...factoryAsg.asg_network(vars.asgs, state));
  widgets.push(...factoryAsg.asg_hosts(vars, state));

  state.position += 38;
}

function generateLambdasGraphs(lambdas, region, widgets = [], state) {
  if (!lambdas) return;

  const factory = new CloudwatchLambdaGraphFactory(region);

  Object.keys(lambdas).forEach(key => {
    widgets.push(titleWidget(`Lambda: ${lambdas[key].title}`, state));

    widgets.push(factory.render('invocations', lambdas[key], state));
    widgets.push(factory.render('duration', lambdas[key], state));

    state.position += 22;
  });
}

function generateKinesisStreamsGraphs(streams, widgets = [], state) {
  if (!streams) return;

  const factory = new CloudwatchKinesisGraphFactory();

  Object.keys(streams).forEach(key => {
    widgets.push(titleWidget(`Kinesis: ${streams[key].title}`, state));

    widgets.push(factory.render('iteratorAge', streams[key], state));
    widgets.push(factory.render('records', streams[key], state));
    widgets.push(factory.render('throughput', streams[key], state));

    state.position += 21;
  });
  return widgets;
}

function generateDynamoTablesGraphs(tables, region, widgets = [], state) {
  if (!tables || !region) return;

  const factory = new CloudwatchDynamoPanelFactory(region);

  Object.keys(tables).forEach(function(key) {
    widgets.push(titleWidget(`DynamoDB: ${tables[key].title}`, state));

    widgets.push(...factory.units(tables[key], state));
    widgets.push(factory.throttled(tables[key], state));

    state.position += 16;
  });
}

function generateCachesGraphs(caches, widgets = [], state) {
  if (!caches) return;

  const factory = new CloudwatchElasticacheGraphFactory();

  Object.keys(caches).forEach(function(key) {
    widgets.push(titleWidget(`ElastiCache: ${caches[key].title}`, state));

    widgets.push(factory.render('hits', caches[key], state));
    widgets.push(factory.render('items', caches[key], state));
    widgets.push(factory.render('memory', caches[key], state));

    state.position += 16;

    widgets.push(factory.render('bytesUsed', caches[key], state));
    widgets.push(factory.render('evictions', caches[key], state));

    if (caches[key].type === 'redis') {
      widgets.push(factory.render('redis_commands', caches[key], state));
    }

    state.position += 16;
  });
}

function generateSqsGraphs(queues, region, widgets = [], state) {
  if (!queues || !region) return;

  const factory = new CloudwatchSqsGraphFactory(region);

  Object.keys(queues).forEach(function(key) {
    widgets.push(titleWidget(`SQS: ${queues[key].title}`, state));

    widgets.push(factory.render('visibilityCount', queues[key], state));
    widgets.push(factory.render('deletedCount', queues[key], state));
    widgets.push(factory.render('visibility', queues[key], state));
    widgets.push(factory.render('deleted', queues[key], state));

    state.position += 20;
  });
}

function generateRdsGraphs(rdsId, widgets = [], state) {
  if (!rdsId) return;

  const rds = new CloudwatchRdsGraphFactory();

  widgets.push(titleWidget(`RDS: ${rdsId}`, state));

  widgets.push(rds.render('rds_cpu', rdsId, state));
  widgets.push(rds.render('rds_memory', rdsId, state));
  widgets.push(rds.render('rds_connections', rdsId, state));

  state.position += 16;

  widgets.push(rds.render('rds_throughput', rdsId, state));
  widgets.push(rds.render('rds_storage', rdsId, state));
  widgets.push(rds.render('rds_iops', rdsId, state));
  widgets.push(rds.render('rds_burstBalance', rdsId, state));

  state.position += 16;
}

function generateS3BucketGraphs(buckets, widgets = [], state) {
  if (!buckets) return;

  const factory = new CloudwatchS3GraphFactory();

  Object.keys(buckets).forEach(function(key) {
    widgets.push(titleWidget(`S3: ${buckets[key].title}`, state));

    widgets.push(factory.render('totalCount', buckets[key], state));
    widgets.push(factory.render('totalSize', buckets[key], state));
    widgets.push(factory.render('count', buckets[key], state));
    widgets.push(factory.render('size', buckets[key], state));

    state.position += 20;
  });
}

function generateEnvironmentDashboard(vars) {
  var dashboard = {
    board_title: vars.title,
    description: vars.description || "A great dashboard!",
    template_variables: vars.template_variables,
    widgets: []
  };

  var state = {
    position: 0
  };

  // Custom widgets
  if (vars.custom) {
    if (!vars.custom_height) {
      console.log(chalk.red('You must define the height you want reserved for custom graphs in "custom_height" setting.'));
      process.exit(1);
    }

    dashboard.widgets.push(titleWidget(vars.custom_title || 'Custom Graphs', state));
    generateCustomWidgets(vars.custom, dashboard.widgets, state);
    state.position += vars.custom_height;
  }

  // ALB
  if (vars.alb) {
    generateAlbGraphs(vars.alb, dashboard.widgets, state);
  }

  // ASGS
  if (vars.asgs) {
    generateAsgGraphs(vars, dashboard.widgets, state);
  }

  // RDS
  if (vars.rds_id) {
    generateRdsGraphs(vars.rds_id, dashboard.widgets, state);
  }

  // Caches
  if (vars.caches) {
    generateCachesGraphs(vars.caches, dashboard.widgets, state);
  }

  // Lambdas
  if (vars.lambdas) {
    generateLambdasGraphs(vars.lambdas, vars.region, dashboard.widgets, state);
  }

  // Kinesis
  if (vars.kinesis_streams) {
    generateKinesisStreamsGraphs(vars.kinesis_streams, dashboard.widgets, state);
  }

  // Dynamo tables
  if (vars.dynamo_tables) {
    generateDynamoTablesGraphs(vars.dynamo_tables, vars.region, dashboard.widgets, state);
  }

  // SQS Queues
  if (vars.sqs_queues) {
    generateSqsGraphs(vars.sqs_queues, vars.region, dashboard.widgets, state);
  }

  // S3
  if (vars.s3_buckets) {
    generateS3BucketGraphs(vars.s3_buckets, dashboard.widgets, state);
  }

  return dashboard;
}
