const {
  extendCommitlintDeps,
  openCommitlintOnCommit
} = require('./commitlint.cjs')
const {
  extendEslintDeps,
  extendEslintScripts,
  openLintOnCommit
} = require('./eslint.cjs')

exports.packager = (pkg, options = {}) => {
  pkg = extendCommitlintDeps(pkg, options)
  pkg = openCommitlintOnCommit(pkg, options)

  pkg = extendEslintDeps(pkg, options)
  pkg = extendEslintScripts(pkg, options)
  pkg = openLintOnCommit(pkg, options)
  return pkg
}
