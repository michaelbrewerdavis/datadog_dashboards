
ScreenboardService = require("./services/screenboard");
Screenboard = require("./screenboard");
const CLI = require("clui");
const Spinner = CLI.Spinner;
const chalk = require("chalk");

/**
 * Class for creating the dashboards from the config.
 * Currently, only supports screenboards.
 *
 * For an example of the config, please see dashboards.example.js -> dashboardsByEnvironment
 */
class Dashboards {
  /**
   * The configuration for the dashboards
   * @param {Array} dashboardsConfig
   */
  constructor(dashboardsConfig) {
    this.dashboardsConfig = dashboardsConfig;
  }

  create(apiKey, appKey) {
    const spinnerStatus = new Spinner(
      "Retrieving existing dashboards, please wait..."
    );
    spinnerStatus.start();

    const screenboardSvc = new ScreenboardService(
      apiKey,
      appKey
    );

    screenboardSvc.getAllScreenboards().then(_res => {
      spinnerStatus.stop();
      return Promise.all(
        this.dashboardsConfig.map(dashboardConfig => {
          const existingBoardId = screenboardSvc.getScreenboardIdByTitle(
            dashboardConfig.title
          );
          const jsonString = this.getDashboardJsonString(dashboardConfig);
          if (existingBoardId) {
            console.log(`Updating ${dashboardConfig.title}`);
            return screenboardSvc.updateScreenboard(
              existingBoardId,
              dashboardConfig.title,
              jsonString
            );
          } else {
            console.log(`Creating ${dashboardConfig.title}`);
            return screenboardSvc.createScreenboard(
              dashboardConfig.title,
              jsonString
            );
          }
        })
      )
        .then(() => {
          console.log();
          console.log(chalk.green.bold("Done!"));
        })
        .catch(err => {
          console.log(chalk.red.bold("Failed!"));
          console.log(err);
        });
    });
  }

  getDashboardJsonString(dashboardConfig, prettyPrint = false) {
    const screenboard = new Screenboard()
    const generated = screenboard.generateEnvironmentDashboard(dashboardConfig);
    return JSON.stringify(generated, null, prettyPrint ? 2 : null);
  }

  preview() {
    this.dashboardsConfig.map(dashboardConfig => {
      console.log(chalk.green.bold(`Dashboard - ${dashboardConfig.title}`));
      const jsonString = this.getDashboardJsonString(dashboardConfig, true);
      console.log(jsonString)
    })
  }
}

module.exports = Dashboards;
