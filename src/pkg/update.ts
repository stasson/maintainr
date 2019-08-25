import { Package } from './package'
import semver from 'semver'
import pacote from 'pacote'
import { logger } from '../utils'

export async function updatePackage(pkg: Package) {
  const { dependencies, devDependencies, optionalDependencies } = pkg.json
  const updates = [dependencies, devDependencies, optionalDependencies].map(
    async x => getUpdate(x)
  )
  return Promise.all(updates)
}

async function getUpdate(dependencies?: { [k: string]: string }) {
  if (!dependencies) return dependencies

  const updates = Array.from(Object.entries(dependencies))
    .filter(([_, version]) => semver.validRange(version))
    .map(async ([name, version]) => {
      const dep = [name, version].join('@')
      try {
        const manifest = await pacote.manifest(dep)
        const newVersion = `^${manifest.version}`
        if (newVersion != version) {
          dependencies[name] = newVersion
          logger.success('updated', name, version, '=>', newVersion)
        }
      } catch {
        logger.warn('skipped', name, '(version check failed)')
      }
    })
  return Promise.all(updates)
}
