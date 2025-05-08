const execa = require('execa')
const mri = require('mri')
const tips = require('~pino-shared/utils/tips.cjs')

const args = mri(process.argv.slice(2))

const isDryRun = !!args.dry

if (isDryRun) {
  tips.pure(tips.pure(' DRY RUN ', { color: 'yellow', log: false }), {
    color: 'inverse'
  })
}

async function run(bin, args, opts = {}) {
  // 默认pipe-在子进程中创建消息管道 inherit-在父进程中创建消息管道
  return execa(bin, args, { stdio: 'pipe', ...opts })
}

async function dryRun(bin, args, opts) {
  return console.log(
    tips.pure(`[dryrun] ${bin} ${args.join(' ')}`, {
      color: 'blue',
      log: false
    }),
    opts || ''
  )
}

const runIfNotDry = isDryRun ? dryRun : run

module.exports = {
  args,
  isDryRun,
  run,
  dryRun,
  runIfNotDry
}
