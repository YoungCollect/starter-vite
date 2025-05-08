const moduleAlias = require('module-alias')

function generateAlias(cb) {
  import('../resolve-alias.js').then(resolveAlias => {
    moduleAlias.addAliases(resolveAlias.default.alias)
    cb && cb()
  })
}

module.exports = {
  generateAlias
}
