const { PinoModule } = require('../dist/pino-cli.cjs')

const pino = new (PinoModule || PinoModule.default)({
  moduleName: 'pinocli'
})

pino.postinstall({
  template: 'packages/pino-cli/test/template/pinoclirc.mjs'
})
