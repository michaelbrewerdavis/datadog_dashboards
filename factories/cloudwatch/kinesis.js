const Templates = require("../../lib/templates");

class CloudwatchKinesisGraphFactory {
  /**
   * Returns rendered JSON template from given params.
   *
   * @param {string} template Filename of the Handlebars template to use.
   * @param {string} lambda Lambda configuration object.
   * @param {string} state
   */
  render(template, lambda, state) {
    return Templates.jsonFromTemplate(
      `templates/kinesis_${template}.hbs`,
      {
        name: lambda.name,
        position: state.position
      }
    );
  }
}

module.exports = CloudwatchKinesisGraphFactory;
