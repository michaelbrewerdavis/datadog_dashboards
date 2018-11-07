'use strict';

exports.dashboardsByEnvironment = [{
  title: 'Dashboard Title (environment)',
  project: 'project name',
  environment_host: 'host environment',
  region: 'put AWS region here',
  rds_id: 'AWS rds id',
  alb: 'app/app-name-A7ceNNeF5q/beefdadbeefdadda',
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
      name: 'aws name'
    }
  }
}, {
  title: `Requests by Region`,
  template_variables: [{
    name: "region",
    prefix: "region",
    default: "region:*"
  }],
  custom: {
    custom_graph_1: {
      title: 'API Conroller 1 requests',
      viz: 'timeseries',
      queries: [{
        type: 'bars',
        qs: [
          { q:'sum:request.controller1.show.total.count{$region}.as_count()', alias: 'controller1_show'},
          { q:'sum:request.controller1.update.total.count{$region}.as_count()', alias: 'controller1_update'}
        ]
      }]
    },
    custom_graph_1: {
      title: 'API Conroller 2 requests',
      viz: 'timeseries',
      queries: [{
        type: 'bars',
        qs: [
          { q:'sum:request.controller2.show.total.count{$region}.as_count()', alias: 'controller2_show'},
          { q:'sum:request.controller2.update.total.count{$region}.as_count()', alias: 'controller2_update'}
        ]
      }]
    }
  }
}]

/* uncomment this and fill in your own code, if you want to override the default functionality
exports.generateEnvironmentDashboard = function(vars) {

}
*/
