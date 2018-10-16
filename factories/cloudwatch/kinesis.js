const Templates = require("../../lib/templates");

class CloudwatchKinesisGraphFactory {
  /**
   * Creates a Kinesis iterator age timeseries graph
   * @param {string} name
   */
  kinesis_iteratorAge(name) {
    return Templates.jsonFromTemplate("templates/kinesis_iteratorAge.hbs", {
      name
    });
  }

  /**
   * Creates a Kinesis records timeseries graph
   * @param {string} name
   */
  kinesis_records(name) {
    return Templates.jsonFromTemplate("templates/kinesis_records.hbs", {
      name
    });
  }
}

module.exports = CloudwatchKinesisGraphFactory;
