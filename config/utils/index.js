import { resolve } from 'node:path'
import fs from 'node:fs'

// 动态读取 pages 目录下包含 index.html 的子目录
export const getContextPages = (pagesContext) => {
  const pagesPath = resolve(__dirname, pagesContext)
  const pages = []

  try {
    const entries = fs.readdirSync(pagesPath, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const indexPath = resolve(pagesPath, entry.name, 'index.html')
        if (fs.existsSync(indexPath)) {
          pages.push({
            page: entry.name,
            path: indexPath
          })
        }
      }
    }
  } catch (error) {
    console.error('读取 pages 目录失败:', error)
  }

  return pages
}
