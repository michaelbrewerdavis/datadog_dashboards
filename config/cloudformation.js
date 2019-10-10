var AWS = require("aws-sdk");
const titleCase = require('title-case');
const utils = require('../lib/utils')

/**
 * Class for creating the dashboard config for cloudformation templates.
 * For an example of the config, please see dashboards.example.js -> dashboardsByEnvironment
 */
class CloudFormation {
  /**
   * Initializes for loading the config.
   * @param {*} region
   * @param {*} stackName
   */
  constructor(region, stackName) {
    this.region = region;
    this.stackName = stackName;
    this.config = {};
    this.cloudformation = new AWS.CloudFormation({
      region: this.region
    });
  }

  async getDashboardConfig() {
    var paramsCloudFormation = {
      StackName: this.stackName
    };

    try {
      this.config = {}
      var data = await this.cloudformation.describeStackResources(paramsCloudFormation).promise()
      var stackResources = data.StackResources;

      this.loadAsgConfig(stackResources)
      this.loadDynamoDbConfig(stackResources)
      this.loadKinesisConfig(stackResources)
      this.loadLambdaConfig(stackResources)
      this.loadRdsConfig(stackResources)
      this.loadRedisConfig(stackResources)
      this.loadS3Config(stackResources)
      this.loadTargetGroupConfig(stackResources)

      return this.config;
    } catch (err) {
      console.error('Error loading Cloudformation Resources')
      console.error(err)
      return null;
    }
  }

  loadAsgConfig(stackResources) {
    const asgs = stackResources.filter(obj => {
      return obj.ResourceType == 'AWS::AutoScaling::AutoScalingGroup'
    })
    if (asgs && asgs.length) {
      this.config.asgs = {}
      asgs.forEach(asg => {
        const resourceId = asg.LogicalResourceId.replace('ASG', '')
        this.config.asgs[asg.LogicalResourceId] = {
          title: titleCase(resourceId),
          name: asg.PhysicalResourceId
        }
      })
    }
  }

  loadDynamoDbConfig(stackResources) {
    const tables = stackResources.filter(obj => {
      return obj.ResourceType == 'AWS::DynamoDB::Table'
    })
    if (tables && tables.length) {
      this.config.dynamo_tables = []
      tables.forEach(table => {
        this.config.dynamo_tables[table.LogicalResourceId] = {
          title: titleCase(table.LogicalResourceId),
          name: table.PhysicalResourceId
        }
      })
    }
  }

  loadKinesisConfig(stackResources) {
    const kinesisStreams = stackResources.filter(obj => {
      return obj.ResourceType == 'AWS::Kinesis::Stream'
    })
    if (kinesisStreams && kinesisStreams.length) {
      this.config.kinesis_streams = {}
      kinesisStreams.forEach(kinesisStream => {
        this.config.kinesis_streams[kinesisStream.LogicalResourceId] = {
          title: titleCase(kinesisStream.LogicalResourceId),
          name: kinesisStream.PhysicalResourceId
        }
      })
    }
  }


  loadLambdaConfig(stackResources) {
    const lambdas = stackResources.filter(obj => {
      return obj.ResourceType == 'AWS::Lambda::Function'
    })
    if (lambdas && lambdas.length) {
      this.config.lambdas = {}
      lambdas.forEach(lambda => {
        this.config.lambdas[lambda.LogicalResourceId] = {
          title: titleCase(lambda.LogicalResourceId),
          name: utils.parameterize(lambda.PhysicalResourceId)
        }
      })
    }
  }

  loadRdsConfig(stackResources) {
    const rdsClusters = stackResources.filter(obj => {
      return obj.ResourceType == 'AWS::RDS::DBInstance'
    })
    if (rdsClusters && rdsClusters.length) {
      this.config.rds_ids = []
      rdsClusters.forEach(rds => {
        this.config.rds_ids.push({
          id: rds.PhysicalResourceId
        })
      })
    }
  }

  loadRedisConfig(stackResources) {
    const redisCaches = stackResources.filter(obj => {
      return obj.ResourceType == 'AWS::ElastiCache::CacheCluster' &&
        obj.LogicalResourceId.startsWith('redis')
    })
    if (redisCaches && redisCaches.length) {
      this.config.caches = {}
      redisCaches.forEach(redisCache => {
        this.config.caches[redisCache.LogicalResourceId] = {
          title: redisCache.LogicalResourceId,
          type: 'redis',
          name: redisCache.PhysicalResourceId
        }
      })
    }
  }

  loadS3Config(stackResources) {
    const s3buckets = stackResources.filter(obj => {
      return obj.ResourceType == 'AWS::S3::Bucket'
    })
    if (s3buckets && s3buckets.length) {
      this.config.s3_buckets = {}
      s3buckets.forEach(s3bucket => {
        this.config.s3_buckets[s3bucket.LogicalResourceId] = {
          title: titleCase(s3bucket.LogicalResourceId),
          name: s3bucket.PhysicalResourceId
        }
      })
    }
  }

  loadTargetGroupConfig(stackResources) {
    const tgs = stackResources.filter(obj => {
      return obj.ResourceType == 'AWS::ElasticLoadBalancingV2::TargetGroup' &&
      obj.LogicalResourceId == 'LoadBalancerwebTargetGroupwebHTTPS'
    })
    if (tgs && tgs.length) {
      this.config.alb = []
      const targetGroupArnMatch = ':targetgroup/'
      tgs.forEach(tg => {
        const tgIndex = tg.PhysicalResourceId.lastIndexOf(targetGroupArnMatch)

        this.config.alb.push({
          targetgroup: tg.PhysicalResourceId.substring(tgIndex + targetGroupArnMatch.length)
        })
      })
    }
  }

}

module.exports = CloudFormation;
