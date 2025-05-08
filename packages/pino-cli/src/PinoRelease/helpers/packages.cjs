const fs = require('node:fs')
const fsPromises = fs.promises
const path = require('node:path')
const { pinoSharedTips } = require('@oneyoung/pino-shared')

exports.defaultPackages = async function ({ monorepo } = {}) {
  const packages = []
  const rootDir = process.cwd()

  // 检查 目录下的包
  try {
    const packagesDir = path.join(rootDir, monorepo)
    const dirs = await fsPromises.readdir(packagesDir)
    for (const dir of dirs) {
      try {
        const pkgPath = path.join(packagesDir, dir, 'package.json')
        if (fs.existsSync(pkgPath)) {
          const pkg = require(pkgPath)
          if (pkg.name) {
            packages.push(dir)
          }
        }
      } catch (err) {
        // 跳过无效的包目录
        pinoSharedTips.error(err)
        continue
      }
    }
  } catch (err) {
    // 目录不存在或读取失败
    console.error(err)
    process.exit(1)
  }

  // 检查根目录的 package.json
  // try {
  //   const rootPkg = require(path.join(rootDir, 'package.json'))
  //   if (rootPkg.name) {
  //     packages.push(rootPkg.name)
  //   }
  // } catch (err) {
  //   // 根目录没有 package.json 或读取失败，继续处理
  // }
  const result = packages.length ? packages : []
  if (!result.length) {
    pinoSharedTips.error('No packages found')
    process.exit(1)
  }
  return result
}
