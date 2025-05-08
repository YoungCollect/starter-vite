const semver = require('semver')
const { pinoSharedTips } = require('@oneyoung/pino-shared')

const {
  getPackageInfo,
  getActiveVersion
} = require('~pino-cli/utils/release.cjs')
const {
  publishPackage,
  getPublishRegistry
} = require('~pino-cli/utils/publish.cjs')

const publish = async ({
  monorepo = 'packages',
  tag = '',
  pkgName = '',
  getPkgDir = (monorepo, pkg) => `${monorepo}/${pkg}`,
  packageManager = 'pnpm'
} = {}) => {
  if (!tag) throw new Error('No tag specified')

  let finalPackageManager = packageManager
  let version

  if (tag.includes('@')) [, version] = tag.split('@')
  else version = tag

  if (version.startsWith('v')) version = version.slice(1)

  const { pkg, pkgDir } = getPackageInfo(monorepo, pkgName, getPkgDir)
  if (pkg.version !== version)
    throw new Error(
      `Package version from tag "${version}" mismatches with current version "${pkg.version}"`
    )

  // 针对 workspace protocol, 强制使用pnpm. 因为npm和yarn在publish时不会自动处理workspace前缀
  if (
    finalPackageManager !== 'pnpm' &&
    pkg.dependencies &&
    Object.values(pkg.dependencies).some(version =>
      version.startsWith('workspace:')
    )
  ) {
    pinoSharedTips.warn(
      `Switch ${finalPackageManager} to pnpm because of the workspace protocol in dependencies.`
    )
    finalPackageManager = 'pnpm'
  }

  const activeVersion = await getActiveVersion(pkg.name)

  pinoSharedTips.info(
    `Registry package version: ${activeVersion}, Publishing version: ${version}\n`
  )

  const registry = await getPublishRegistry(pkg.name)
  pinoSharedTips.step(
    registry ? `Publish package to ${registry}...\n` : 'Publish package...\n'
  )

  const releaseTag = version.includes('beta')
    ? 'beta'
    : version.includes('alpha')
    ? 'alpha'
    : activeVersion && semver.lt(pkg.version, activeVersion)
    ? 'previous'
    : undefined
  await publishPackage({
    pkgDir,
    releaseTag,
    packageManager: finalPackageManager
  })
}

module.exports = { publish }
