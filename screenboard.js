CloudwatchAlbGraphFactory = require("./factories/cloudwatch/alb");
CloudwatchAsgGraphFactory = require("./factories/cloudwatch/asg");
CloudwatchDynamoPanelFactory = require("./factories/cloudwatch/dynamodb");
CloudwatchElasticacheGraphFactory = require("./factories/cloudwatch/elasticache");
CloudwatchKinesisGraphFactory = require("./factories/cloudwatch/kinesis");
CloudwatchLambdaGraphFactory = require("./factories/cloudwatch/lambda");
CloudwatchRdsGraphFactory = require("./factories/cloudwatch/rds");
CloudwatchSqsGraphFactory = require("./factories/cloudwatch/sqs");
CloudwatchS3GraphFactory = require("./factories/cloudwatch/s3");
InstStatsdRequestsGraphFactory = require("./factories/statsd/inst-statsd-requests");
DelayedJobsGraphFactory = require("./factories/statsd/delayed-jobs");
CustomGraphFactory = require("./factories/custom");

class Screenboard {

  titleWidget(title, state) {
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

  generateCustomWidgets(customWidgets, widgets = [], state) {
    if (!customWidgets) return;

    const factory = new CustomGraphFactory();

    Object.keys(customWidgets).forEach(key => {
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
  generateAlbGraphs(load_balancers, widgets = [], state) {
    if (!load_balancers) return;

    const factoryAlb = new CloudwatchAlbGraphFactory();

    for (var lb of load_balancers) {
      const lbName = lb.targetgroup_name ? `Load Balancer: Target Group ${lb.targetgroup_name}` : 'Load Balancer'
      widgets.push(this.titleWidget(lbName, state));

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
  generateAsgGraphs(vars, widgets = [], state) {
    if (!vars.asgs) return;

    const factoryAsg = new CloudwatchAsgGraphFactory();

    widgets.push(this.titleWidget('Auto Scaling Groups', state));

    widgets.push(factoryAsg.asg_cpu(vars.asgs, state));
    widgets.push(factoryAsg.asg_instancesInService(vars.asgs, state));
    widgets.push(...factoryAsg.asg_network(vars.asgs, state));
    widgets.push(...factoryAsg.asg_hosts(vars, state));

    state.position += 38;
  }

  generateInstStatsdRequestsGraphs(requests, project, environment, region, widgets = [], state) {
    if (!requests) return;

    const factoryRequests = new InstStatsdRequestsGraphFactory(requests, project, environment, region);

    widgets.push(this.titleWidget('Requests', state));

    widgets.push(factoryRequests.totalTimeGraph(state));
    widgets.push(factoryRequests.countGraph(state));

    state.position += 30;

    widgets.push(...factoryRequests.toplists(state));

    state.position += 16;
  }

  generateDelayedJobsGraphs(delayed_jobs, project, environment, region, widgets = [], state) {
    if (!delayed_jobs) return;

    const factoryJobs = new DelayedJobsGraphFactory(delayed_jobs, project, environment, region);

    widgets.push(this.titleWidget('Jobs', state));

    widgets.push(...factoryJobs.executedFailedCounts(state, 0));
    widgets.push(...factoryJobs.executedFailedTimeseries(state, 21));
    widgets.push(...factoryJobs.runtimeAndOldestJob(state, 66));

    state.position += 48;
  }

  generateLambdasGraphs(lambdas, region, widgets = [], state) {
    if (!lambdas) return;

    const factory = new CloudwatchLambdaGraphFactory(region);

    Object.keys(lambdas).forEach(key => {
      widgets.push(this.titleWidget(`Lambda: ${lambdas[key].title}`, state));

      widgets.push(factory.render('invocations', lambdas[key], state));
      widgets.push(factory.render('duration', lambdas[key], state));

      state.position += 22;
    });
  }

  generateKinesisStreamsGraphs(streams, widgets = [], state) {
    if (!streams) return;

    const factory = new CloudwatchKinesisGraphFactory();

    Object.keys(streams).forEach(key => {
      widgets.push(this.titleWidget(`Kinesis: ${streams[key].title}`, state));

      widgets.push(factory.render('iteratorAge', streams[key], state));
      widgets.push(factory.render('records', streams[key], state));
      widgets.push(factory.render('throughput', streams[key], state));

      state.position += 21;
    });
    return widgets;
  }

  generateDynamoTablesGraphs(tables, region, widgets = [], state) {
    if (!tables || !region) return;

    const factory = new CloudwatchDynamoPanelFactory(region);

    Object.keys(tables).forEach(key => {
      widgets.push(this.titleWidget(`DynamoDB: ${tables[key].title}`, state));

      widgets.push(...factory.units(tables[key], state));
      widgets.push(factory.throttled(tables[key], state));

      state.position += 16;
    });
  }

  generateCachesGraphs(caches, widgets = [], state) {
    if (!caches) return;

    const factory = new CloudwatchElasticacheGraphFactory();

    Object.keys(caches).forEach(key => {
      widgets.push(this.titleWidget(`ElastiCache: ${caches[key].title}`, state));

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

  generateSqsGraphs(queues, region, widgets = [], state) {
    if (!queues || !region) return;

    const factory = new CloudwatchSqsGraphFactory(region);

    Object.keys(queues).forEach(key => {
      widgets.push(this.titleWidget(`SQS: ${queues[key].title}`, state));

      widgets.push(factory.render('visibilityCount', queues[key], state));
      widgets.push(factory.render('deletedCount', queues[key], state));
      widgets.push(factory.render('visibility', queues[key], state));
      widgets.push(factory.render('deleted', queues[key], state));

      state.position += 20;
    });
  }

  generateRdsGraphs(rdsIds, widgets = [], state) {
    if (!rdsIds) return;

    const rds = new CloudwatchRdsGraphFactory();

    rdsIds.forEach(rdsInstance => {
      let rdsId;
      let rdsName = null;
      if (typeof rdsInstance === 'string' || rdsInstance instanceof String) {
        rdsId = rdsInstance;
      } else {
        rdsId = rdsInstance.id;
        rdsName = rdsInstance.name;
      }
      widgets.push(this.titleWidget(`RDS: ${rdsName ? `${rdsName} (${rdsId})` : rdsId}`, state));

      widgets.push(rds.render('rds_cpu', rdsId, state));
      widgets.push(rds.render('rds_memory', rdsId, state));
      widgets.push(rds.render('rds_connections', rdsId, state));

      state.position += 16;

      widgets.push(rds.render('rds_throughput', rdsId, state));
      widgets.push(rds.render('rds_storage', rdsId, state));
      widgets.push(rds.render('rds_iops', rdsId, state));
      widgets.push(rds.render('rds_burstBalance', rdsId, state));

      state.position += 16;
    })
  }

  generateS3BucketGraphs(buckets, widgets = [], state) {
    if (!buckets) return;

    const factory = new CloudwatchS3GraphFactory();

    Object.keys(buckets).forEach(key => {
      widgets.push(this.titleWidget(`S3: ${buckets[key].title}`, state));

      widgets.push(factory.render('totalCount', buckets[key], state));
      widgets.push(factory.render('totalSize', buckets[key], state));
      widgets.push(factory.render('count', buckets[key], state));
      widgets.push(factory.render('size', buckets[key], state));

      state.position += 20;
    });
  }

  generateEnvironmentDashboard(vars) {
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

      dashboard.widgets.push(this.titleWidget(vars.custom_title || 'Custom Graphs', state));
      generateCustomWidgets(vars.custom, dashboard.widgets, state);
      state.position += vars.custom_height;
    }

    // ALB
    if (vars.alb) {
      this.generateAlbGraphs(vars.alb, dashboard.widgets, state);
    }

    // ASGS
    if (vars.asgs) {
      this.generateAsgGraphs(vars, dashboard.widgets, state);
    }

    // Requests
    if (vars.inst_statsd_requests) {
      // Use the specific project for statsd or use the default one
      var projectStatsd = vars.inst_statsd_requests.project || vars.project

      this.generateInstStatsdRequestsGraphs(vars.inst_statsd_requests, projectStatsd, vars.environment,
        vars.region, dashboard.widgets, state);
    }

    // Jobs
    if (vars.delayed_jobs) {
      // Use the specific project for statsd or use the default one
      var projectStatsd = vars.delayed_jobs.project || vars.project

      this.generateDelayedJobsGraphs(vars.delayed_jobs, projectStatsd, vars.environment,
        vars.region, dashboard.widgets, state);
    }

    // RDS
    // Support multiple RDS instances in an backwards compatible fashion
    if (vars.rds_id) {
      this.generateRdsGraphs([vars.rds_id], dashboard.widgets, state);
    }

    if (vars.rds_ids) {
      this.generateRdsGraphs(vars.rds_ids, dashboard.widgets, state);
    }

    // Caches
    if (vars.caches) {
      this.generateCachesGraphs(vars.caches, dashboard.widgets, state);
    }

    // Lambdas
    if (vars.lambdas) {
      this.generateLambdasGraphs(vars.lambdas, vars.region, dashboard.widgets, state);
    }

    // Kinesis
    if (vars.kinesis_streams) {
      this.generateKinesisStreamsGraphs(vars.kinesis_streams, dashboard.widgets, state);
    }

    // Dynamo tables
    if (vars.dynamo_tables) {
      this.generateDynamoTablesGraphs(vars.dynamo_tables, vars.region, dashboard.widgets, state);
    }

    // SQS Queues
    if (vars.sqs_queues) {
      this.generateSqsGraphs(vars.sqs_queues, vars.region, dashboard.widgets, state);
    }

    // S3
    if (vars.s3_buckets) {
      this.generateS3BucketGraphs(vars.s3_buckets, dashboard.widgets, state);
    }

    return dashboard;
  }
}
module.exports = Screenboard;
