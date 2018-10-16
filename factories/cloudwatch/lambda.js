const Templates = require("../../lib/templates");

class CloudwatchLambdaGraphFactory {
  constructor(region) {
    this.region = region;
  }

  /**
   * Creates a lambda duration timeseries graph
   * @param {object} name
   */
  lambda_duration(name) {
    const queryObject = { region: this.region, functionname: name };

    return Templates.jsonFromTemplate("templates/lambda_duration.hbs", {
      queryObject
    });
  }

  /**
   * Creates a lambda invocations timeseries graph
   * @param {object} name
   */
  lambda_invocations(name) {
    const queryObject = { region: this.region, functionname: name };

    return Templates.jsonFromTemplate("templates/lambda_invocations.hbs", {
      queryObject
    });
  }
}

module.exports = CloudwatchLambdaGraphFactory;
