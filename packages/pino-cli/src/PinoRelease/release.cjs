const prompts = require('prompts')
const semver = require('semver')
const { pinoSharedCmd, pinoSharedTips } = require('@oneyoung/pino-shared')
// const { publint } = require('publint')
// const { formatMessage } = require('publint/utils')

const {
  getPackageInfo,
  getVersionChoices,
  updatePkgVersion
} = require('~pino-cli/utils/release.cjs')

const { defaultPackages } = require('./helpers/packages.cjs')
const {
  defaultLogChangelog,
  defaultGenerateChangelog
} = require('./helpers/changelog.cjs')

const defaultGenerateTagName = (pkg, version) => `${pkg}@${version}`
const defaultGetPkgDir = (monorepo, pkg) => `${monorepo}/${pkg}`
const release = async function ({
  monorepo = 'packages',
  packages = [],
  logChangelog = defaultLogChangelog,
  generateChangelog = defaultGenerateChangelog,
  generateTagName = defaultGenerateTagName,
  getPkgDir = defaultGetPkgDir
} = {}) {
  let targetVersion
  const pkgList = packages.length
    ? packages
    : await defaultPackages({ monorepo })
  const selectedPkgName =
    pkgList.length === 1
      ? pkgList[0]
      : (
          await prompts({
            type: 'select',
            name: 'pkg',
            message: 'Select package',
            choices: pkgList.map(i => ({ value: i, title: i }))
          })
        ).pkg

  if (!selectedPkgName) return

  await logChangelog(monorepo, selectedPkgName)
  // pkgDir
  const { pkg, pkgPath } = getPackageInfo(monorepo, selectedPkgName, getPkgDir)

  // const { messages } = await publint({ pkgDir })

  // if (messages.length) {
  //   for (const message of messages) console.log(formatMessage(message, pkg))
  //   const { yes } = await prompts({
  //     type: 'confirm',
  //     name: 'yes',
  //     message: `${messages.length} messages from publint. Continue anyway?`
  //   })
  //   if (!yes) process.exit(1)
  // }

  if (!targetVersion) {
    const { release } = await prompts({
      type: 'select',
      name: 'release',
      message: 'Select release type',
      choices: getVersionChoices(pkg.version)
    })

    if (release === 'custom') {
      const res = await prompts({
        type: 'text',
        name: 'version',
        message: 'Input custom version',
        initial: pkg.version
      })
      targetVersion = res.version
    } else {
      targetVersion = release
    }
  }

  if (!semver.valid(targetVersion)) {
    throw new Error(`invalid target version: ${targetVersion}`)
  }

  const tag = generateTagName(selectedPkgName, targetVersion)

  const { yes } = await prompts({
    type: 'confirm',
    name: 'yes',
    message: `Releasing ${pinoSharedTips.pure(tag, {
      color: 'yellow'
    })} Confirm?`
  })

  if (!yes) return

  pinoSharedTips.step('\nUpdating package version...')
  updatePkgVersion(pkgPath, targetVersion)
  await generateChangelog(monorepo, selectedPkgName, targetVersion)

  const { stdout } = await pinoSharedCmd.run('git', ['diff'], { stdio: 'pipe' })

  async function commit() {
    pinoSharedTips.step('\nCommitting changes...')
    await pinoSharedCmd.runIfNotDry('git', ['add', '-A'])
    await pinoSharedCmd.runIfNotDry('git', ['commit', '-m', `release: ${tag}`])
    await pinoSharedCmd.runIfNotDry('git', ['tag', tag])
  }

  if (stdout) {
    await commit()
  } else {
    const { stdout: untrackedOutput } = await pinoSharedCmd.run(
      'git',
      ['ls-files', '--others', '--exclude-standard'],
      { stdio: 'pipe' }
    )
    if (untrackedOutput) {
      await commit()
    } else {
      console.log('No changes to commit.')
      return
    }
  }

  pinoSharedTips.step('\nPushing to remote...')
  await pinoSharedCmd.runIfNotDry('git', ['push', 'origin', `refs/tags/${tag}`])
  await pinoSharedCmd.runIfNotDry('git', ['push'])

  if (pinoSharedCmd.isDryRun) {
    pinoSharedTips.info(
      `\nDry run finished - run git diff to see package changes.`
    )
  } else {
    pinoSharedTips.success(
      `\nPushed, use \`pino publish --tag=${tag}\` to publish`
    )
  }
}

module.exports = {
  release
}
