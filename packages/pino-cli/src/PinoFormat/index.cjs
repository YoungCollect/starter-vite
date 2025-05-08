const path = require('node:path')
const fs = require('node:fs/promises')
const ora = require('ora')
const {
  pinoSharedCmd,
  pinoSharedFs,
  pinoSharedTips
} = require('@oneyoung/pino-shared')

const { generator } = require('./generator/index.cjs')
const { packager } = require('./packager/index.cjs')

class PinoFormat {
  options = {}
  constructor({ cwd = process.cwd() } = {}) {
    this.cwd = cwd
  }
  async setup({ ts = false } = {}) {
    try {
      const { options } = this
      this.projectRoot = await pinoSharedFs.findProjectRoot(this.cwd)
      this.pkgPath = path.join(this.projectRoot, 'package.json')
      this.originalPkg = require(this.pkgPath)
      const pkg = (this.targetPkg = JSON.parse(
        JSON.stringify(this.originalPkg)
      ))
      await Promise.all([
        this.generator(pkg, options),
        this.packager(pkg, options)
      ])

      const packageManager = await this.detectPackageManager()
      const spinner = ora(
        `Installing CLI plugins by ${packageManager}. This might take a while...`
      ).start()
      await pinoSharedCmd.run(packageManager, ['install'], {
        cwd: this.projectRoot
      })
      spinner.succeed(`CLI plugins installed successfully.`)

      const yorkieSpinner = ora('Installing yorkie-pnpm...').start()
      await pinoSharedCmd.run(
        'node',
        ['node_modules/yorkie-pnpm/bin/install.js'],
        {
          cwd: this.projectRoot
        }
      )
      yorkieSpinner.succeed(`Yorkie installed successfully.`)
    } catch (error) {
      pinoSharedTips.error(error)
      process.exit(1)
    }
  }
  async generator(pkg, options) {
    return await generator(pkg, options)
  }
  async packager(pkg, options) {
    pkg = packager(pkg, options)
    return await fs.writeFile(this.pkgPath, JSON.stringify(pkg, null, 2) + '\n')
  }
  async detectPackageManager() {
    try {
      const lockFiles = await fs.readdir(this.projectRoot)
      if (lockFiles.includes('yarn.lock')) return 'yarn'
      if (lockFiles.includes('pnpm-lock.yaml')) return 'pnpm'
      if (lockFiles.includes('package-lock.json')) return 'npm'
      return 'npm'
    } catch (error) {
      return 'npm'
    }
  }

  formatCommitMsg(options) {
    return require('./format/commit-msg.cjs')(options)
  }
}

module.exports = {
  PinoFormat
}
