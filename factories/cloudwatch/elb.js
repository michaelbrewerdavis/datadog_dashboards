const Templates = require("../../lib/templates");

class CloudwatchElbGraphFactory {
  /**
   * Creates an ELB hit timeseries graph
   * @param {string} elb
   */
  elb_hits(elb) {
    return Templates.jsonFromTemplate("templates/elb_hits.hbs", { name: elb });
  }

  /**
   * Creates an ELB Total Request Query Value
   * @param {string} elb
   */
  elb_totalRequests(elb) {
    return Templates.jsonFromTemplate("templates/elb_totalRequests.hbs", {
      name: elb
    });
  }

  /**
   * Creates an ELB average response time graph
   * @param {string} elb
   */
  elb_latency(elb) {
    return Templates.jsonFromTemplate("templates/elb_latency.hbs", {
      name: elb
    });
  }

  /**
   * Creates an ELB Health time graph, per A-Z
   * @param {string} elb
   */
  elb_health(elb) {
    return Templates.jsonFromTemplate("templates/elb_health.hbs", {
      name: elb
    });
  }
}

module.exports = CloudwatchElbGraphFactory;
