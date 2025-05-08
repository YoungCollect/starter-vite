#!/usr/bin/env node
const { generateAlias } = require('./module-alias.cjs')

generateAlias(() => {
  const { Command } = require('commander')
  const pkg = require('../package.json')
  const { registerFormat } = require('./registerFormat.cjs')
  const { registerModule } = require('./registerModule.cjs')
  const { registerRelease } = require('./registerRelease.cjs')
  const { registerPublish } = require('./registerPublish.cjs')

  const program = new Command()
  program.name(pkg.name).description(pkg.description).version(pkg.version)

  registerFormat(program)
  registerModule(program)
  registerRelease(program)
  registerPublish(program)

  program.parse()
})
