import path from 'node:path'
import fs from 'node:fs'
import chalk from 'chalk'

const log = (str) => console.log(str)

// 动态读取 pages 目录下包含 index.html 的子目录
export const getContextPages = (pagesContext) => {
  const pagesPath = path.resolve(__dirname, pagesContext)
  const pages = []

  try {
    const entries = fs.readdirSync(pagesPath, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        const indexPath = path.resolve(pagesPath, entry.name, 'index.html')
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

export const getEntryPage = async (pagesContext, pageName) => {
	const pages = getContextPages(pagesContext)
  if (!pageName) {
    log(
      chalk.red('Command line might be wrong. Usage: pnpm dev -- --page=pageName')
    )
    process.exit(1)
  } else {
    log(chalk.yellow(`Building page: ${pageName}`))
  }
  const filterArr = pages.filter(
    (item) => item.page.toLowerCase() === pageName.toLowerCase()
  )
  if (!filterArr.length) {
    log(chalk.red(`Page '${pageName}' not found. Available pages: ${pages.map(p => p.page).join(', ')}`))
		process.exit(1)
  }

	let subViteConfig = {}
	if (fs.existsSync(path.resolve(__dirname, `${pagesContext}/${pageName}/vite.config.js`))) {
		subViteConfig = (await import(path.resolve(__dirname, `${pagesContext}/${pageName}/vite.config.js`))).default
	}
  return {
		input: {
			[pageName]: path.resolve(__dirname, `${pagesContext}/${pageName}/index.html`)
		},
		subViteConfig
	}
}
