# maintainr

misc repo maintainer utils

## Cli

```bash
$ npx maintainr

Usage:
  $ maintainr <command> [options]

Commands:
  pkg-set <key> <value>  set an entry in the package.json
  pkg-del <key>          delete an entry in the package.json
  pkg-get <key>          get a key in the package.json
  pkg-dump               dump package.json entries
  pkg-norm               normalize package.json
  pkg-up                 update package dependencies

For more info, run any command with the `--help` flag:
  $ maintainr pkg-set --help
  $ maintainr pkg-del --help
  $ maintainr pkg-get --help
  $ maintainr pkg-dump --help
  $ maintainr pkg-norm --help
  $ maintainr pkg-up --help

Options:
  -v, --version  Display version number
  -h, --help     Display this message
```

## Lib

```bash
npm i maintainr
```
