import fs from 'node:fs'
import { resolve } from 'node:path'

export function resolveEntries({
  contextPath = '',
  dirPath = '',
  prefix = ''
} = {}) {
  const targetPath = resolve(contextPath, dirPath)
  if (!fs.existsSync(targetPath)) {
    return {}
  }
  return fs
    .readdirSync(targetPath)
    .map(file => {
      const entryName = file.split('.')[0]
      return {
        [prefix ? `${prefix}/${entryName}` : entryName]: resolve(
          contextPath,
          `${dirPath}/${file}`
        )
      }
    })
    .reduce((pre, cur) => {
      return {
        ...pre,
        ...cur
      }
    }, {})
}
