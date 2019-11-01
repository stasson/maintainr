import colors from 'ansi-colors'
import { format } from 'util'

export type LogType = 'debug' | 'log' | 'info' | 'warn' | 'error' | 'success'
export type LogFunction = { (...args: any): void }

const isDebug = !!process.env.DEBUG

const logColors = {
  debug: colors.grey,
  info: colors.blue,
  success: colors.green,
  warning: colors.yellow,
  error: colors.red
}

const logSymbols =
  process.platform !== 'win32' ||
  process.env.CI ||
  process.env.TERM === 'xterm-256color'
    ? {
        info: colors.blue('ℹ'),
        success: colors.green('✔'),
        warning: colors.yellow('⚠'),
        error: colors.red('✖')
      }
    : {
        info: colors.blue('i'),
        success: colors.green('√'),
        warning: colors.yellow('‼'),
        error: colors.red('×')
      }

/* tslint:disable:no-console */
const logFunctions: Record<LogType, LogFunction> = {
  debug: (...args: any) => {
    const message = format('DEBUG:\n', ...args)
    if (isDebug) console.debug(colors.grey(message))
  },
  log: (...args: any) => {
    console.log(...args)
  },
  info: (...args: any) => {
    console.info(logSymbols.info, ...args)
  },
  warn: (...args: any) => {
    const label = colors.yellow('warning:'.padEnd(8))
    console.debug(logSymbols.warning, label, ...args)
  },
  error: (...args: any) => {
    const label = colors.red('error:'.padEnd(8))
    console.debug(logSymbols.error, label, ...args)
  },
  success: (...args: any) => {
    const label = colors.green('success:'.padEnd(8))
    console.debug(logSymbols.success, label, ...args)
  }
}
/* tslint:enable:no-console */

export const logger = Object.assign(logFunctions, {
  // log symbols
  symbols: logSymbols,
  // log colors
  colors: logColors
})

export default logger
