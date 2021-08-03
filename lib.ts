import os = require('os')
import fs = require('fs')
import path = require('path')
import str = require('./strings.js')

export class Registry {
  key: string
  location: string
  token: string = ''

  constructor(location: string, key: string) {
    this.location = location
    this.key = key
  }
}

export class LocationRef {
  location: string
  token: string

  constructor(location: string, token: string) {
    this.location = location
    this.token = token
  }
}

function findTokensFromNpmrc(): Map<string, Registry> {
  const npmrcPath: string = path.join(os.homedir(), '.npmrc')

  if (!fs.existsSync(npmrcPath)) {
    console.error("No .npmrc under HOME!")
    return new Map<string, Registry>()
  }

  const lines: string[] = fs.readFileSync(npmrcPath, 'utf8')
    .split('\n')
    .map(line => line.trim())
  const registries = new Map<string, Registry>()
  const locations = new Map<string, LocationRef>()

  lines.forEach(line => {
    let registrySeek: string[][] = [...line.matchAll(/^@([^:]+):registry=https?:(.+)/g)]

    if (registrySeek.length > 0) {
      let key: string = registrySeek[0][1]
      let location: string = registrySeek[0][2]
      registries.set(location, new Registry(location, key))
      if (locations.has(location)) {
        (<Registry>registries.get(location)).token = (<LocationRef>locations.get(location)).token
      }
    } else {
      let tokenSeek: string[][] = [...line.matchAll(/^([^:]+):_authToken=([a-f0-9]+)/g)]

      if (tokenSeek.length > 0) {
        let location: string = tokenSeek[0][1]
        let token: string = tokenSeek[0][2]
        if (registries.has(location)) {
          (<Registry>registries.get(location)).token = token
        } else {
          locations.set(location, new LocationRef(location, token))
        }
      }
    } 
  })

  return registries
}

function generateExportScript(registries: Map<string, Registry>): void {
  registries.forEach((registry: Registry) => {
    if (registry.token && registry.token.length > 0) {
      const envarKey: string = str.toEnvarCase(registry.key)
      console.log(`export ${envarKey}_NPM_AUTH_TOKEN='${registry.token}'`)
    }
  })
}

export function findAndGenerate(): void {
  generateExportScript(findTokensFromNpmrc())
}
