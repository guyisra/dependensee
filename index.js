const Promise = require("bluebird")
const request = require("request-promise")

const BASE = "https://registry.npmjs.org"

const packageUrl = (package, version) => {
  return `${BASE}/${package}/${version}`
}

const resolveDeps = async (package, version) => {
  const response = await request({
    uri: packageUrl(package, version),
    json: true
  })
  const dependencies = response.dependencies || {}

  const deps = await Promise.map(
    Object.keys(dependencies),
    async dep => {
      const o = {}
      o[dep] = {}
      o[dep].version = dependencies[dep]
      o[dep].dependencies = await resolveDeps(dep, dependencies[dep])
      return o
    },
    { concurrency: 5 }
  )

  return Object.assign({}, ...deps)
}

const dependensee = async (package, version) => {
  const tree = {}
  const deps = await resolveDeps(package, version)
  tree[package] = {
    version: version,
    dependencies: deps
  }
  return tree
}

module.exports = dependensee
