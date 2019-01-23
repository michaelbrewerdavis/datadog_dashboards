const Templates = require("../../lib/templates");

class CloudwatchS3GraphFactory {
  /**
   * Returns rendered JSON template from given params.
   *
   * @param {string} template Filename of the Handlebars template to use.
   * @param {string} bucket S3 bucket configuration object.
   * @param {string} state
   */
  render(template, bucket, state) {
    var position = state.position;

    if (template === 'totalSize') {
      position += 10;
    }

    return Templates.jsonFromTemplate(
      `templates/s3_${template}.hbs`,
      {
        query: { bucketname: bucket.name },
        position: position
      }
    );
  }
}

module.exports = CloudwatchS3GraphFactory;
