const Promise = require("bluebird")
const request = require("request-promise")

const BASE = "https://registry.npmjs.org"

const cache = {}

const packageUrl = (modulePackage, version) => {
  return `${BASE}/${modulePackage}/${version}`
}

const resolveDeps = async (modulePackage, version) => {
  if (cache[modulePackage] && cache[modulePackage][version] && version!=="latest") {
    return cache[modulePackage][version]
  }

  const response = await request({
    uri: packageUrl(modulePackage, version),
    json: true
  })
  const dependencies = response.dependencies || []

  const deps = await Promise.map(
    Object.keys(dependencies),
    async dep => {
      const name = dep
      const version = dependencies[dep]

      return { name, version, dependencies: await resolveDeps(name, version) }
    },
    { concurrency: 5 }
  )
  if (!cache[modulePackage]) {
    cache[modulePackage] = {}
  }
  cache[modulePackage][version] = deps
  return deps
}

const dependensee = async (modulePackage, version) => {
  const tree = {}
  const deps = await resolveDeps(modulePackage, version)
  return { name: modulePackage, version: version, dependencies: deps }
}

module.exports = dependensee
