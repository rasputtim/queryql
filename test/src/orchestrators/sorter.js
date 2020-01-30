import Knex from 'knex'; const knex = new Knex({ client: 'pg' });

import { EmptyQuerier } from  '../../queriers/empty.mjs';
const Sorter = require('../../../src/orchestrators/sorter')
import {  TestQuerier } from '../../queriers/test.mjs';
import { ValidationError } from '../../../src/errors/validation.mjs';



import chai from 'chai';
var expect = chai.expect;
 


describe('queryKey', () => {
  it('returns the key for filters in the query', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('test')));

    expect(sorter.queryKey).to.equal('sort');
  });
});

describe('schema', () => {
  it('returns the schema for sorts', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('test')));

    expect(sorter.schema.has('test')).to.equal(true);
  });
});

describe('isEnabled', () => {
  it('returns `true` if >= 1 sort is whitelisted in the schema', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('test')));

    expect(sorter.isEnabled).to.equal(true);
  });

  it('returns `false` if no sort is whitelisted in the schema', () => {
    const sorter = new Sorter(new EmptyQuerier({}, knex('test')));

    expect(sorter.isEnabled).to.equal(false);
  });
});

describe('parse', () => {
  it('parses/returns the sorts from the query', () => {
    const sorter = new Sorter(
      new TestQuerier(
        {
          sort: 'test',
        },
        knex('test')
      )
    );

    expect(sorter.parse().has('sort:test')).to.equal(true)
  });

  it('calls/uses `querier.defaultSort` if no query', () => {
    const querier = new TestQuerier({}, knex('test'));

    const defaultSort = jest
      .spyOn(querier, 'defaultSort', 'get')
      .mockReturnValue('test');

    const sorter = new Sorter(querier);
    const parsed = sorter.parse();

    expect(sorter.query).toBeFalsy();
    expect(defaultSort).toHaveBeenCalled();
    expect(parsed.has('sort:test')).to.equal(true);

    defaultSort.mockRestore();
  });
});

describe('validate', () => {
  it('returns `true` if valid', () => {
    const sorter = new Sorter(new TestQuerier({ sort: 'test' }, knex('test')));

    expect(sorter.validate()).to.equal(true);
  });

  it('returns the cached `true` on subsequent calls', () => {
    const sorter = new Sorter(new TestQuerier({ sort: 'test' }, knex('test')));

    expect(sorter.validate()).to.equal(true);
    expect(sorter._validate).to.equal(true);
    expect(sorter.validate()).to.equal(true);
  });

  it('returns `true` if disabled', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('test')));

    jest.spyOn(sorter, 'isEnabled', 'get').mockReturnValue(false);

    expect(sorter.validate()).to.equal(true);
  });

  it('throws `ValidationError` if invalid', () => {
    const sorter = new Sorter(
      new TestQuerier({ sort: { test: 'invalid' } }, knex('test'))
    );

    expect(() => sorter.validate()).toThrow(
      new ValidationError('sort:test must be one of [asc, desc]')
    );
  });
});

describe('run', () => {
  it('applies each sort in order of query', () => {
    const sorter = new Sorter(
      new TestQuerier(
        {
          sort: ['testing', 'test'],
        },
        knex('test')
      )
    );

    sorter.apply = jest.fn();

    sorter.run();

    expect(sorter.apply).toHaveBeenNthCalledWith(
      1,
      {
        field: 'testing',
        order: 'asc',
      },
      'sort:testing'
    );

    expect(sorter.apply).toHaveBeenNthCalledWith(
      2,
      {
        field: 'test',
        order: 'asc',
      },
      'sort:test'
    );
  });

  it('does not apply sorting if disabled', () => {
    const sorter = new Sorter(new TestQuerier({}, knex('test')));

    jest.spyOn(sorter, 'isEnabled', 'get').mockReturnValue(false);
    sorter.apply = jest.fn();

    sorter.run();

    expect(sorter.apply).not.toHaveBeenCalled()
  });

  it('returns the querier', () => {
    const querier = new TestQuerier({}, knex('test'));
    const sorter = new Sorter(querier);

    expect(sorter.run()).to.equal(querier);
  });

  it('throws `ValidationError` if invalid', () => {
    const sorter = new Sorter(
      new TestQuerier({ sort: { test: 'invalid' } }, knex('test'))
    );

    expect(() => sorter.run()).toThrow(
      new ValidationError('sort:test must be one of [asc, desc]')
    );
  });
});
