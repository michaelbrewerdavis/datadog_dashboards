const Templates = require("../../lib/templates");

class CloudwatchElasticacheGraphFactory {
  /**
   * Creates an Elasticache Bytes Used timeseries graph
   * @param {string} name
   */
  elasticache_bytesUsed(name) {
    return Templates.jsonFromTemplate("templates/elasticache_bytesUsed.hbs", {
      name
    });
  }

  /**
   * Creates an Elasticache Current Items timeseries graph
   * @param {string} name
   */
  elasticache_currentItems(name) {
    return Templates.jsonFromTemplate(
      "templates/elasticache_currentItems.hbs",
      { name }
    );
  }

  /**
   * Creates an Elasticache Freeable Memory timeseries graph
   * @param {string} name
   */
  elasticache_freeableMemory(name) {
    return Templates.jsonFromTemplate(
      "templates/elasticache_freeableMemory.hbs",
      { name }
    );
  }

  /**
   * Creates an Elasticache Hits timeseries graph
   * @param {string} name
   */
  elasticache_hits(name) {
    return Templates.jsonFromTemplate("templates/elasticache_hits.hbs", {
      name
    });
  }
}

module.exports = CloudwatchElasticacheGraphFactory;
