import symbols from 'log-symbols'
import chalk from 'chalk'
import {format} from 'util'

export type LogType = 'debug' | 'log' | 'info' | 'warn' | 'error' | 'success'
export type LogFunction = { (...args: any): void }

const isDebug = !!process.env.DEBUG

export const logger: Record<LogType, LogFunction> = {
  debug: (...args) => {
    const message = format('DEBUG:'.padEnd(8), ...args)
    if (isDebug) console.debug(chalk.grey(message))
  },
  log: (...args) => {
    console.log(...args)
  },
  info: (...args) => {
    console.info(symbols.info,  ...args)
  },
  warn: (...args) => {
    const label = chalk.yellow('warning:'.padEnd(8))
    console.debug(symbols.warning, label, ...args)
  },
  error: (...args) => {
    const label = chalk.red('error:'.padEnd(8))
    console.debug(symbols.error, label, ...args)
  },
  success: (...args) => {
    const label = chalk.green('success:'.padEnd(8))
    console.debug(symbols.success, label, ...args)
  }
}

export default logger
