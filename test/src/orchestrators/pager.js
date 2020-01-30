import Knex from 'knex'; const knex = new Knex({ client: 'pg' });

import { EmptyQuerier } from  '../../queriers/empty.mjs';
const Pager = require('../../../src/orchestrators/pager')
import {  TestQuerier } from '../../queriers/test.mjs';
import { ValidationError } from '../../../src/errors/validation.mjs';


import chai from 'chai';
var expect = chai.expect;


describe('queryKey', () => {
  it('returns the key for pagination in the query', () => {
    const pager = new Pager(new TestQuerier({}, knex('test')));

    expect(pager.queryKey).to.equal('page');
  });
});

describe('schema', () => {
  it('returns the schema for pagination', () => {
    const pager = new Pager(new TestQuerier({}, knex('test')));

    expect(pager.schema.isEnabled).to.equal(true);
  });
});

describe('isEnabled', () => {
  it('returns `true` if pagination is enabled in the schema', () => {
    const pager = new Pager(new TestQuerier({}, knex('test')));

    expect(pager.isEnabled).to.equal(true);
  });

  it('returns `false` if pagination is disabled in the schema', () => {
    const pager = new Pager(new EmptyQuerier({}, knex('test')));

    expect(pager.isEnabled).to.equal(false)
  });
});

describe('parse', () => {
  it('parses/returns the pagination from the query', () => {
    const pager = new Pager(
      new TestQuerier(
        {
          page: 2,
        },
        knex('test')
      )
    );

    expect(pager.parse().get('page:number').value).to.equal(2);
  });

  it('calls/uses `querier.defaultPage` if no query', () => {
    const querier = new TestQuerier({}, knex('test'))

    const defaultPage = jest
      .spyOn(querier, 'defaultPage', 'get')
      .mockReturnValue(2);

    const pager = new Pager(querier);
    const parsed = pager.parse();

    expect(pager.query).toBeFalsy();
    expect(defaultPage).toHaveBeenCalled();
    expect(parsed.get('page:number').value).to.equal(2);

    defaultPage.mockRestore();
  });
});

describe('validate', () => {
  it('returns `true` if valid', () => {
    const pager = new Pager(new TestQuerier({ page: 2 }, knex('test')));

    expect(pager.validate()).to.equal(true);
  });

  it('returns the cached `true` on subsequent calls', () => {
    const pager = new Pager(new TestQuerier({ page: 2 }, knex('test')));

    expect(pager.validate()).to.equal(true);
    expect(pager._validate).to.equal(true);
    expect(pager.validate()).to.equal(true);
  });

  it('returns `true` if disabled', () => {
    const pager = new Pager(new TestQuerier({}, knex('test')));

    jest.spyOn(pager, 'isEnabled', 'get').mockReturnValue(false);

    expect(pager.validate()).to.equal(true);
  });

  it('throws `ValidationError` if invalid', () => {
    const pager = new Pager(new TestQuerier({ page: 'invalid' }, knex('test')));

    expect(() => pager.validate()).toThrow(
      new ValidationError('page must be one of [number, object]')
    );
  });
});

describe('run', () => {
  it('applies pagination', () => {
    const pager = new Pager(
      new TestQuerier(
        {
          page: 2,
        },
        knex('test')
      )
    );

    pager.apply = jest.fn();

    pager.run();

    expect(pager.apply).toHaveBeenCalledWith({
      size: 20,
      number: 2,
      offset: 20,
    });
  });

  it('does not apply pagination if disabled', () => {
    const pager = new Pager(new TestQuerier({}, knex('test')));

    jest.spyOn(pager, 'isEnabled', 'get').mockReturnValue(false);
    pager.apply = jest.fn();

    pager.run();

    expect(pager.apply).not.toHaveBeenCalled();
  });

  it('returns the querier', () => {
    const querier = new TestQuerier({}, knex('test'));
    const pager = new Pager(querier);

    pager.apply = jest.fn();

    expect(pager.run()).to.equal(querier);
  });

  it('throws `ValidationError` if invalid', () => {
    const pager = new Pager(new TestQuerier({ page: 'invalid' }, knex('test')));

    expect(() => pager.run()).toThrow(
      new ValidationError('page must be one of [number, object]')
    );
  });
});
