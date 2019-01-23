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

## Configuration

By default, the Datadog dashboard creator will iterate through the
`dashboardsByEnvironment` exposed in the dashboard.js file and run the
`generateEnvironmentDashboard` function that has a set of default dashboards
depending on the configurations in the `dashboardsByEnvironment`.

Your dashboards.js file should have at least the `dashboardsByEnvironment`
object exported.

See the `dashboards.examples.js` as an example dashboard configuration.

## Custom Widgets

Many canned sets of widgets for various core AWS resource types are provided out
of the box, but you may wish to include your own completely custom widgets on
your dashboards as well, or build dashboards with entirely custom widgets. This
is done by configuring new widgets in `custom` key, using the JSON structure
documented in Datadog here:

 * https://docs.datadoghq.com/graphing/dashboards/widgets/

Since dashboards are built as Screenboards, you must still explicitly define the
positioning and size of your widgets. Always assume all widgets defined within
the `custom` config key are positioned relative to y = 0, for **all** custom
widgets you add (as all of them will be positioned in the same area). For
example, if you want widgets on a second row, you must specify that the y
position for those widgets add in the height of the first row, plus a bit extra
for spacing (usually 3 units). The script will automatically re-calculate the y
position of all widgets before adding them to your dashboard to account for
spacing before/after the custom graphs section. You must also define the total
height you want to reserve for your custom widgets using the `custom_height`
attribute. Any additional canned widgets will be positioned just beyond that
height, so it's important to reserve this space, or canned widgets will be
positioned directly on top of your custom widgets.

## Environment variables

Datadog Dashboard Creator uses dotenv to allow for a `.env` file to have locally
defined environment variables.

If you want to define these, they can bypass the prompts:

```
DATADOG_API_API_KEY=<datadog_api_key>
DATADOG_API_APP_KEY=<datadog_app_key>
DATADOG_DASHBOARD_JS=dashboards
```
