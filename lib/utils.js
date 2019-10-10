function envShort(environment) {
  switch(environment) {
    case 'production': return 'prod';
    case 'performance': return 'perf';
    case 'development': return 'dev';
    case 'staging': return 'staging';
    case 'edge': return 'edge';
    case 'beta': return 'beta';
  }
}

function airportCode (region) {
  switch(region) {
    case 'us-east-1': return 'iad';
    case 'us-east-2': return 'cmh';
    case 'us-west-2': return 'pdx';
    case 'ap-southeast-1': return 'sin';
    case 'ap-southeast-2': return 'syd';
    case 'eu-west-1': return 'dub';
  }
}

function regionEnv (region, environment) {
  return `${this.airportCode(region)}-${this.envShort(environment)}`
}

function parameterize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
};

module.exports = {
  airportCode,
  envShort,
  regionEnv,
  parameterize
};
