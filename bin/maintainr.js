#!/usr/bin/env node
const loudRejection = require('loud-rejection')
const {logger} = require('../lib/utils')
const { run } = require('../lib/cli/maintainr')
loudRejection(() => logger.error('unexpected error'))
run().catch(err=> {
  logger.error(err.message || err)
  logger.debug(err)
  process.exitCode = -1
})
