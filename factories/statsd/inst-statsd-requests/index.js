const Templates = require("../../../lib/templates");

function generateScope(requests, project, environment, region) {
  var tags = []

  const scope = {
    project: project.toLowerCase(),
    environment: environment.toLowerCase(),
    region: region,
  }

  for (const key in scope) {
    tags.push(`${key}:${scope[key]}`)
  }

  if (requests.excluded_tags) {
    for (const tag of requests.excluded_tags) {
      tags.push('!' + tag)
    }
  }

  return tags.join(',')
}

class InstStatsdRequestsGraphFactory {
  constructor(requests, project, environment, region) {
    this.scope = generateScope(requests, project, environment, region)
    this.metricPrefix = requests.metric_prefix || 'request'
  }

  /**
   * Creates a requests total time timeseries graph
   * @param {object} state
   */
  totalTimeGraph(state) {
    return Templates.jsonFromTemplate("templates/totalTimeTimeseries.hbs", {
      metricPrefix: this.metricPrefix,
      scope: this.scope,
      width: 58,
      height: 27,
      x: 0,
      y: state.position
    });
  }

  /**
   * Creates a requests count timeseries graph
   * @param {object} state
   */
  countGraph(state) {
    return Templates.jsonFromTemplate("templates/countTimeseries.hbs", {
      metricPrefix: this.metricPrefix,
      scope: this.scope,
      width: 58,
      height: 27,
      x: 59,
      y: state.position
    });
  }

  /**
   * Creates a row of toplists for request count, total time, db time, view time
   * @param {object} state
   */
  toplists(state) {
    var widgets = [];
    var offset = 0;

    // These widgets have slightly different widths to keep the margins aligned
    // with the graphs rendered above them

    widgets.push(Templates.jsonFromTemplate("templates/toplist.hbs", {
      title: 'Requests by Count',
      metricPrefix: this.metricPrefix,
      metric: 'total.count',
      scope: this.scope,
      width: 29,
      height: 13,
      x: offset,
      y: state.position
    }));
    offset += 30

    widgets.push(Templates.jsonFromTemplate("templates/toplist.hbs", {
      title: 'Requests by Total Time (95%ile)',
      metricPrefix: this.metricPrefix,
      metric: 'total.95percentile',
      scope: this.scope,
      width: 28,
      height: 13,
      x: offset,
      y: state.position
    }));
    offset += 29

    widgets.push(Templates.jsonFromTemplate("templates/toplist.hbs", {
      title: 'Requests by DB Time (95%ile)',
      metricPrefix: this.metricPrefix,
      metric: 'db.95percentile',
      scope: this.scope,
      width: 29,
      height: 13,
      x: offset,
      y: state.position
    }));
    offset += 30

    widgets.push(Templates.jsonFromTemplate("templates/toplist.hbs", {
      title: 'Requests by View Time (95%ile)',
      metricPrefix: this.metricPrefix,
      metric: 'view.95percentile',
      scope: this.scope,
      width: 28,
      height: 13,
      x: offset,
      y: state.position
    }));

    return widgets;
  }
}

module.exports = InstStatsdRequestsGraphFactory;
