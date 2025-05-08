const { pinoSharedTips } = require('@oneyoung/pino-shared')

const { checkGitStatus } = require('~pino-cli/utils/git.cjs')
const { release } = require('./release.cjs')

class PinoRelease {
  constructor({ cwd = process.cwd() } = {}) {
    this.cwd = cwd
  }
  async release(options) {
    /*
		1. Make changes
		2. Commit those changes
		3. Make sure Travis turns green
		4. Bump version in package.json
		5. conventionalChangelog
		6. Commit package.json and CHANGELOG.md files
		7. Tag
		8. Push
    */
    const gitStatus = await checkGitStatus()
    if (gitStatus) {
      pinoSharedTips.error(
        'Git status is not clean, please commit or stash your changes before releasing'
      )
      process.exit(1)
    }
    await release(options)
  }
}

module.exports = {
  PinoRelease
}
