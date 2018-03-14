const Promise = require("bluebird")
const request = require("request-promise")

const BASE = "https://registry.npmjs.org"

const cache = {}

const packageUrl = (modulePackage, version) => {
  return `${BASE}/${modulePackage}/${version}`
}

const resolveDeps = async (modulePackage, version, parents) => {

  if (parents && parents.includes(`${modulePackage}:${version}`)){
    return []
  }

  if (cache[modulePackage] && cache[modulePackage][version] && version!=="latest") {
    return cache[modulePackage][version]
  }

  let response
  let dependencies
  try{

     response = await request({
      uri: packageUrl(modulePackage, version),
      json: true
    })
     dependencies = response.dependencies || {}
  }
  catch(error){
    console.log(`Error fetching dependencies for ${modulePackage}:${version} - ${error.message}`)
    dependencies = {}
  }

  const deps = await Promise.map(
    Object.keys(dependencies),
    async dep => {
      const name = dep
      const depVersion = dependencies[dep]

      return { name, version: depVersion, dependencies: await resolveDeps(name, depVersion, [...parents, `${modulePackage}:${version}`]) }
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
  const deps = await resolveDeps(modulePackage, version, [])
  return { name: modulePackage, version: version, dependencies: deps }
}

module.exports = dependensee
