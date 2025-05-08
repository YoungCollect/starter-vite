const fs = require('fs')
const { pinoSharedTips } = require('@oneyoung/pino-shared')
const {
  COMMIT_TYPES,
  getCommitType
} = require('~pino-cli/constants/commit.cjs')

module.exports = function formatCommitMsg(options) {
  const { format = true } = options
  if (!format) {
    return
  }
  /*
		GIT_PARAMS = 'commitMsgFile commitMsgPrefix'
	*/
  pinoSharedTips.info(`GIT_PARAMS => ${process.env.GIT_PARAMS}`, {
    prefix: true
  })
  if (process.env.GIT_PARAMS) {
    const params = process.env.GIT_PARAMS.split(' ')
    const [commitMsgFile, commitMsgPrefix] = params
    if (!commitMsgFile) {
      pinoSharedTips.error('No commit message file provided.', { prefix: true })
      process.exit(1)
    }
    if (commitMsgPrefix !== 'message') {
      pinoSharedTips.error('No commit message provided.', { prefix: true })
      process.exit(1)
    }

    const commitMsg = fs.readFileSync(commitMsgFile, 'utf8').trim()
    pinoSharedTips.info(`commitMsg--> ${commitMsg}`, { prefix: true })

    const commitTypeContantsKeyList = Object.keys(COMMIT_TYPES)
    const commitType = commitTypeContantsKeyList.find(key =>
      commitMsg.startsWith(`${key}:`)
    )
    if (commitType) {
      const newCommitMsg = commitMsg.replace(
        commitType,
        getCommitType(commitType)
      )
      fs.writeFileSync(commitMsgFile, newCommitMsg)
      pinoSharedTips.success('Commit message formatted successfully.', {
        prefix: true
      })
    }
  }
}
