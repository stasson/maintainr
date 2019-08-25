import path from 'upath'
import writePkg from 'write-pkg'
import readPkg from 'read-pkg'
import findUp from 'find-up'
import { JsonObject } from 'type-fest'
import normalizeData from 'normalize-package-data'
import {logger} from '..'

type PackageJson = readPkg.PackageJson

export class Package {
  private constructor(readonly path: string, readonly json: PackageJson) {}

  public async save() {
    const { path, json } = this
    return writePkg(path, json as JsonObject, { normalize: true })
  }

  public saveSync() {
    const { path, json } = this
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

  static async loadSync(cwd?: string) {
    if (!cwd) {
      const pkgup = await findUp.sync('package.json')
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
  normalizeData(json, logger.warn, true )
  // restore bin
  Object.assign(json, {bin})

  // delete extra entries
  delete json.readme
  delete json._id

  return json
}
