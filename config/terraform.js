var AWS = require("aws-sdk");
const titleCase = require('title-case');

/**
 * Class for creating the dashboard config pull resource information from terraform state.
 * For an example of the config, please see dashboards.example.js -> dashboardsByEnvironment
 */
class Terraform {
  /**
   * Initializes for loading the config.
   * @param {*} region
   * @param {*} terraformS3Bucket
   * @param {*} terraformS3KeyPrefix
   */
  constructor(region, terraformS3Bucket, terraformS3KeyPrefix) {
    this.region = region;
    this.bucket = terraformS3Bucket;
    this.prefix = terraformS3KeyPrefix;
    this.config = {};
    this.s3 = new AWS.S3({
      region: region
    });
  }

  async getTfDataFromS3Object(obj) {
    var s3Data = await this.s3.getObject({
      Bucket: this.bucket,
      Key: `${obj.Key}`
    }).promise()

    let tfData = s3Data.Body.toString('utf-8'); // Use the encoding necessary
    let tf = JSON.parse(tfData)
    let resources = []
    tf.modules.forEach(elem => {
      resources = resources.concat(Object.values(elem.resources))
    })
    return resources;
  }

  /**
   * Get the dashboard config
   */
  async getDashboardConfig() {
    var paramsS3 = {
      Bucket: this.bucket,
      Prefix: this.prefix
    };

    var listData = await this.s3.listObjects(paramsS3).promise()

    let resources = []

    await Promise.all(
      listData.Contents.map(async obj => {
        const tfResources = await this.getTfDataFromS3Object(obj)

        resources = resources.concat(tfResources)
      })
    )
    this.config = {}

    this.loadDynamoDbConfig(resources)
    this.loadS3Config(resources)
    this.loadLambdaConfig(resources)

    return this.config;
  }

  loadDynamoDbConfig(terraformResources) {
    var ddbTables = this.getResourceByType(terraformResources, 'aws_dynamodb_table');
    if (ddbTables && ddbTables.length) {
      this.config.dynamo_tables = {}
      ddbTables.forEach(table => {
        this.config.dynamo_tables[table] = {
          name: table,
          title: titleCase(table)
        }
      })
    }
  }

  loadS3Config(terraformResources) {
    var buckets = this.getResourceByType(terraformResources, 'aws_s3_bucket');
    if (buckets && buckets.length) {
      this.config.s3_buckets = {}
      buckets.forEach(bucket => {
        this.config.s3_buckets[bucket] = {
          name: bucket,
          title: titleCase(bucket)
        }
      })
    }
  }

  loadLambdaConfig(terraformResources) {
    var lambdas = this.getResourceByType(terraformResources, 'aws_lambda_function');
    if (lambdas && lambdas.length) {
      this.config.lambdas = {}
      lambdas.forEach(lambda => {
        this.config.lambdas[lambda] = {
          name: lambda,
          title: titleCase(lambda)
        }
      })
    }
  }

  getResourceByType(resources, type) {
    return resources.reduce(function(result, resource) {
      if (resource.type === type) {
        result.push(resource.primary.id);
      }
      return result
    }, [])
  }
}

module.exports = Terraform;
