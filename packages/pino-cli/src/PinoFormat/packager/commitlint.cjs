const deepmerge = require('deepmerge')

function getCommitlintExtendDeps() {
  return {
    devDependencies: {
      '@commitlint/cli': '^19.3.0',
      '@commitlint/config-conventional': '^19.2.2'
      // 'commitlint-config-gitmoji': '^2.3.1'
    }
  }
}

function getCommitlintTriggerDeps() {
  return {
    gitHooks: {
      // 默认关闭commit msg的emoji转换
      // 'prepare-commit-msg': 'pino format commit-msg --no-format',
      'commit-msg': 'commitlint --edit'
    }
  }
}

function extendCommitlintDeps(pkg) {
  return deepmerge(pkg, getCommitlintExtendDeps())
}

function openCommitlintOnCommit(pkg) {
  return deepmerge(pkg, getCommitlintTriggerDeps())
}

module.exports = {
  extendCommitlintDeps,
  openCommitlintOnCommit
}
