import {logger, colors}  from '../src'

test('unit-test', ()=>{
  expect(colors).toBeDefined()
  expect(logger).toBeDefined()
  expect(logger.colors).toBeDefined()
  expect(logger.symbols).toBeDefined()
})
