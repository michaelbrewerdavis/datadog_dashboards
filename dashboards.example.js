'use strict';

exports.dashboardsByEnvironment = [{
  title: 'Dashboard Title (environment)',
  env: 'environment',
  project: 'project name',
  environment_host: 'host environment',
  region: 'put AWS region here',
  rds_id: 'AWS rds id',
  graphite: {
    request_timing: {
      title: 'Top 5 Slowest Requests ($request_interval moving average)',
      target: `aliasByNode(movingAverage(sortByMaxima(highestAverage(stats.timers.my_app.production.request.*.*.total.mean, 5)), '$request_interval'), 5, 6)`
    },
    request_top: {
      title: 'Top 5 Request Counts (per $request_interval)',
      target: `aliasByNode(sortByMaxima(summarize(highestMax(exclude(stats.timers.my_app.production.request.*.*.total.count, 'health_check'), 5), '$request_interval', 'sum')), 5, 6)`
    }
  },
  cloudwatch: 'CloudWatch name',
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
  },
  tags: [
   'tags to group dashboards by'
  ],
  links: {
    'Kibana': 'https://yourlinktokibana.com',
    'Sentry': 'https://yourlinktosetry.com'
  }
}]

/* uncomment this and fill in your own code, if you want to override the default functionality
exports.generateEnvironmentDashboard = function(vars) {

}
*/
