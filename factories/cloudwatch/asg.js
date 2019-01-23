const Templates = require("../../lib/templates");

class CloudwatchAsgGraphFactory {
  /**
   * Creates a cpu usage timeseries by pool
   * @param {object} asgs
   * @param {object} state
   */
  asg_cpu(asgs, state) {
    return Templates.jsonFromTemplate("templates/asg_cpu.hbs", {
      asgs: asgs,
      width: 44,
      height: 16,
      x: 0,
      y: state.position
    });
  }

  /**
   * Creates an instance count timeseries
   * @param {object} asgs
   * @param {object} state
   */
  asg_instancesInService(asgs, state) {
    return Templates.jsonFromTemplate("templates/asg_instancesInService.hbs", {
      asgs: asgs,
      width: 44,
      height: 16,
      x: 0,
      y: state.position + 19
    });
  }

  /**
   * Creates network in/out timeseries graphs
   * @param {object} asgs
   * @param {object} state
   */
  asg_network(asgs, state) {
    var widgets = [];

    widgets.push(Templates.jsonFromTemplate("templates/asg_network.hbs", {
      type: 'In',
      asgs: asgs,
      width: 43,
      height: 16,
      x: 45,
      y: state.position
    }));
    widgets.push(Templates.jsonFromTemplate("templates/asg_network.hbs", {
      type: 'Out',
      asgs: asgs,
      width: 43,
      height: 16,
      x: 45,
      y: state.position + 19
    }));

    return widgets;
  }

  /**
   * Creates CPU and memory usage host maps
   * @param {object} vars
   * @param {object} state
   */
  asg_hosts(vars, state) {
    var widgets = [];

    const query = {
      project: vars.project.toLowerCase(),
      environment: vars.environment.toLowerCase(),
      region: vars.region,
    }

    widgets.push(Templates.jsonFromTemplate("templates/asg_host_cpu.hbs", {
      query: query,
      width: 28,
      height: 16,
      x: 89,
      y: state.position
    }));
    widgets.push(Templates.jsonFromTemplate("templates/asg_host_memory.hbs", {
      query: query,
      width: 28,
      height: 16,
      x: 89,
      y: state.position + 19
    }));

    return widgets;
  }
}

module.exports = CloudwatchAsgGraphFactory;
