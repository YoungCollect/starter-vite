import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default {
  '~foo': resolve(__dirname, '../../../packages/foo'),
  '@foo': resolve(__dirname, '../../../packages/foo/src')
}
