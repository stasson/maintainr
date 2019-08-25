# maintainr

misc repo maintainer utils

## Cli

```bash
$ npx maintainer
maintainr v0.0.1

Usage:
  $ maintainr <command> [options]

Commands:
  pkg-set <key> <value>  set a key in the package.json
  pkg-del <key>          deelte a key in the package.json
  pkg-get <key>          get a key in the package.json
  pkg-dump               dump package.json
  pkg-fix                normalize package.json

For more info, run any command with the `--help` flag:
  $ maintainr pkg-set --help
  $ maintainr pkg-del --help
  $ maintainr pkg-get --help
  $ maintainr pkg-dump --help
  $ maintainr pkg-fix --help

Options:
  -v, --version  Display version number
  -h, --help     Display this message
```

## Lib

```bash
npm i maintainr
```
