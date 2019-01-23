const Templates = require("../../lib/templates");

class CloudwatchLambdaGraphFactory {
  constructor(region) {
    this.region = region;
  }

  /**
   * Returns rendered JSON template from given params.
   *
   * @param {string} template Filename of the Handlebars template to use.
   * @param {string} lambda Lambda configuration object.
   * @param {string} state
   */
  render(template, lambda, state) {
    return Templates.jsonFromTemplate(
      `templates/lambda_${template}.hbs`,
      {
        query: { functionname: lambda.name, region: this.region },
        position: state.position
      }
    );
  }
}

module.exports = CloudwatchLambdaGraphFactory;
