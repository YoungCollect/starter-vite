const path = require('node:path')
const { pinoSharedCmd, pinoSharedTips } = require('@oneyoung/pino-shared')

const { getLatestTag, checkTagExists } = require('~pino-cli/utils/git.cjs')

exports.logRecentCommits = async function (monorepo, pkgName) {
  const tag = await getLatestTag(monorepo, pkgName)
  let sha = ''
  if (!(await checkTagExists(tag))) {
    // 第一次commit的SHA
    sha = await pinoSharedCmd
      .run('git', ['rev-list', '--max-parents=0', 'HEAD'], {
        stdio: 'pipe'
      })
      .then(res => res.stdout.trim())
  } else {
    sha = await pinoSharedCmd
      .run('git', ['rev-list', '-n', '1', tag], {
        stdio: 'pipe'
      })
      .then(res => res.stdout.trim())
  }

  pinoSharedTips.pure(
    `\n${pinoSharedTips.pure(`i`, {
      color: 'blue',
      log: false
    })} Commits of ${pinoSharedTips.pure(pkgName, {
      color: 'green',
      log: false
    })} since ${pinoSharedTips.pure(tag, {
      color: 'green',
      log: false
    })} ${pinoSharedTips.pure(`(${sha.slice(0, 5)})`, {
      color: 'gray',
      log: false
    })}`
  )
  await pinoSharedCmd.run(
    'git',
    [
      '--no-pager',
      'log',
      `${sha}..HEAD`,
      '--oneline',
      '--',
      `${monorepo}/${pkgName}`
    ],
    { stdio: 'inherit' }
  )
  console.log()
}

exports.defaultLogChangelog = async function (monorepo, pkgName) {
  return exports.logRecentCommits(monorepo, pkgName)
}

exports.defaultGenerateChangelog = async function (monorepo, pkgName, version) {
  pinoSharedTips.step('\nGenerating changelog...')

  // https://github.com/zqinmiao/blog/issues/12
  // const changelogArgs = [
  //   'conventional-changelog',
  //   '-p',
  //   'conventional-changelog-angular@8.0.0',
  //   '-n',
  //   'changelog.config.cjs',
  //   '-i',
  //   'CHANGELOG.md',
  //   '-s',
  //   '--commit-path',
  //   '.'
  // ]
  // Add changelog.config.cjs config file
  // const contextPath = `packages/${pkgName}`
  // const configPath = path.join(
  //   process.cwd(),
  //   contextPath,
  //   'changelog.config.cjs'
  // )
  // const exists = await fsPromises
  //   .access(configPath)
  //   .then(() => true)
  //   .catch(() => false)
  // if (!exists) {
  //   await fsPromises.copyFile(
  //     path.resolve(__dirname, '../template', 'changelog.config.cjs'),
  //     configPath
  //   )
  // }

  // if (pkgName !== 'pino-cli') changelogArgs.push('--lerna-package', pkgName)
  // await pinoSharedCmd.run('npx', changelogArgs, { cwd: contextPath })

  await writeStreamToChangelog(monorepo, pkgName)
}

// Base on [conventional-changelog-cli](https://www.npmjs.com/package/conventional-changelog-cli)
function writeStreamToChangelog(monorepo, pkgName) {
  return new Promise((resolve, reject) => {
    const { createReadStream, createWriteStream } = require('node:fs')
    const conventionalChangelog = require('conventional-changelog')
    const angularConfig = require('../config/changelog.config.cjs')

    const infile = path.join(
      process.cwd(),
      `${monorepo}/${pkgName}`,
      'CHANGELOG.md'
    )
    const outfile = path.join(
      process.cwd(),
      `${monorepo}/${pkgName}`,
      'CHANGELOG.md'
    )
    const changelogStream = conventionalChangelog(
      {
        config: angularConfig,
        releaseCount: 1,
        pkg: {
          path: path.join(process.cwd(), `${monorepo}/${pkgName}/package.json`)
        },
        // 该配置不要改 如果单独设置lernaPackage为`${pkgName}` 那么则需要使用add-stream手动拼接处理日志流
        lernaPackage: true,
        tagPrefix: `${pkgName}@`
      },
      undefined,
      {
        // 设置 commitPath
        path: path.join(process.cwd(), `${monorepo}/${pkgName}`)
      }
    )
    createReadStream(infile).on('error', () => {
      changelogStream.pipe(createWriteStream(outfile))
    })

    changelogStream
      .pipe(createWriteStream(outfile))
      .on('finish', () => {
        resolve()
      })
      .on('error', reject)
  })
}
