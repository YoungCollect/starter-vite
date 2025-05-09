const moduleAlias = require('module-alias')

exports.generateAlias = function generateAlias(cb) {
  import('../scripts/resolve-alias.js').then(resolveAlias => {
    moduleAlias.addAliases(resolveAlias.default)
    cb && cb()
  })
}
