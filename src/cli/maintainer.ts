import cac from 'cac'
import path from 'upath'
import readPkg from 'read-pkg'
import { Package, logger } from '..'
import yaml from 'js-yaml'
import { updatePackage } from '..';

const prog = cac()

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
    console.log(value)
  })

// pkg-dump
prog
  .command('pkg-dump', 'dump package.json entries')
  .option('--package <path>', 'path to package.json')
  .action(async (options?) => {
    const pkg = await Package.load(options.path)
    const dump = JSON.stringify(pkg.toJSON(),null,2)
    console.log(dump)
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
    await updatePackage(pkg)
    pkg.normalize()
    return pkg.save()
  })
