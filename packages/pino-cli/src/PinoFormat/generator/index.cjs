const path = require('node:path')
const { PinoModule } = require('~pino-cli/PinoModule/index.cjs')
const { __DEV__ } = require('~pino-cli/utils/env.cjs')

// 生产环境下采用dist目录的相对路径
const baseTemplate = __DEV__
  ? path.resolve(__dirname, 'template-base')
  : path.resolve(__dirname, '../src/PinoFormat/generator/template-base')
const cjsTemplate = __DEV__
  ? path.resolve(__dirname, 'template-cjs')
  : path.resolve(__dirname, '../src/PinoFormat/generator/template-cjs')
// const esTemplate = path.resolve(__dirname, 'template-es')

exports.generator = async (pkg, options) => {
  const pinoModule = new PinoModule({
    moduleName: 'PinoFormat'
  })
  // const templateList = pkg.type === 'module' ? [baseTemplate, esTemplate] : [baseTemplate, cjsTemplate]
  const templateList = [baseTemplate, cjsTemplate]
  return await pinoModule.postinstall({
    template: templateList,
    // 相对于ProjectRoot
    dirName: '.',
    force: true,
    level: -1
  })
}
