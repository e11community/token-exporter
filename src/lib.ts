import os = require('os')
import fs = require('fs')
import path = require('path')
import str = require('./string.js')
import YAML = require('yaml')
import { Writable } from 'stream'

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

function findTokensFromYarnrc(yarnrcPath: string): Map<string, Registry> {
  if (!fs.existsSync(yarnrcPath)) {
    console.error(`No .yarnrc.yml at [${yarnrcPath}]!`)
    return new Map<string, Registry>()
  }

  const strYarnrc= fs.readFileSync(yarnrcPath, 'utf8')

  // serialize env
  let objYarnrc = null
  try {
    objYarnrc = YAML.parse(strYarnrc)
  }
  catch (error) {
    console.error(`Could not YAML parse [${yarnrcPath}]`)
    return new Map<string, Registry>()
  }

  const registries = new Map<string, Registry>()
  
  if (objYarnrc.npmScopes) {
    for (let key in objYarnrc.npmScopes) {
      let urlTemplate = objYarnrc.npmScopes[key].npmRegistryServer
      let authTokenTemplate = objYarnrc.npmScopes[key].npmAuthToken
    }
  }

  return registries
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
      let tokenSeek: string[][] = [...line.matchAll(/^([^:]+):_authToken=(.+)$/g)]

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

function writeNpmrc(registries: Map<string, Registry>, stream: Writable): void {
  registries.forEach((registry: Registry) => {
    if (registry.token && registry.token.length > 0) {
      stream.write(`@${registry.key}:registry=https:${registry.location}\n`)
      stream.write(`${registry.location}:_authToken=${registry.token}\n\n`)
    }
  })
}

export function writeLocalNpmrc(): void {
  writeNpmrc(findTokensFromNpmrc(), fs.createWriteStream('./.npmrc'))
}

export function findAndGenerate(): void {
  generateExportScript(findTokensFromNpmrc())
}
