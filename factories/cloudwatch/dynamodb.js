const Templates = require("../../lib/templates");

class CloudwatchDynamoPanelFactory {
  constructor(region) {
    this.region = region;
  }

  /**
   * Creates a dynamo read/write capacity units panel
   *
   * @param {object} table
   * @param {object} state
   */
  units(table, state) {
    var widgets = [];
    var query = { tablename: table.name, region: this.region }

    widgets.push(Templates.jsonFromTemplate("templates/dynamodb_units.hbs", {
      mode: 'Read',
      query: query,
      width: 39,
      height: 13,
      x: 0,
      y: state.position
    }));
    widgets.push(Templates.jsonFromTemplate("templates/dynamodb_units.hbs", {
      mode: 'Write',
      query: query,
      width: 39,
      height: 13,
      x: 40,
      y: state.position
    }));

    return widgets;
  }

  /**
   * Creates a dynamo read/write throttled panel
   *
   * @param {object} table
   * @param {object} state
   */
  throttled(table, state) {
    return Templates.jsonFromTemplate("templates/dynamodb_throttled.hbs", {
      query: { tablename: table.name, region: this.region },
      width: 37,
      height: 13,
      x: 80,
      y: state.position
    });
  }
}

module.exports = CloudwatchDynamoPanelFactory;
