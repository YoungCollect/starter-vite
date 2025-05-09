#!/usr/bin/env node
const { generateAlias } = require('./module-alias.cjs')

generateAlias(() => {
  const { Command } = require('commander')
  const pkg = require('../package.json')

  const program = new Command()
  program.name(pkg.name).description(pkg.description).version(pkg.version)

  program.parse()

  const { moduleName } = require('@foo/a.cjs')
  console.log(moduleName)
})
