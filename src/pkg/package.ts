import path from 'upath'
import writePkg from 'write-pkg'
import readPkg from 'read-pkg'
import findUp from 'find-up'
import { JsonObject } from 'type-fest'
import normalizeData from 'normalize-package-data'
import { logger } from '..'
import semver from 'semver'
import pacote from 'pacote'

type PackageJson = readPkg.PackageJson

export class Package {
  private constructor(readonly pkgPath: string, readonly json: PackageJson) {}

  public async save() {
    const { pkgPath: path, json } = this
    return writePkg(path, json as JsonObject, { normalize: true })
  }

  public saveSync() {
    const { pkgPath: path, json } = this
    writePkg.sync(path, json as JsonObject, { normalize: true })
  }

  static async load(cwd?: string) {
    if (!cwd) {
      const pkgup = await findUp('package.json')
      cwd = (pkgup && path.dirname(pkgup)) || undefined
    }
    const json = await readPkg({ cwd, normalize: false })
    return new Package(path.join(cwd, 'package.json'), json)
  }

  static loadSync(cwd?: string) {
    if (!cwd) {
      const pkgup = findUp.sync('package.json')
      cwd = (pkgup && path.dirname(pkgup)) || undefined
    }
    const json = readPkg.sync({ cwd, normalize: false })
    return new Package(path.join(cwd, 'package.json'), json)
  }

  delete(key: string): boolean {
    const result = this.has(key)
    delete this.json[key]
    return result
  }

  get(key: string) {
    return this.json[key]
  }

  has(key: string): boolean {
    return key in this.json
  }

  set(key: string, value: any): this {
    this.json[key] = value
    return this
  }

  normalize() {
    return normalizePackage(this.json)
  }

  update() {
    return updatePackage(this)
  }

  toJSON() {
    return this.json as any
  }

  toString() {
    return this.json.toString()
  }
}

function normalizePackage(json: PackageJson) {
  // save bin to not screw with npx
  const { bin } = json
  normalizeData(json, logger.warn, true)
  // restore bin
  Object.assign(json, { bin })

  // delete extra entries
  delete json.readme
  delete json._id

  return json
}

async function updatePackage(pkg: Package) {
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
