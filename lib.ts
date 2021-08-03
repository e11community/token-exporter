const os = require('os')
const fs = require('fs')
const path = require('path')
const str = require('./strings.js')

function findTokensFromNpmrc() {
  const npmrcPath = path.join(os.homedir(), '.npmrc')

  if (!fs.existsSync(npmrcPath)) {
    console.error("No .npmrc under HOME!")
    return null
  }

  const lines = fs.readFileSync(npmrcPath, 'utf8')
    .split('\n')
    .map(line => line.trim())
  const registries = {}
  const locations = {}

  lines.forEach(line => {
    var registrySeek = [...line.matchAll(/^@([^:]+):registry=https?:(.+)/g)]

    if (registrySeek.length > 0) {
      var key = registrySeek[0][1]
      var location = registrySeek[0][2]
      registries[location] = { key: key, location: location }
      if (locations[location]) {
        registries[location].token = locations[location].token
      }
    } else {
      var tokenSeek = [...line.matchAll(/^([^:]+):_authToken=([a-f0-9]+)/g)]

      if (tokenSeek.length > 0) {
        var location = tokenSeek[0][1]
        var token = tokenSeek[0][2]
        if (registries[location]) {
          var existingRegistry = registries[location]
          existingRegistry.token = token
        } else {
          locations[location] = { token: token }
        }
      }
    } 
  })

  return registries
}

function generateExportScript(registries) {
  for (location in registries) {
    if (registries[location].token) {
      const envarKey = str.toEnvarCase(registries[location].key)
      console.log('export ' + envarKey + '_NPM_AUTH_TOKEN=' + registries[location].token)
    }
  }
}

function findAndGenerate() {
  generateExportScript(findTokensFromNpmrc())
}

module.exports = findAndGenerate
