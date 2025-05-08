const { pinoSharedCmd } = require('@oneyoung/pino-shared')

async function publishPackage({ pkgDir, releaseTag, packageManager = 'npm' }) {
  const publicArgs = ['publish', '--access', 'public']
  if (releaseTag) {
    publicArgs.push(`--tag`, releaseTag)
  }
  if (packageManager === 'pnpm') {
    publicArgs.push(`--no-git-checks`)
  }
  await pinoSharedCmd.runIfNotDry(packageManager, publicArgs, {
    cwd: pkgDir
  })
}

function parsePackageName(pkgName) {
  const result = {
    scope: false,
    user: '',
    pkg: pkgName
  }
  const scopedPackagePattern = new RegExp('^(?:@([^/]+?)[/])?([^/]+?)$')
  const nameMatch = pkgName.match(scopedPackagePattern)
  if (nameMatch) {
    result.scope = true
    result.user = nameMatch[1]
    result.pkg = nameMatch[2]
  }
  return result
}

async function getPublishRegistry(pkgName) {
  try {
    const { scope, user } = parsePackageName(pkgName)
    const { stdout } = await pinoSharedCmd.run(
      'npm',
      ['config', 'get', scope ? `@${user}:registry` : 'registry'],
      {
        stdio: 'pipe'
      }
    )
    return stdout.trim()
  } catch (e) {
    return ''
  }
}

module.exports = {
  publishPackage,
  parsePackageName,
  getPublishRegistry
}
