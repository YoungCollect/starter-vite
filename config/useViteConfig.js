import { mergeConfig } from 'vite'
import commonConfig from './awesome/common.config.js'

import singlepageConfig from './awesome/vite.singlepage.config.js'
import multipageConfig from './awesome/vite.multipage.config.js'
import libConfig from './awesome/vite.lib.config.js'

export default async function useViteConfig({
  configType = 'singlepage',
  pkgName = 'pino-cli',
  plugins = []
} = {}) {
  let config = {}
  switch (configType) {
    case 'singlepage':
			config = {
        ...singlepageConfig()
      }
      break
		case 'multipage':
			config = {
        ...await multipageConfig()
      }
			break
		case 'lib':
			config = {
				...libConfig({ pkgName, plugins })
			}
			break
    default:
      break
  }
  return mergeConfig(commonConfig(), config)
}
