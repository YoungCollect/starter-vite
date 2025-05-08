const fs = require('node:fs').promises
const { pinoSharedCmd } = require('@oneyoung/pino-shared')

exports.getLatestTag = async function (monorepo, pkgName) {
  const pkgJson = JSON.parse(
    await fs.readFile(`${monorepo}/${pkgName}/package.json`, 'utf-8')
  )
  const version = pkgJson.version
  return `${pkgName}@${version}`
}

exports.checkTagExists = async function (tag) {
  try {
    await pinoSharedCmd.run('git', ['rev-parse', tag], {
      stdio: 'pipe'
    })
    return true
  } catch (err) {
    return false
  }
}

exports.checkGitStatus = async function () {
  if (pinoSharedCmd.isDryRun) {
    return
  }
  const { stdout: gitStatus } = await pinoSharedCmd.run('git', [
    'status',
    '--porcelain'
  ])
  return gitStatus.trim()
}
