import cac from 'cac'
import path from 'upath'
import readPkg from 'read-pkg'
import { Package, logger, git } from '..'
import yaml from 'js-yaml'

const prog = cac()

prog.option('-j, --json', 'dump in json format')

function dump(
  x: any,
  options?: {
    json?: boolean
  }
) {
  if (options && options.json) {
    logger.log(JSON.stringify(x, null, 2))
  } else {
    logger.log(
      yaml.dump(x, {
        indent: 2,
        noRefs: true
      })
    )
  }
}

export async function run(argv?: string[]) {
  const pkg = (await readPkg({
    cwd: path.join(__dirname, '../../')
  })) as any
  prog.name = pkg.name
  prog.version(pkg.version)
  prog.help()
  const { args } = prog.parse(argv, { run: false })

  if (prog.matchedCommand) {
    return Promise.resolve(prog.runMatchedCommand())
  } else {
    if (args.length) {
      logger.error(`unkown command ${args[0]}`)
    }
    prog.outputHelp()
  }
}

// pkg-set
prog
  .command('pkg-set <key> <value>', 'set an entry in the package.json')
  .option('--package <path>', 'path to package.json')
  .action(async (key, value, options?) => {
    const pkg = await Package.load(options.path)
    key = String(key)
    try {
      value = yaml.safeLoad(value)
    } catch (err) {
      throw Error('invalid value argument')
    }
    pkg.set(key, value)
    return pkg.save()
  })

// pkg-del
prog
  .command('pkg-del <key>', 'delete an entry in the package.json')
  .option('--package <path>', 'path to package.json')
  .action(async (key, options?) => {
    const pkg = await Package.load(options.path)
    pkg.delete(String(key))
    return pkg.save()
  })

// pkg-get
prog
  .command('pkg-get <key>', 'get a key in the package.json')
  .option('--package <path>', 'path to package.json')
  .action(async (key, options?) => {
    const pkg = await Package.load(options.path)
    const value = pkg.get(String(key))
    dump(value)
  })

// pkg-dump
prog
  .command('pkg-dump', 'dump package.json entries')
  .option('--package <path>', 'path to package.json')
  .action(async (options?) => {
    const pkg = await Package.load(options.path)
    dump(pkg.toJSON(), options)
  })

// pkg-norm
prog
  .command('pkg-norm', 'normalize package.json')
  .option('--package <path>', 'path to package.json')
  .action(async (options?) => {
    const pkg = await Package.load(options.path)
    pkg.normalize()
    return pkg.save()
  })

// pkg-up
prog
  .command('pkg-up', 'update package dependencies')
  .option('--package <path>', 'path to package.json')
  .action(async (options?) => {
    const pkg = await Package.load(options.path)
    await pkg.update()
    pkg.normalize()
    return pkg.save()
  })

prog
  .command('git-dump', 'dump git info')
  .option('--remote <remote>', 'remote name, default to origin')
  .action(async (options?) => {
    const remoteName = options.remote || 'origin'
    const remotes = await git.getRemotes(true)
    const remoteOrigin = remotes.find(({ name }) => name === remoteName)
    const { push: url } = (remoteOrigin && remoteOrigin.refs) || {
      push: 'undefined'
    }
    const path = await git.revparse(['--show-toplevel'])
    const status = await git.status()
    const { current: branch, files } = status
    const dirty = files.length != 0
    const user = (await git.raw(['config', 'user.name'])).trim()
    const email = (await git.raw(['config', 'user.email'])).trim()

    dump({ [remoteName]: url, path, branch, user, email, dirty }, options)
  })

prog
  .command('git-status', 'dump git status')
  .option('--remote <remote>', 'remote name, default to origin')
  .action(async (options?) => {
    const status = await git.status()
    dump({ status }, options)
  })
