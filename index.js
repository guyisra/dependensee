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

const dependensee = async (modulePackage, version) => {
  const tree = {}
  const deps = await resolveDeps(modulePackage, version)
  tree[modulePackage] = { version: version, dependencies: deps }
  return tree
}

module.exports = dependensee
