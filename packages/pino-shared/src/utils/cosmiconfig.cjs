const { cosmiconfig } = require('cosmiconfig')
const { isPlainObject, isFunction } = require('~pino-shared/utils/types.cjs')
const tips = require('~pino-shared/utils/tips.cjs')

const error = function (tip) {
  if (!error.silent) {
    tips.error(tip)
    process.exit(1)
  }
}

async function loadConfig({ moduleName = '', searchPlaces = [] } = {}) {
  const explorer = cosmiconfig(moduleName, {
    searchStrategy: 'project',
    searchPlaces
  })
  const searchedFor = await explorer.search()
  return searchedFor
}

function resolveConfig({
  searchedFor = null,
  runtimeInfo = {},
  silent = false
} = {}) {
  error.silent = silent
  let result = null
  if (searchedFor) {
    const { config } = searchedFor
    if (isFunction(config)) {
      result = config.call(runtimeInfo, runtimeInfo)
    } else if (isPlainObject(config) || Array.isArray(config)) {
      result = config
    } else {
      error(`The config file need to export function or object!`)
    }
  }
  return result
}

function resolveSearchPlaces({ dirName = '', moduleName = '' } = {}) {
  return [
    'package.json',
    `.${moduleName}rc`,
    `.${moduleName}rc.json`,
    `.${moduleName}rc.js`,
    `.${moduleName}rc.cjs`,
    `.${moduleName}rc.mjs`,
    `.${moduleName}rc.ts`,
    `${dirName}/${moduleName}rc`,
    `${dirName}/${moduleName}rc.json`,
    `${dirName}/${moduleName}rc.js`,
    `${dirName}/${moduleName}rc.cjs`,
    `${dirName}/${moduleName}rc.mjs`,
    `${dirName}/${moduleName}rc.ts`,
    `${moduleName}.config.js`,
    `${moduleName}.config.cjs`,
    `${moduleName}.config.mjs`,
    `${moduleName}.config.ts`,
    `${dirName}/${moduleName}.config.js`,
    `${dirName}/${moduleName}.config.cjs`,
    `${dirName}/${moduleName}.config.mjs`,
    `${dirName}/${moduleName}.config.ts`
  ]
}

module.exports = {
  loadConfig,
  resolveConfig,
  resolveSearchPlaces
}
