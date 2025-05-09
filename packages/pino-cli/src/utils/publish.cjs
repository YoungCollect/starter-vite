const { pinoSharedCmd } = require('@oneyoung/pino-shared')

function sliceExternalPublishArgv() {
  // pino publish --otp=<code>
  const whiteList = ['otp']
  const reg = /^--(?<key>[^=]+)=(?<value>.+)$/
  const argv = process.argv.slice(2).reduce((acc, cur) => {
    const match = cur.match(reg)
    if (match?.groups && whiteList.includes(match.groups.key)) {
      const { key, value } = match.groups
      acc.push({
        origin: cur,
        originArr: cur.split('='),
        key,
        value
      })
    }
    return acc
  }, [])
  return argv
}
sliceExternalPublishArgv()

async function publishPackage({ pkgDir, releaseTag, packageManager = 'npm' }) {
  const publicArgs = ['publish', '--access', 'public']
  const sliceExternalPublishArgvs = sliceExternalPublishArgv()
  sliceExternalPublishArgvs.forEach(item => {
    publicArgs.push(...item.originArr)
  })
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
