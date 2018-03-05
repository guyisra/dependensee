const Promise = require("bluebird")
const request = require("request-promise")

const BASE = "https://registry.npmjs.org"

const packageUrl = (modulePackage, version) => {
  return `${BASE}/${modulePackage}/${version}`
}

const resolveDeps = async (modulePackage, version) => {
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
      const o = { name, version}
      o.dependencies = await resolveDeps(name, version)
      return o
    },
    { concurrency: 5 }
  )

  return deps
}

const dependensee = async (modulePackage, version) => {
  const tree = {}
  const deps = await resolveDeps(modulePackage, version)
  return { name: modulePackage, version: version, dependencies: deps }
}

module.exports = dependensee
