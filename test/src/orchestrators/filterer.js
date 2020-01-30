import Knex from 'knex'; const knex = new Knex({ client: 'pg' });

import { EmptyQuerier } from  '../../queriers/empty.mjs';
import { Filterer } from '../../../src/orchestrators/filterer.mjs';
import {  TestQuerier } from '../../queriers/test.mjs';
import { ValidationError } from '../../../src/errors/validation.mjs';


import chai from 'chai';
var expect = chai.expect;


describe('queryKey', () => {
  it('returns the key for filters in the query', () => {
    const filterer = new Filterer(new TestQuerier({}, knex('test')));

    expect(filterer.queryKey).to.equal('filter');
  });
});

describe('schema', () => {
  it('returns the schema for filters', () => {
    const filterer = new Filterer(new TestQuerier({}, knex('test')));

    expect(filterer.schema.has('test[=]')).to.equal(true);
  });
});

describe('isEnabled', () => {
  it('returns `true` if >= 1 filter is whitelisted in the schema', () => {
    const filterer = new Filterer(new TestQuerier({}, knex('test')));

    expect(filterer.isEnabled).to.equal(true);
  });

  it('returns `false` if no filter is whitelisted in the schema', () => {
    const filterer = new Filterer(new EmptyQuerier({}, knex('test')));

    expect(filterer.isEnabled).to.equal(false);
  });
});

describe('parse', () => {
  it('parses/returns the filters from the query', () => {
    const filterer = new Filterer(
      new TestQuerier(
        {
          filter: { test: 123 },
        },
        knex('test')
      )
    );

    expect(filterer.parse().has('filter:test[=]')).to.equal(true)
  });

  it('calls/uses `querier.defaultFilter` if no query', () => {
    const querier = new TestQuerier({}, knex('test'));

    const defaultFilter = jest
      .spyOn(querier, 'defaultFilter', 'get')
      .mockReturnValue({ test: 123 });

    const filterer = new Filterer(querier);
    const parsed = filterer.parse();

    expect(filterer.query).toBeFalsy();
    expect(defaultFilter).toHaveBeenCalled();
    expect(parsed.has('filter:test[=]')).to.equal(true);

    defaultFilter.mockRestore();
  });
});

describe('validate', () => {
  it('returns `true` if valid', () => {
    const filterer = new Filterer(
      new TestQuerier({ filter: { test: 123 } }, knex('test'))
    );

    expect(filterer.validate()).to.equal(true);
  });

  it('returns the cached `true` on subsequent calls', () => {
    const filterer = new Filterer(
      new TestQuerier({ filter: { test: 123 } }, knex('test'))
    );

    expect(filterer.validate()).to.equal(true);
    expect(filterer._validate).to.equal(true);
    expect(filterer.validate()).to.equal(true);
  });

  it('returns `true` if disabled', () => {
    const filterer = new Filterer(new TestQuerier({}, knex('test')));

    jest.spyOn(filterer, 'isEnabled', 'get').mockReturnValue(false);

    expect(filterer.validate()).to.equal(true);
  });

  it('throws `ValidationError` if invalid', () => {
    const filterer = new Filterer(
      new TestQuerier({ filter: { invalid: 123 } }, knex('test'))
    );

    expect(() => filterer.validate()).toThrow(
      new ValidationError('filter:invalid is not allowed')
    );
  });
});

describe('run', () => {
  it('applies each filter in order of schema', () => {
    const filterer = new Filterer(
      new TestQuerier(
        {
          filter: {
            testing: { '!=': 456 },
            test: 123,
          },
        },
        knex('test')
      )
    );

    filterer.apply = jest.fn();

    filterer.run();

    expect(filterer.apply).toHaveBeenNthCalledWith(
      1,
      {
        field: 'test',
        operator: '=',
        value: 123,
      },
      'filter:test[=]'
    );

    expect(filterer.apply).toHaveBeenNthCalledWith(
      2,
      {
        field: 'testing',
        operator: '!=',
        value: 456,
      },
      'filter:testing[!=]'
    );
  });

  it('does not apply filtering if disabled', () => {
    const filterer = new Filterer(new TestQuerier({}, knex('test')));

    jest.spyOn(filterer, 'isEnabled', 'get').mockReturnValue(false);
    filterer.apply = jest.fn();

    filterer.run();

    expect(filterer.apply).not.toHaveBeenCalled();
  });

  it('returns the querier', () => {
    const querier = new TestQuerier({}, knex('test'));
    const filterer = new Filterer(querier);

    expect(filterer.run()).to.equal(querier);
  });

  it('throws `ValidationError` if invalid', () => {
    const filterer = new Filterer(
      new TestQuerier({ filter: { invalid: 123 } }, knex('test'))
    );

    expect(() => filterer.run()).toThrow(
      new ValidationError('filter:invalid is not allowed')
    );
  });
});
