const fetch       = require('node-fetch')
const chalk       = require('chalk')

class TimeboardService {
  constructor(apiKey, appKey) {
    this.apiKey = apiKey
    this.appKey = appKey
    this.dashes = []
    this.getAllDashboards = this.getAllDashboards.bind(this);
    this.updateDashboard = this.updateDashboard.bind(this);
    this.createDashboard = this.createDashboard.bind(this);
  }

  getAllDashboards() {
    const timeboardUrl = `https://api.datadoghq.com/api/v1/dash?api_key=${this.apiKey}&application_key=${this.appKey}`
    return fetch(timeboardUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then(res => {
      if (res.status !== 200) {
        console.log(chalk.red(`Error encountered: (${res.status}) ${res.statusText}`))
        throw 'GET error'
      } else {
        console.log(
          chalk.green(`Retrieve successful`)
        )
        return res.json()
      }
    })
    .then((json) => {
      this.dashes = json.dashes
      return json
    })
    .catch((err) => {
      console.log(err)
    })
  }

  updateDashboard(timeboardId, timeboardTitle, timeboardBody) {
    const timeboardUrl = `https://api.datadoghq.com/api/v1/dash/${timeboardId}?api_key=${this.apiKey}&application_key=${this.appKey}`
    return fetch(timeboardUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: timeboardBody
    })
    .then(response => {
      if (response.status !== 200) {
        console.log(chalk.red(`Error encountered: (${response.status}) ${response.statusText}`))
        throw 'PUT error'
      } else {
        console.log(
          chalk.green(`Updated ${timeboardTitle} dashboard!`)
        )
      }
    })
  }

  createDashboard(timeboardTitle, timeboardBody) {
    const timeboardUrl = `https://api.datadoghq.com/api/v1/dash?api_key=${this.apiKey}&application_key=${this.appKey}`
    return fetch(timeboardUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: timeboardBody
    })
    .then(res => {
      if (res.status !== 200) {
        console.log(chalk.red(`Error encountered: (${res.status}) ${res.statusText}`))
        throw 'POST error'
      } else {
        console.log(
          chalk.green(`Created ${timeboardTitle} dashboard!`)
        )
        return res.json()
      }
    })
    .then((json) => {
      this.dashes.push(json.dash) // has the id and title which is all we query on at the moment
      return json
    })
    .catch((err) => {
      console.log(err)
    })
  }

  getDashboardIdByTitle(title) {
    const dashboard = this.dashes.find(x => x.title === title)
    return dashboard ? dashboard.id : undefined
  }
}

module.exports = TimeboardService
