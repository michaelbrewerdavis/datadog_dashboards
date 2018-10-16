A quick way to generate helpful, pre-canned Datadog dashboards for Cloudwatch.

## Setup

 * Run `npm install -g datadog_dashboards`
 * Edit `dashboards.js` with your dashboard changes. See this package's `dashboards.example.js` for a starter.

## Uploading new dashboards

 * Run `datadog_dashboards`
 * Done

Alternatively, you can specify a dashboard file with the `-d` setting.

For example

$ `datadog_dashboards -d <dashboard_file>`

## Customization

 By default, the Datadog dashboard creator will iterate through the `dashboardsByEnvironment` exposed in the dashboard.js file and run the `generateEnvironmentDashboard` function that has a set of default dashboards depending on the configurations in the `dashboardsByEnvironment`.

 Your dashboards.js file should have at least the `dashboardsByEnvironment` object exported.

 See the `dashboards.examples.js` as an example dashboard configuration.

## Environment variables

 Datadog Dashboard Creator uses dotenv to allow for a `.env` file to have locally defined environment variables.

 If you want to define these, they can bypass the prompts:

```
DATADOG_API_API_KEY=<datadog_api_key>
DATADOG_API_APP_KEY=<datadog_app_key>
DATADOG_DASHBOARD_JS=dashboards
```
