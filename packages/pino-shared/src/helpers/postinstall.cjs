#!/usr/bin/env node
const fs = require('node:fs')
const fsPromises = fs.promises
const path = require('node:path')
const tips = require('~pino-shared/utils/tips.cjs')
const { findProjectRoot, copyFile } = require('~pino-shared/utils/fs.cjs')

const { loadConfig } = require('~pino-shared/utils/cosmiconfig.cjs')

let projectRoot

/**
 * 检查并创建目录
 * @param {string} dirPath - 要创建的目录路径
 */
async function ensureDir(dirPath, searchPlaces, force = false) {
  if (!force) {
    const result = await loadConfig({
      searchPlaces
    })
    // 不存在配置文件时 或者文件内容为空时 结果为null
    if (!result) {
      await fsPromises.mkdir(dirPath, { recursive: true })
    } else {
      const { filepath } = result
      const relativePath = path.relative(projectRoot, filepath)
      tips.warn(`Found existing config file (${relativePath}).`)
      tips.success('Skipping setup!')
      process.exit(0)
    }
  } else {
    await fsPromises.mkdir(dirPath, { recursive: true })
  }
}

/**
 * 安装模块
 * @param {string} moduleName - 模块名称
 * @param {string} dirName - 目录名称
 * @param {string} filename - 文件名称
 * @param {string} template - 模板路径
 * @param {Array} searchPlaces - 搜索路径
 */
async function postinstall({
  moduleName = '',
  dirName = '',
  filename = '',
  template = '',
  searchPlaces = [],
  level = 0,
  force = false
} = {}) {
  // 跳过特定环境
  if (process.env.NODE_ENV === 'production') {
    return
  }

  try {
    tips.success(`Starting setup [${moduleName}]...`)

    // 1. 找到项目根目录
    const cwd = process.cwd()
    projectRoot = await findProjectRoot(cwd)

    // 2. 定义路径
    const configDir = path.join(projectRoot, dirName)
    const targetPath = path.join(configDir, filename)
    // const templatePath = path.join(projectRoot, template)
    // const templatePath = path.join(cwd, template)
    const templatePath = template

    // 3. 创建目录
    await ensureDir(configDir, searchPlaces, force)
    tips.info(`Template path: ${templatePath}`)
    tips.info(`Target path: ${targetPath}`)

    // 4. 复制文件
    const copyPathMap = await copyFile(templatePath, targetPath, { level })

    tips.success(`Setup [${moduleName}] completed successfully.`)
    const isDirectory = fs.statSync(templatePath).isDirectory()
    if (isDirectory) {
      return {
        root: projectRoot,
        moduleName,
        dirName,
        filename,
        target: `${dirName}/${filename}`,
        targetPath,
        template,
        templatePath,
        copyPathMap,
        isDirectory
      }
    }
    return {
      root: projectRoot,
      moduleName,
      dirName,
      filename,
      target: `${dirName}/${filename}`,
      targetPath,
      template,
      templatePath,
      searchPlaces,
      copyPathMap,
      isDirectory
    }
  } catch (err) {
    tips.error(`Setup failed: ${err.message}!`)
    process.exit(1)
  }
}

module.exports = {
  postinstall
}
