import MagicString from 'magic-string'
/*
  ESM规范下 不存在__dirname __filename等属性
  因此如果是要将cjs转化成esm 需要手动添加这些属性
*/
export default function nodeShimsForEsmPlugin() {
  return {
    name: 'node-shims-for-esm',
    renderChunk(code, chunk) {
      // 只处理esm的js文件 忽略commonjs的cjs文件
      if (!chunk.fileName.endsWith('.js')) {
        return
      }
      const s = new MagicString(code)
      s.prepend(`
import __path from 'node:path'
import { fileURLToPath as __fileURLToPath } from 'node:url'
import { createRequire as __createRequire } from 'node:module'

const __getFilename = () => __fileURLToPath(import.meta.url)
const __getDirname = () => __path.dirname(__getFilename())
const __dirname = __getDirname()
const __filename = __getFilename()
const self = globalThis
const require = __createRequire(import.meta.url)
`)
      return {
        code: s.toString(),
        map: s.generateMap()
      }
    },
    apply: 'build'
  }
}
