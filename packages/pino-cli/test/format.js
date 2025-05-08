import pinoCli from '../dist/pino-cli.js'

const { PinoFormat } = pinoCli

const pinoFormat = new PinoFormat()

pinoFormat.setup()

// pino.postinstall({
//   template: 'test/template/pinoclirc.mjs'
// })
