import Knex from 'knex'; const knex = new Knex({ client: 'pg' });

import  { BaseOrchestrator } from '../../../src/orchestrators/base.mjs';
import { NotImplementedError }from '../../../src/errors/not_implemented.mjs';
import {  TestQuerier } from '../../queriers/test.mjs';
import { ValidationError } from '../../../src/errors/validation.mjs';


import chai from 'chai';
var expect = chai.expect;

let buildParser;

beforeEach(() => {
  buildParser = jest
    .spyOn(BaseOrchestrator.prototype, 'buildParser')
    .mockReturnValue({ parse: () => {} });
});

afterEach(() => {
  buildParser.mockRestore()
})

describe('constructor', () => {
  it('accepts a querier to set', () => {
    const querier = new TestQuerier({}, knex('test'))
    const filterer = new BaseOrchestrator(querier)

    expect(filterer.querier).to.equal(querier)
  })

  it('calls `buildParser` and sets the returned value', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    expect(buildParser).toHaveBeenCalled()
    expect(orchestrator.parser).toBeDefined()
  })
})

describe('queryKey', () => {
  it('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    expect(() => orchestrator.queryKey).throws(NotImplementedError);
  })
})

describe('schema', () => {
  it('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    expect(() => orchestrator.schema).throws(NotImplementedError);
  })
})

describe('isEnabled', () => {
  it('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    expect(() => orchestrator.isEnabled).throws(NotImplementedError);
  })
})

describe('buildParser', () => {
  it('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    buildParser.mockRestore()

    expect(() => orchestrator.buildParser()).throws(NotImplementedError);
  })
})

describe('validate', () => {
  it('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    expect(() => orchestrator.validate()).throws(NotImplementedError);
  })
})

describe('run', () => {
  it('throws `NotImplementedError` when not extended', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    expect(() => orchestrator.run()).throws(NotImplementedError);
  })
})

describe('query', () => {
  it('returns the query value specified by the query key', () => {
    const orchestrator = new BaseOrchestrator(
      new TestQuerier({ test: 123 }, knex('test'))
    )

    jest.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test')

    expect(orchestrator.query).to.equal(123)
  })
})

describe('parse', () => {
  it('parses/returns the query', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    jest.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(true)

    orchestrator.parser = { parse: () => 123 }

    expect(orchestrator.parse()).to.equal(123)
  })

  it('returns the cached parsed query on subsequent calls', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    jest.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(true)

    const parse = jest.fn(() => 123)

    orchestrator.parser = { parse }

    expect(orchestrator.parse()).to.equal(123)
    expect(orchestrator.parse()).to.equal(123)
    expect(parse).toHaveBeenCalledTimes(1)
  })

  it('returns `null` if disabled, no query', () => {
    const orchestrator = new BaseOrchestrator(new TestQuerier({}, knex('test')))

    jest.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test')
    jest.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(false)

    expect(orchestrator.parse()).to.be.null;
  })

  it('throws `ValidationError` if disabled, with query', () => {
    const orchestrator = new BaseOrchestrator(
      new TestQuerier({ test: 123 }, knex('test'))
    )

    jest.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('test')
    jest.spyOn(orchestrator, 'isEnabled', 'get').mockReturnValue(false)

    expect(() => orchestrator.parse()).toThrow(
      new ValidationError(`${orchestrator.queryKey} is disabled`)
    )
  })
})

describe('apply', () => {
  it('calls/returns method on querier if method defined', () => {
    const querier = new TestQuerier({}, knex('test'))
    const orchestrator = new BaseOrchestrator(querier)
    const data = {
      field: 'test',
      order: 'asc',
    }

    jest.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('sort')
    querier['sort:test'] = jest.fn(builder => builder)

    expect(orchestrator.apply(data, 'sort:test')).to.equal(querier.builder)
    expect(querier['sort:test']).toHaveBeenCalledWith(querier.builder, data)
  })

  it('calls/returns method on adapter if querier method not defined', () => {
    const querier = new TestQuerier({}, knex('test'))
    const orchestrator = new BaseOrchestrator(querier)
    const data = {
      field: 'test',
      order: 'asc',
    }

    jest.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('sort')
    jest.spyOn(querier.adapter, 'sort')

    expect(orchestrator.apply(data, 'test')).to.equal(querier.builder)
    expect(querier.adapter.sort).toHaveBeenCalledWith(querier.builder, data)
  })

  it('calls/returns method on adapter if no querier method specified', () => {
    const querier = new TestQuerier({}, knex('test'))
    const orchestrator = new BaseOrchestrator(querier)
    const data = {
      size: 20,
      number: 2,
      offset: 20,
    }

    jest.spyOn(orchestrator, 'queryKey', 'get').mockReturnValue('page')
    jest.spyOn(querier.adapter, 'page')

    expect(orchestrator.apply(data)).to.equal(querier.builder)
    expect(querier.adapter.page).toHaveBeenCalledWith(querier.builder, data)
  })
})
