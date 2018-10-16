const Templates = require("../../lib/templates");

class CloudwatchRdsGraphFactory {
  /**
   * Creates an RDS Burst Balance timeseries graph
   * @param {string} dbinstanceidentifier
   */
  rds_burstBalance(dbinstanceidentifier) {
    return Templates.jsonFromTemplate("templates/rds_burstBalance.hbs", {
      dbinstanceidentifier
    });
  }

  /**
   * Creates an RDS CPU timeseries graph
   * @param {string} dbinstanceidentifier
   */
  rds_cpu(dbinstanceidentifier) {
    return Templates.jsonFromTemplate("templates/rds_cpu.hbs", {
      dbinstanceidentifier
    });
  }

  /**
   * Creates an RDS Connections graph
   * @param {string} dbinstanceidentifier
   */
  rds_connections(dbinstanceidentifier) {
    return Templates.jsonFromTemplate("templates/rds_connections.hbs", {
      dbinstanceidentifier
    });
  }

  /**
   * Creates an RDS IOS timeseries graph
   * @param {string} dbinstanceidentifier
   */
  rds_iops(dbinstanceidentifier) {
    return Templates.jsonFromTemplate("templates/rds_iops.hbs", {
      dbinstanceidentifier
    });
  }

  /**
   * Creates an RDS Memory timeseries graph
   * @param {string} dbinstanceidentifier
   */
  rds_memory(dbinstanceidentifier) {
    return Templates.jsonFromTemplate("templates/rds_memory.hbs", {
      dbinstanceidentifier
    });
  }

  /**
   * Creates an RDS Storage timeseries graph
   * @param {string} dbinstanceidentifier
   */
  rds_storage(dbinstanceidentifier) {
    return Templates.jsonFromTemplate("templates/rds_storage.hbs", {
      dbinstanceidentifier
    });
  }

  /**
   * Creates an RDS Throughput timeseries graph
   * @param {string} dbinstanceidentifier
   */
  rds_throughput(dbinstanceidentifier) {
    return Templates.jsonFromTemplate("templates/rds_throughput.hbs", {
      dbinstanceidentifier
    });
  }
}

module.exports = CloudwatchRdsGraphFactory;
