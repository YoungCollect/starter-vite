const { PinoPublish } = require('~pino-cli/index.cjs')

exports.registerPublish = program => {
  // eslint-disable-next-line
  const pinoPublishCommand = program
    .command('publish')
    .description('Publish packages to the registry')
    .option('--dry', 'Dry run') // npx pino publish pino-cli@1.0.0 --dry
    .option('--monorepo <monorepo>', 'The monorepo path', 'packages') // npx pino release --monorepo
    .option('--tag <tag>', 'The release tag', 'latest') // npx pino publish --tag pino-cli@1.0.0
    .action(async options => {
      const pinoPublish = new PinoPublish()
      await pinoPublish.publish({
        ...options
      })
    })
}
