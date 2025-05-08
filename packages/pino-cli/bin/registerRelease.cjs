const { PinoRelease } = require('~pino-cli/index.cjs')

exports.registerRelease = program => {
  // eslint-disable-next-line
  const pinoReleaseCommand = program
    .command('release')
    .description('Release packages, bump version, commit and tag')
    .option('--dry', 'Dry run') // npx pino release --dry
    .option('--monorepo <monorepo>', 'The monorepo path', 'packages') // npx pino release --monorepo
    .action(async options => {
      const pinoRelease = new PinoRelease()
      await pinoRelease.release(options)
    })
}
