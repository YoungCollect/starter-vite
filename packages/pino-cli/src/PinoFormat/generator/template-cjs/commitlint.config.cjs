const { extendCommitlintConfig } = require('@oneyoung/pino-cli/constants/commit')

const { lintExtends, lintRules } = extendCommitlintConfig()

module.exports = {
  extends: [...lintExtends],
  rules: {
    ...lintRules
  }
}
