const fetch       = require('node-fetch')
const chalk       = require('chalk')

class ScreenboardService {
  constructor(apiKey, appKey) {
    this.apiKey = apiKey
    this.appKey = appKey
    this.dashes = []
    this.getAllScreenboards = this.getAllScreenboards.bind(this);
    this.updateScreenboard = this.updateScreenboard.bind(this);
    this.createScreenboard = this.createScreenboard.bind(this);
  }

  getAllScreenboards() {
    const url = `https://api.datadoghq.com/api/v1/screen?api_key=${this.apiKey}&application_key=${this.appKey}`
    return fetch(url, {
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
      this.dashes = json.screenboards
      return json
    })
    .catch((err) => {
      console.log(err)
    })
  }

  updateScreenboard(id, title, body) {
    const url = `https://api.datadoghq.com/api/v1/screen/${id}?api_key=${this.apiKey}&application_key=${this.appKey}`
    return fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    })
    .then(response => {
      if (response.status !== 200) {
        console.log(chalk.red(`Error encountered: (${response.status}) ${response.statusText}`))
        throw 'PUT error'
      } else {
        console.log(
          chalk.green(`Updated ${title} dashboard!`)
        )
      }
    })
  }

  createScreenboard(title, body) {
    const url = `https://api.datadoghq.com/api/v1/screen?api_key=${this.apiKey}&application_key=${this.appKey}`
    return fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: body
    })
    .then(res => {
      if (res.status !== 200) {
        console.log(chalk.red(`Error encountered: (${res.status}) ${res.statusText}`))
        throw 'POST error'
      } else {
        console.log(
          chalk.green(`Created ${title} dashboard!`)
        )
        return res.json()
      }
    })
    .then((json) => {
      this.dashes.push(json) // has the id and title which is all we query on at the moment
      return json
    })
    .catch((err) => {
      console.log(err)
    })
  }

  getScreenboardIdByTitle(title) {
    const dashboard = this.dashes.find(x => x.title === title)
    return dashboard ? dashboard.id : undefined
  }
}

module.exports = ScreenboardService
