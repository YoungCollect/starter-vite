import { exec } from 'node:child_process'

const args = process.argv.slice(2)

// pnpm run build:lib --entry
const monorepoEntry = args[0]?.slice(2)

if (monorepoEntry) {
  exec(`pnpm --filter ${monorepoEntry} run build`, (err, stdout, stderr) => {
    if (stderr) {
      console.log(stderr)
      process.exit(1)
    } else {
      console.log(stdout)
    }
  })
} else {
  exec(`pnpm --filter "*" run build`, (err, stdout, stderr) => {
    if (stderr) {
      console.log(stderr)
      process.exit(1)
    } else {
      console.log(stdout)
    }
  })
}
