const Templates = require("../../lib/templates");

class CloudwatchAlbGraphFactory {
  /**
   * Creates an ALB hit timeseries graph
   * @param {string} alb
   */
  alb_hits(alb) {
    return Templates.jsonFromTemplate("templates/alb_hits.hbs", { name: alb });
  }

  /**
   * Creates an ALB Total Request Query Value
   * @param {string} alb
   */
  alb_totalRequests(alb) {
    return Templates.jsonFromTemplate("templates/alb_totalRequests.hbs", {
      name: alb
    });
  }

  /**
   * Creates an ALB average response time graph
   * @param {string} alb
   */
  alb_latency(alb) {
    return Templates.jsonFromTemplate("templates/alb_latency.hbs", {
      name: alb
    });
  }

  /**
   * Creates an ALB Health time graph, per A-Z
   * @param {string} alb
   */
  alb_health(alb) {
    return Templates.jsonFromTemplate("templates/alb_health.hbs", {
      name: alb
    });
  }
}

module.exports = CloudwatchAlbGraphFactory;
