const Templates = require("../../lib/templates");

class HostGraphFactory {
  constructor(region) {
    this.region = region;
  }

  /**
   * Creates a cpu load host map
   * @param {object} query
   * @param {object} group
   */
  host_cpuLoad(query, group) {
    const queryObject = Object.assign(
      query,
      this.region && { region: this.region }
    );

    const context = Object.assign({ queryObject }, { group });
    return Templates.jsonFromTemplate("templates/host_cpuLoad.hbs", context);
  }

  /**
   * Creates a mem used host map
   * @param {object} query
   * @param {object} group
   */
  host_memUsed(query, group) {
    const queryObject = Object.assign(
      query,
      this.region && { region: this.region }
    );

    const context = Object.assign({ queryObject }, { group });
    return Templates.jsonFromTemplate("templates/host_memUsed.hbs", context);
  }
}

module.exports = HostGraphFactory;
