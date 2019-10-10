#!/usr/bin/env node

// Command-line tool to generate datadog dashboards from a config file
require("dotenv").config();

Dashboards = require("./dashboards");

const { version } = require('./package.json');

const chalk = require("chalk");
const CLI = require("clui");
const figlet = require("figlet");

const prompt = require("prompt-sync")();
const path = require("path");
const ROOT_PATH = process.cwd();

const program = require("commander");

program
  .version(version)
  .usage("[options] <file ...>")
  .option("-d, --dashboards [value]", "The dashboards config file")
  .option("-p, --preview", "Preview the JSON, don't create the dashboard")
  .parse(process.argv);

console.log(
  chalk.magenta(figlet.textSync("Datadog", { horizontalLayout: "full" }))
);
console.log(
  chalk.magenta(figlet.textSync("Dashboards", { horizontalLayout: "full" }))
);

const DATADOG_API_APP_KEY = process.env.DATADOG_API_APP_KEY;
const DATADOG_API_API_KEY = process.env.DATADOG_API_API_KEY;

const dashboard =
  program.dashboards ||
  process.env.DATADOG_DASHBOARD_JS ||
  prompt("Dashboards path: ");

console.log(`Dashboard: ${dashboard}`);

let dashboardsConfig;

try {
  dashboardsConfig = require(path.join(ROOT_PATH, dashboard));
} catch (err) {
  exitProgram(`Dashboard file error: ${err}`);
}

if (!DATADOG_API_APP_KEY || !DATADOG_API_API_KEY) {
  exitProgram("Datadog keys DATADOG_API_APP_KEY && DATADOG_API_API_KEY not found");
}

function exitProgram(text) {
  console.log(chalk.red(text))
  program.outputHelp();
  process.exit(1);
}

const dashboards = new Dashboards(dashboardsConfig.dashboardsByEnvironment)

if (program.preview) {
  dashboards.preview()
} else {
  dashboards.create(DATADOG_API_API_KEY, DATADOG_API_APP_KEY)
}
