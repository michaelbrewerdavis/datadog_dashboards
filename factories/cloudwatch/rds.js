const Templates = require("../../lib/templates");
const utils = require('../lib/utils')

class CloudwatchRdsGraphFactory {
  /**
   * Returns rendered JSON template from given params.
   *
   * @param {string} template Filename of the Handlebars template to use.
   * @param {string} name Name of the AWS RDS instance.
   * @param {string} state
   */
  render(template, name, state) {
    return Templates.jsonFromTemplate(`templates/${template}.hbs`, {
      name: utils.tagName(name, 'dbinstanceidentifier:'),
      position: state.position
    });
  }
}

module.exports = CloudwatchRdsGraphFactory;
