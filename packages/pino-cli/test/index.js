import pinoCli from '../dist/pino-cli.js'

const { PinoModule } = pinoCli

const pino = new PinoModule({
  moduleName: 'pinocli'
})

pino.postinstall({
  template: 'test/template/pinoclirc.mjs'
})
