const Templates = require("../../lib/templates");

class CloudwatchSqsGraphFactory {
  constructor(region) {
    this.region = region;
  }

  /**
   * Returns rendered JSON template from given params.
   *
   * @param {string} template Filename of the Handlebars template to use.
   * @param {string} queue SQS Queue configuration object.
   * @param {string} state
   */
  render(template, queue, state) {
    var position = state.position;

    if (template === 'deletedCount') {
      position += 10;
    }

    return Templates.jsonFromTemplate(
      `templates/sqs_${template}.hbs`,
      {
        query: { queuename: queue.name, region: this.region },
        queue: queue,
        position: position
      }
    );
  }
}

module.exports = CloudwatchSqsGraphFactory;
