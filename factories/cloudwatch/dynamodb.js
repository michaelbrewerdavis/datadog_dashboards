const Templates = require("../../lib/templates");

class CloudwatchDynamoPanelFactory {
  constructor(region) {
    this.region = region;
  }

  /**
   * Creates a dynamo units panel
   * @param {string} readWrite - Should be Read or Write
   * @param {object} query
   */
  dynamodb_units(readWrite, query) {
    const readWriteValue = readWrite.toLowerCase();
    const queryObject = Object.assign(
      query,
      this.region && { region: this.region }
    );
    const context = Object.assign(
      { queryObject },
      { readWrite: readWriteValue }
    );

    return Templates.jsonFromTemplate("templates/dynamodb_units.hbs", context);
  }
}

module.exports = CloudwatchDynamoPanelFactory;
