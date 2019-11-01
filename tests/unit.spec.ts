import {logger, colors}  from '..'



test('unit-test', ()=>{
  expect(logger.colors).toBeDefined()
  expect(logger.symbols).toBeDefined()
})
