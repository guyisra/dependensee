#! /usr/bin/env node --harmony
const treestringify = require("tree-stringify")

const dependensee = require("../index.js")

const package = process.argv[2]
const version = process.argv[3]

dependensee(package, version).then(x => console.log(treestringify(x)))
