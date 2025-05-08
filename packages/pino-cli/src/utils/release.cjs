const path = require('node:path')
const { readFileSync, writeFileSync } = require('node:fs')
const semver = require('semver')
const { pinoSharedCmd } = require('@oneyoung/pino-shared')

function getPackageInfo(
  monorepo,
  pkgName,
  getPkgDir = (monorepo, pkg) => `${monorepo}/${pkg}`
) {
  const pkgDir = path.resolve(getPkgDir(monorepo, pkgName))
  const pkgPath = path.resolve(pkgDir, 'package.json')
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))

  if (pkg.private) {
    throw new Error(`Package ${pkgName} is private`)
  }

  return { pkg, pkgDir, pkgPath }
}

function getVersionChoices(currentVersion) {
  const currentBeta = currentVersion.includes('beta')
  const currentAlpha = currentVersion.includes('alpha')
  const isStable = !currentBeta && !currentAlpha

  function inc(i, tag = currentAlpha ? 'alpha' : 'beta') {
    return semver.inc(currentVersion, i, tag)
  }

  let versionChoices = [
    {
      title: 'next',
      value: inc(isStable ? 'patch' : 'prerelease')
    }
  ]

  if (isStable) {
    versionChoices.push(
      {
        title: 'beta-minor',
        value: inc('preminor')
      },
      {
        title: 'beta-major',
        value: inc('premajor')
      },
      {
        title: 'alpha-minor',
        value: inc('preminor', 'alpha')
      },
      {
        title: 'alpha-major',
        value: inc('premajor', 'alpha')
      },
      {
        title: 'minor',
        value: inc('minor')
      },
      {
        title: 'major',
        value: inc('major')
      }
    )
  } else if (currentAlpha) {
    versionChoices.push({
      title: 'beta',
      value: inc('patch') + '-beta.0'
    })
  } else {
    versionChoices.push({
      title: 'stable',
      value: inc('patch')
    })
  }
  versionChoices.push({ value: 'custom', title: 'custom' })

  versionChoices = versionChoices.map(i => {
    i.title = `${i.title} (${i.value})`
    return i
  })

  return versionChoices
}

function updatePkgVersion(pkgPath, version) {
  const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8'))
  pkg.version = version
  writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n')
}

async function getActiveVersion(npmName) {
  try {
    return (
      await pinoSharedCmd.run('npm', ['info', npmName, 'version'], {
        stdio: 'pipe'
      })
    ).stdout
  } catch (e) {
    // Not published yet
    if (e.stderr.startsWith('npm ERR! code E404')) return
    throw e
  }
}

module.exports = {
  getPackageInfo,
  getVersionChoices,
  updatePkgVersion,
  getActiveVersion
}
