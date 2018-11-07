const Templates = require("../../lib/templates");

class CustomGraphFactory {
  /**
   * Creates a custom timeseries graph
   * @param {object} options
   */
  timeseries(options) {
    return Templates.jsonFromTemplate("templates/timeseries.hbs", options);
  }
}

module.exports = CustomGraphFactory;
