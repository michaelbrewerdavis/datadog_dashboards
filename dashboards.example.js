'use strict';

exports.dashboardsByEnvironment = [{
  title: 'Dashboard Title (environment)',
  project: 'Aws-project-tag',
  environment: 'production', // same as you used for AWS "Environment" tags
  region: 'put AWS region here',
  rds_id: 'AWS rds id',
  alb: [
    {
      targetgroup_name: 'app-name-05vqy6ltXY', // optional
      targetgroup: 'app-name-05vqy6ltXY/a074fcc968a175d8'
    },
  ],
  asgs: {
    web: {
      title: 'Web Servers',
      name: 'web-name'
    },
    work: {
      title: 'Queue Workers',
      name: 'worker-name'
    },
  },
  inst_statsd_requests: {
    // Optional: prefix to the metric name
    // Default: 'request'.
    metric_prefix: 'my.custom.namespace.request',
    // Optional: You may wish to exclude some requests like health checks.
    excluded_tags: [
      'controller:health_check/health_check',
    ],
  },
  delayed_jobs: {
    // Optional: prefix to the metric name
    // Default: 'delayedjob'.
    metric_prefix: 'my.custom.namespace.delayedjob'
  },
  kinesis_streams: {
    stream1: {
     title: 'Kinesis: Stream 1',
     name: 'aws name'
    },
    another_one: {
      title: 'Kinesis: Another One',
      name: 'aws name'
    }
  },
  dynamo_tables: {
    a_dynamo_table: {
      title: 'A Dynamo table',
      name: 'aws name of table'
    },
    another_one: {
      title: 'Some Dynamo Table',
      name: 'aws name of table'
    },
  },
  lambdas: {
    lambda1: {
      title: 'λ - Lambda: 1',
      name: 'aws name'
    },
    another_lambda: {
      title: 'λ - Lambda: another one',
      name: 'aws name'
    },
  },
  s3: {
    title: 's3',
    name: 's3-name'
  },
  caches: {
    redis: {
      type: 'redis',
      title: 'Redis Cache',
      name: 'aws name'
    }
  },
  sqs_queues: {
    queue1: {
      title: 'Queue 1',
      name: 'aws-name'
    },
    another_queue: {
      title: 'another queue',
      name: 'aws name',
      conditional_formats: [{ // Applied to "currently visible" metric
        comparator: '>',
        value: '0',
        palette: 'red_on_white'
      }]
    }
  }
}, {
  title: `Requests by Region`,
  template_variables: [{
    name: "region",
    prefix: "region",
    default: "region:*"
  }],
  custom_title: 'My Custom Graphs',
  custom_height: 20,
  custom: {
    widget_1: {
      type: 'timeseries',
      title: true,
      title_text: 'API Conroller 1 Requests',
      width: 58,
      height: 17,
      x: 0,
      y: 0,
      tile_def: {
        viz: 'timeseries',
        requests: [
          {
            q: 'sum:request.controller1.show.total.count{$region}.as_count()',
            style: {
              width: 'normal',
              palette: 'dog_classic',
              type: 'solid'
            },
            aggregator: 'sum',
            type: 'bars',
            metadata: {
              'sum:request.controller1.show.total.count{$region}.as_count()': {
                alias: 'Controller 1 Show'
              }
            }
          },
          {
            q: 'sum:request.controller1.update.total.count{$region}.as_count()',
            style: {
              width: 'normal',
              palette: 'dog_classic',
              type: 'solid'
            },
            aggregator: 'sum',
            type: 'bars',
            metadata: {
              'sum:request.controller1.update.total.count{$region}.as_count()': {
                alias: 'Controller 1 Update'
              }
            }
          },
        ],
        autoscale: true
      }
    },
    widget_2: {
      type: 'timeseries',
      title: true,
      title_text: 'API Conroller 2 Requests',
      width: 58,
      height: 17,
      x: 59,
      y: 0,
      tile_def: {
        viz: 'timeseries',
        requests: [
          {
            q: 'sum:request.controller2.show.total.count{$region}.as_count()',
            style: {
              width: 'normal',
              palette: 'dog_classic',
              type: 'solid'
            },
            aggregator: 'sum',
            type: 'bars',
            metadata: {
              'sum:request.controller2.show.total.count{$region}.as_count()': {
                alias: 'Controller 2 Show'
              }
            }
          },
          {
            q: 'sum:request.controller2.update.total.count{$region}.as_count()',
            style: {
              width: 'normal',
              palette: 'dog_classic',
              type: 'solid'
            },
            aggregator: 'sum',
            type: 'bars',
            metadata: {
              'sum:request.controller2.update.total.count{$region}.as_count()': {
                alias: 'Controller 2 Update'
              }
            }
          },
        ],
        autoscale: true
      }
    },
  }
}]

/* uncomment this and fill in your own code, if you want to override the default functionality
exports.generateEnvironmentDashboard = function(vars) {

}
*/
