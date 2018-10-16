const callsites = require("callsites");

var Handlebars = require("handlebars");

const fs = require("fs");
const path = require("path");

Handlebars.registerHelper("querify", object => {
  return JSON.stringify(object).replace(/"/g, "");
});

Handlebars.registerHelper("JSONStringify", object => {
  return JSON.stringify(object);
});

Handlebars.registerHelper("toLowerCase", str => {
  return str.toLowerCase();
});

function jsonFromTemplate(pathToTemplate, context) {
  const pathToCallerTemplate = path.resolve(
    path.dirname(callsites()[1].getFileName()),
    pathToTemplate
  );
  const source = fs.readFileSync(pathToCallerTemplate, "utf8");
  const template = Handlebars.compile(source);
  return JSON.parse(template(context));
}

module.exports = {
  jsonFromTemplate: jsonFromTemplate
};
