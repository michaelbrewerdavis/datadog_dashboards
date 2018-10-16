const Templates = require("../../lib/templates");

class CloudwatchAsgGraphFactory {
  /**
   * Creates an instance count timeseries
   * @param {object} asgs
   */
  asg_instancesInService(asgs) {
    return Templates.jsonFromTemplate("templates/asg_instancesInService.hbs", {
      asgs
    });
  }
}

module.exports = CloudwatchAsgGraphFactory;
