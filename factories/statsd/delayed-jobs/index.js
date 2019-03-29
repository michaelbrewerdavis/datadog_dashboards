const Templates = require("../../../lib/templates");

function generateScope(project, environment, region) {
  var tags = []
  const scope = {
    project: project.toLowerCase(),
    environment: environment.toLowerCase(),
    region: region,
  }

  for (const key in scope) {
    tags.push(`${key}:${scope[key]}`)
  }

  return tags.join(',')
}

class DelayedJobsGraphFactory {
  constructor(delayed_jobs, project, environment, region) {
    this.scope = generateScope(project, environment, region)
    this.metricPrefix = delayed_jobs.metric_prefix || 'delayedjob'
  }

  /**
   * Creates a veritcal set of job execution and failed value widgets
   * @param {object} state
   * @param {x_offset} all widgets' x position will have this offset
   */
  executedFailedCounts(state, x_offset) {
    var widgets = []
    var y_offset = 0

    widgets.push(Templates.jsonFromTemplate("templates/queryvalue.hbs", {
      title: "Executed Jobs",
      query: `sum:${this.metricPrefix}.run{${this.scope}}.as_count()`,
      width: 20,
      height: 13,
      x: x_offset,
      y: state.position + y_offset
    }));

    y_offset += 16

    widgets.push(Templates.jsonFromTemplate("templates/queryvalue.hbs", {
      title: "Failed Jobs",
      query: `sum:${this.metricPrefix}.failed{${this.scope}}.as_count()`,
      width: 20,
      height: 13,
      x: x_offset,
      y: state.position + y_offset
    }));

    y_offset += 16

    widgets.push(Templates.jsonFromTemplate("templates/queryvalue.hbs", {
      title: "% Failed Jobs",
      query: `100*sum:${this.metricPrefix}.failed{${this.scope}}.as_count()/sum:${this.metricPrefix}.run{${this.scope}}.as_count()`,
      width: 20,
      height: 13,
      x: x_offset,
      y: state.position + y_offset
    }));

    return widgets;
  }

  /**
   * Creates a veritcal set of job execution and failed timeseries widgets
   * @param {object} state
   * @param {x_offset} all widgets' x position will have this offset
   */
  executedFailedTimeseries(state, x_offset) {
    var widgets = []
    var y_offset = 0

    widgets.push(Templates.jsonFromTemplate("templates/timeseries.hbs", {
      title: "Executed Jobs",
      query: `sum:${this.metricPrefix}.run{${this.scope}}.as_count()`,
      type: "bars",
      width: 44,
      height: 13,
      x: x_offset,
      y: state.position + y_offset
    }));

    y_offset += 16

    widgets.push(Templates.jsonFromTemplate("templates/timeseries.hbs", {
      title: "Failed Jobs",
      query: `sum:${this.metricPrefix}.failed{${this.scope}}.as_count()`,
      type: "bars",
      width: 44,
      height: 13,
      x: x_offset,
      y: state.position + y_offset
    }));

    y_offset += 16

    widgets.push(Templates.jsonFromTemplate("templates/timeseries.hbs", {
      title: "Job Queue Depth",
      query: `sum:${this.metricPrefix}.queue_depth{${this.scope}}`,
      type: "bars",
      width: 44,
      height: 13,
      x: x_offset,
      y: state.position + y_offset
    }));

    return widgets;
  }

  /**
   * Creates a veritcal set of timeseries widgets, one for runtime one for queue age
   * @param {object} state
   * @param {x_offset} all widgets' x position will have this offset
   */
  runtimeAndOldestJob(state, x_offset) {
    var widgets = []
    var y_offset = 0

    widgets.push(Templates.jsonFromTemplate("templates/runtime.hbs", {
      title: "Job Runtime (ms)",
      metricPrefix: this.metricPrefix,
      scope: this.scope,
      width: 51,
      height: 29,
      x: x_offset,
      y: state.position + y_offset
    }));

    y_offset += 32

    widgets.push(Templates.jsonFromTemplate("templates/timeseries.hbs", {
      title: "Oldest Job in Queue (seconds)",
      query: `max:${this.metricPrefix}.queue_age_max{${this.scope}}`,
      type: "line",
      width: 51,
      height: 13,
      x: x_offset,
      y: state.position + y_offset
    }));

    return widgets;
  }
}

module.exports = DelayedJobsGraphFactory;
