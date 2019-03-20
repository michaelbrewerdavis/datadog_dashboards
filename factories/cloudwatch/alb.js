const Templates = require("../../lib/templates");

class CloudwatchAlbGraphFactory {
  /**
   * Creates an ALB hit timeseries graph
   * @param {string} alb
   * @param {object} state
   */
  alb_hits(alb, state) {
    return Templates.jsonFromTemplate("templates/alb_hits.hbs", {
      targetgroup: alb.targetgroup,
      width: 52,
      height: 27,
      x: 21,
      y: state.position
    });
  }

  /**
   * Creates an ALB Total Request Query Value
   * @param {string} alb
   * @param {object} state
   */
  alb_totalRequests(alb, state) {
    var widgets = [];
    var codes = ['2xx', '4xx', '5xx'];
    var offset = 0;

    for (const code of codes) {
      widgets.push(Templates.jsonFromTemplate("templates/alb_totalRequests.hbs", {
        code: code,
        targetgroup: alb.targetgroup,
        width: 20,
        height: 7,
        x: 0,
        y: state.position + offset
      }));
      offset += 10;
    }

    return widgets;
  }

  /**
   * Creates an ALB average response time graph
   * @param {string} alb
   * @param {object} state
   */
  alb_latency(alb, state) {
    return Templates.jsonFromTemplate("templates/alb_latency.hbs", {
      targetgroup: alb.targetgroup,
      width: 43,
      height: 12,
      x: 74,
      y: state.position
    });
  }

  /**
   * Creates an ALB Health time graph, per A-Z
   * @param {string} alb
   * @param {object} state
   */
  alb_health(alb, state) {
    return Templates.jsonFromTemplate("templates/alb_health.hbs", {
      targetgroup: alb.targetgroup,
      width: 43,
      height: 12,
      x: 74,
      y: state.position + 15
    });
  }
}

module.exports = CloudwatchAlbGraphFactory;
