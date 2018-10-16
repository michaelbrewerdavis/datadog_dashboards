const Templates = require("../../lib/templates");

class CloudwatchEc2GraphFactory {
  /**
   * Creates a cpu usage timeseries by pool
   * @param {object} asgs
   */
  ec2_cpu(asgs) {
    return Templates.jsonFromTemplate("templates/ec2_cpu.hbs", { asgs });
  }
}

module.exports = CloudwatchEc2GraphFactory;
