const fs = require('node:fs/promises')
const path = require('node:path')
const {
  pinoSharedCosmiconfig,
  pinoSharedFs,
  pinoSharedGenerator,
  pinoSharedTips
} = require('@oneyoung/pino-shared')

class PinoModule {
  moduleName = '' // required
  dirName = ''
  searchPlaces = []
  constructor(options = {}) {
    this.required(options)
    const { moduleName, dirName = '.pino', searchPlaces = [] } = options
    this.moduleName = moduleName
    this.dirName = dirName
    this.searchPlaces = searchPlaces.length
      ? searchPlaces
      : pinoSharedCosmiconfig.resolveSearchPlaces({
          moduleName,
          dirName
        })
  }
  required(options) {
    const { moduleName } = options
    if (!moduleName) {
      pinoSharedTips.error('Options [moduleName] is required')
      process.exit(1)
    }
  }
  async loadConfig(options) {
    const { moduleName, searchPlaces } = this
    return await pinoSharedCosmiconfig.loadConfig({
      moduleName,
      searchPlaces,
      ...options
    })
  }
  resolveConfig(options) {
    return pinoSharedCosmiconfig.resolveConfig(options)
  }
  // 自定义template以安装
  postinstall(options) {
    const { moduleName, dirName, searchPlaces } = this

    return pinoSharedGenerator
      .generateTemplate({
        moduleName,
        dirName,
        searchPlaces,
        ...options
      })
      .then(async result => {
        return await PinoModule.saveModuleMap(moduleName, result)
      })
  }
  static moduleMapPath = path.resolve(
    __dirname,
    '../../.cache/pino-modules.json'
  )
  static async revert(moduleName = '$all') {
    const moduleMap = await this.readModuleMap()
    if (Object.keys(moduleMap).length === 0) {
      pinoSharedTips.warn('No modules found.')
      return
    }
    const promises = Object.values(moduleMap)
      .filter(
        moduleItem =>
          moduleName === '$all' || moduleItem.moduleName === moduleName
      )
      .map(async moduleItem => {
        const { moduleInfo } = moduleItem
        if (Array.isArray(moduleInfo)) {
          return await Promise.all(
            moduleInfo.map(item => pinoSharedGenerator.generateTemplate(item))
          )
        } else {
          // object
          return await pinoSharedGenerator.generateTemplate(
            moduleItem.moduleInfo
          )
        }
      })
    try {
      await Promise.all(promises)
      pinoSharedTips.success('Revert modules success.')
    } catch (error) {
      pinoSharedTips.error(error.message)
      process.exit(1)
    }
  }
  static async remove(moduleName) {
    const moduleMap = await this.readModuleMap()
    if (moduleMap[moduleName]) {
      delete moduleMap[moduleName]
      await fs.writeFile(
        PinoModule.moduleMapPath,
        JSON.stringify(moduleMap, null, 2),
        'utf8'
      )
      pinoSharedTips.success(`Remove module ${moduleName} success.`)
    } else {
      pinoSharedTips.warn(`Module ${moduleName} not found.`)
    }
  }
  static async readModuleMap() {
    const moduleMapPath = PinoModule.moduleMapPath
    try {
      await pinoSharedFs.ensureDir(moduleMapPath)
      const data = await fs.readFile(moduleMapPath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      // 如果文件不存在，返回空对象
      await fs.writeFile(moduleMapPath, '{}', 'utf8')
      return {}
    }
  }
  static async saveModuleMap(moduleName, moduleInfo = {}) {
    let moduleMap = {}
    try {
      moduleMap = await PinoModule.readModuleMap()
    } catch (error) {
      // 如果文件不存在，使用空对象
    }

    moduleMap[moduleName] = {
      timestamp: new Date().toLocaleString(),
      moduleName,
      moduleInfo
    }
    await fs.writeFile(
      PinoModule.moduleMapPath,
      JSON.stringify(moduleMap, null, 2),
      'utf8'
    )
    return moduleMap
  }
}

module.exports = {
  PinoModule
}
