const Templates = require("../../lib/templates");

class CloudwatchElasticacheGraphFactory {
  /**
   * Returns rendered JSON template from given params.
   *
   * @param {string} template Filename of the Handlebars template to use.
   * @param {string} cache ElastiCache configuration object.
   * @param {string} state
   */
  render(template, cache, state) {
    return Templates.jsonFromTemplate(
      `templates/elasticache_${template}.hbs`,
      {
        name: cache.name,
        title: cache.title,
        position: state.position
      }
    );
  }
}

module.exports = CloudwatchElasticacheGraphFactory;
