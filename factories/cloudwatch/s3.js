const Templates = require("../../lib/templates");

class CloudwatchS3GraphFactory {
  /**
   * Creates an S3 Query value.
   * @param {string} name
   */
  s3_bucketSize(name) {
    return Templates.jsonFromTemplate("templates/s3_bucketSize.hbs", { name });
  }
}

module.exports = CloudwatchS3GraphFactory;
