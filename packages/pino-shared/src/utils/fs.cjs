const fs = require('fs').promises
const path = require('path')

async function ensureDir(filePath) {
  const dirname = path.dirname(filePath)
  try {
    await fs.access(dirname)
  } catch (error) {
    await fs.mkdir(dirname, { recursive: true })
  }
}

/**
 * 查找项目根目录（包含 package.json 的最近父级目录）
 * @param {string} startPath - 开始搜索的路径
 * @returns {Promise<string>} 项目根目录的路径
 */
async function findProjectRoot(startPath) {
  let currentPath = startPath

  // 如果是从 node_modules 中执行，需要往上找到项目根目录
  if (currentPath.includes('node_modules')) {
    currentPath = currentPath.split('node_modules')[0].replace(/[\\/]$/, '')
  }

  while (currentPath !== path.dirname(currentPath)) {
    try {
      await fs.access(path.join(currentPath, 'package.json'))
      return currentPath
    } catch (error) {
      currentPath = path.dirname(currentPath)
    }
  }
  throw new Error('Unable to find project root (no package.json found)')
}

/**
 * 处理目标路径，支持上级目录选择
 * @param {string} dest - 原始目标路径
 * @param {number} level - 上级目录层级，如 -1 表示上一级，-2 表示上两级
 * @returns {string} 处理后的目标路径
 */
function processDestPath(dest, level = 0) {
  if (level >= 0) return dest
  return path.join(dest, ...Array(Math.abs(level)).fill('..'))
}

/**
 * 递归复制目录及其内容
 * @param {string} src - 源目录路径
 * @param {string} dest - 目标目录路径
 */
async function copyDir(src, dest, { level = 0 } = {}) {
  const finalDest = processDestPath(dest, level)
  await fs.mkdir(finalDest, { recursive: true })
  const entries = await fs.readdir(src, { withFileTypes: true })

  const copyPathMap = {
    srcList: [],
    destList: []
  }

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name)
    const destPath = path.join(finalDest, entry.name)

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath)
    } else {
      await copyFile(srcPath, destPath)
    }
    copyPathMap.srcList.push(srcPath)
    copyPathMap.destList.push(destPath)
  }
  return copyPathMap
}

/**
 * 复制文件或目录
 * @param {string} src - 源路径
 * @param {string} dest - 目标路径
 */
async function copyFile(src, dest, { level = 0 } = {}) {
  try {
    const finalDest = processDestPath(dest, level)
    const stats = await fs.stat(src)

    if (stats.isDirectory()) {
      return await copyDir(src, finalDest)
    } else {
      const copyPathMap = {
        srcList: [],
        destList: []
      }
      await ensureDir(finalDest)
      await fs.copyFile(src, finalDest)
      await fs.chmod(finalDest, 0o644)

      copyPathMap.srcList.push(src)
      copyPathMap.destList.push(finalDest)
      return copyPathMap
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      if (error.path === src) {
        const finalDest = processDestPath(dest, level)
        await ensureDir(finalDest)
        await fs.writeFile(finalDest, '')
      }
    }
    throw error
  }
}

module.exports = {
  ensureDir,
  findProjectRoot,
  copyDir,
  copyFile
}
