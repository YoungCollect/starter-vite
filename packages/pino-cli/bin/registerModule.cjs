const { PinoModule } = require('~pino-cli/index.cjs')
const { pinoSharedTips } = require('@oneyoung/pino-shared')

exports.registerModule = program => {
  const pinoModuleCommand = program
    .command('module')
    .description('Manage pino modules')

  pinoModuleCommand
    .command('postinstall')
    .description('postinstall pino modules')
    .argument('<moduleName>', 'The module name')
    .option('--dir <dirName>', 'The dir name', '.pino')
    .option(
      '--template <template>',
      'Path to template that will be copied (default: "template/[moduleName]rc.js")'
    )
    .action(async (arg, options) => {
      const moduleName = arg
      const { dir, template } = options
      const pino = new PinoModule({
        moduleName,
        dirName: dir
      })
      await pino.postinstall({
        template
      })
    })

  pinoModuleCommand
    .command('list')
    .description('list all of pino modules')
    .option('--verbose', 'List all of pino modules verbosely')
    .action(async options => {
      const { verbose } = options
      const moduleMap = await PinoModule.readModuleMap()
      if (!verbose) {
        pinoSharedTips.pure(Object.keys(moduleMap).join('\n'), {
          color: 'cyan'
        })
      } else {
        pinoSharedTips.pure(JSON.stringify(moduleMap, null, 2), {
          color: 'cyan'
        })
      }
    })

  pinoModuleCommand
    .command('remove')
    .description('remove pino modules')
    .argument('<moduleName>', 'The module name')
    .action(async arg => {
      await PinoModule.remove(arg)
    })

  pinoModuleCommand
    .command('revert')
    .description('revert pino modules')
    .argument('[moduleName]', 'The module name', '$all')
    .action(async arg => {
      await PinoModule.revert(arg)
    })
}
