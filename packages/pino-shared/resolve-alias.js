import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export default {
  alias: {
    '@pino-shared': resolve(__dirname, '../pino-shared'),
    '~pino-shared': resolve(__dirname, 'src')
  }
}
