const chalk = require("chalk");

class CustomWidgetFactory {
  /**
   * Returns rendered JSON template from given params.
   *
   * @param {string} widget Custom widget configuration object.
   * @param {string} state
   */
  render(widget, state) {
    if (!'y' in widget) {
      console.log(chalk.red('Custom widgets should explicitly define "y" position, defaulting to 0.'));
    }
    widget['y'] = state.position + (widget['y'] || 0);

    return widget;
  }
}

module.exports = CustomWidgetFactory;
