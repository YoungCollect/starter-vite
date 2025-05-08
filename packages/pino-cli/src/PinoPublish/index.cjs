const prompts = require('prompts')
const { pinoSharedCmd, pinoSharedTips } = require('@oneyoung/pino-shared')

const { checkTagExists, checkGitStatus } = require('~pino-cli/utils/git.cjs')
const { publish } = require('./publish.cjs')

class PinoPublish {
  async checkParams({
    tag = 'latest',
    monorepo = 'packages',
    getPkgDir = (monorepo, pkg) => `${monorepo}/${pkg}`,
    packageManager = 'pnpm'
  } = {}) {
    let tagName = tag
    if (!tagName) {
      tagName = (
        await prompts({
          type: 'text',
          name: 'tag',
          message: 'Enter the tag to publish'
        })
      ).tag
    } else if (tagName === 'latest') {
      // 根据提交记录，获取最新的 tag
      const { stdout } = await pinoSharedCmd.run('git', [
        'describe',
        '--tags',
        '--abbrev=0'
      ])
      tagName = stdout.trim()
      if (!tagName) {
        throw new Error('Tag not found, please specify a tag')
      }
    }
    this.tag = tagName
    this.pkgName = tagName.split('@')[0]
    this.monorepo = monorepo
    this.getPkgDir = getPkgDir
    this.packageManager = packageManager
    if (!this.pkgName)
      throw new Error('Tag must be in the format of pkgName@version')
  }

  async publish(options) {
    const gitStatus = await checkGitStatus()
    if (gitStatus) {
      pinoSharedTips.error(
        'Git status is not clean, please commit or stash your changes before publishing'
      )
      process.exit(1)
    }

    await this.checkParams(options)

    const { pkgName, tag, monorepo, getPkgDir, packageManager } = this
    if (await checkTagExists(tag)) {
      const { stdout: currentBranch } = await pinoSharedCmd.run('git', [
        'rev-parse',
        '--abbrev-ref',
        'HEAD'
      ])
      const currentBranchName = currentBranch.trim()

      pinoSharedTips.step(`Switching to tag ${tag}\n`)
      await pinoSharedCmd.runIfNotDry('git', ['checkout', tag])
      try {
        await publish({ pkgName, tag, monorepo, getPkgDir, packageManager })
      } catch (e) {
        console.log(e)
      } finally {
        pinoSharedTips.step(`Switching back to ${currentBranchName}\n`)
        await pinoSharedCmd.runIfNotDry('git', ['checkout', currentBranchName])
      }
    } else {
      pinoSharedTips.error(`Tag ${tag} does not exist`)
    }
  }
}

module.exports = { PinoPublish }
