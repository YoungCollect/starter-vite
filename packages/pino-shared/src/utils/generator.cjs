const path = require('node:path')
const { postinstall } = require('~pino-shared/helpers/postinstall.cjs')

function generateTemplate({
  moduleName,
  dirName,
  template,
  searchPlaces,
  ...restOptions
} = {}) {
  const finalTemplate = template || `template/${moduleName}rc.js`
  const finalDirName = dirName
  let promise = {}

  if (Array.isArray(finalTemplate)) {
    promise = Promise.all(
      finalTemplate.map(template => {
        const filename = path.basename(template)
        return postinstall({
          moduleName,
          dirName: finalDirName,
          filename,
          template,
          searchPlaces,
          ...restOptions
        })
      })
    )
  } else {
    const filename = path.basename(finalTemplate)
    promise = postinstall({
      moduleName,
      dirName: finalDirName,
      filename,
      template: finalTemplate,
      searchPlaces,
      ...restOptions
    })
  }
  return promise.then(async result => {
    return result
  })
}

module.exports = {
  generateTemplate
}
