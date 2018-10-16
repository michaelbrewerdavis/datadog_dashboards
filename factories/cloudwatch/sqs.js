const Templates = require("../../lib/templates");

class CloudwatchSqsGraphFactory {
  constructor(region) {
    this.region = region;
  }

  /**
   * Creates an SQS Deleted timeseries graph
   * @param {object} name
   */
  sqs_deleted(name) {
    const queryObject = { queuename: name, region: this.region };

    return Templates.jsonFromTemplate("templates/sqs_deleted.hbs", {
      queryObject
    });
  }

  /**
   * Creates an SQS Deleted Count Query Value
   * @param {object} name
   */
  sqs_deletedCount(name) {
    const queryObject = { queuename: name, region: this.region };

    return Templates.jsonFromTemplate("templates/sqs_deletedCount.hbs", {
      queryObject
    });
  }
  /**
   * Creates an SQS Visibility timeseries graph
   * @param {object} name
   */
  sqs_visibility(name) {
    const queryObject = { queuename: name, region: this.region };

    return Templates.jsonFromTemplate("templates/sqs_visibility.hbs", {
      queryObject
    });
  }

  /**
   * Creates an SQS Visibility Count Query Value
   * @param {object} name
   */
  sqs_visibilityCount(name) {
    const queryObject = { queuename: name, region: this.region };

    return Templates.jsonFromTemplate("templates/sqs_visibilityCount.hbs", {
      queryObject
    });
  }
}

module.exports = CloudwatchSqsGraphFactory;
