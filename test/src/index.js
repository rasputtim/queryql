import Knex from 'knex'; const knex = new Knex({ client: 'pg' });

import { Config }  from '../../src/config.mjs';
import { EmptyQuerier } from '../queriers/empty.mjs';
import { NotImplementedError } from '../../src/errors/not_implemented.mjs';
import { QueryQL } from '../../src/index.mjs';
import  QueryQlExports from '../../src/index.mjs';
import { TestQuerier } from '../queriers/test.mjs';
import { ValidationError }  from '../../src/errors/validation.mjs';

import { JoiValidator } from '../../src/validators/querier/joi.mjs';
import  { KnexAdapter } from '../../src/adapters/knex.mjs';

import sinon from 'sinon';

import chai from 'chai';
var expect = chai.expect;


describe('constructor', () => {
  it('accepts a query to set', () => {
    const query = { page: 2 };
    const querier = new TestQuerier(query, knex('test'));
    expect(querier.query).to.deep.equal(query);
  });

  it('accepts a builder to set', () => {
    const builder = knex('test');
    const querier = new TestQuerier({}, builder);

    expect(querier.builder).to.equal(builder);
  });

  it('accepts an optional config to set', () => {
    const config = { test: 123 };
    const querier = new TestQuerier({}, knex('test'), config);
    let testconfig = querier.config.get();
    expect(testconfig).to.have.any.keys(config);
  });

  it('calls `defineSchema` with a schema instance', () => {
    const defineSchema = sinon.spy(TestQuerier.prototype,'defineSchema');
    const querier = new TestQuerier({}, knex('test'));

    //expect(defineSchema).toHaveBeenCalledWith(querier.schema);
    sinon.assert.calledWith(defineSchema,querier.schema);
    
    sinon.restore();
  });

  it('creates an instance of the configured adapter', () => {
    const adapter = KnexAdapter;

    const Test = new TestQuerier({}, knex('test'), { adapter });
    expect(Test.config.get('adapter').name).to.equal('KnexAdapter');
  });

  it('creates an instance of the configured validator', () => {
    const validator = JoiValidator;
    //const Test = new TestQuerier({}, knex('test'), { validator });
    //const theCreatedValidator = Test.config.get('validator');
    expect(validator).to.have.lengthOf(1);
  }); 

  
  
});

describe('defineSchema', () => {
  it('throws `NotImplementedError` when not extended', () => {
    
    expect(() => new QueryQL({}, knex('test'))).throws(NotImplementedError);
    
  });
});

describe('defineValidation', () => {
  it('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'));

    expect(querier.defineValidation()).to.be.undefined;
  });
});

describe('defaultFilter', () => {
  it('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'));

    expect(querier.defaultFilter).to.be.undefined;
  });
});

describe('defaultSort', () => {
  it('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'));

    expect(querier.defaultSort).to.be.undefined;
  });
});

describe('defaultPage', () => {
  it('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'));

    expect(querier.defaultPage).to.be.undefined;
  });
});

describe('filterDefaults', () => {
  it('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'));

    expect(querier.filterDefaults).to.be.undefined
  });
});

describe('sortDefaults', () => {
  it('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'));

    expect(querier.sortDefaults).to.be.undefined;
  });
});

describe('pageDefaults', () => {
  it('is not defined by default', () => {
    const querier = new EmptyQuerier({}, knex('test'))

    expect(querier.pageDefaults).to.be.undefined
  });
});

describe('validate', () => {
  it('returns `true` if valid', () => {
    const querier = new TestQuerier(
      {
        filter: { test: 123 },
        sort: 'test',
        page: 2,
      },
      knex('test')
    );

    expect(querier.validate()).to.equal(true);
  });

  it('throws `ValidationError` if a filter is invalid', () => {
    const querier = new TestQuerier({ filter: { invalid: 123 } }, knex('test'));

    expect(() => querier.validate()).throws(
      ValidationError,'filter:invalid is not allowed'
    );
  });

  it('throws `ValidationError` if a sort is invalid', () => {
    const querier = new TestQuerier({ sort: { test: 'invalid' } }, knex('test'));

    expect(() => querier.validate()).throws(
      ValidationError,'sort:test must be one of [asc, desc]'
    );
  });

  it('throws `ValidationError` if pagination is invalid', () => {
    const querier = new TestQuerier({ page: 'invalid' }, knex('test'));

    expect(() => querier.validate()).throws(
     ValidationError,'page must be one of [number, object]'
    );
  });
});

describe('run', () => {
  it('returns the builder with filters, sorts, pagination applied', () => {
    const querier = new TestQuerier(
      {
        filter: { test: 123 },
        sort: 'test',
        page: 2,
      },
      knex('test')
    );
    let query = querier.run();
    let queryString = query.toString();
    expect(queryString).to.equal(
      'select * ' +
        'from "test" ' +
        'where "test" = 123 ' +
        'order by "test" asc ' +
        'limit 20 offset 20'
    );
  });

  it('throws `ValidationError` if invalid', () => {
    const querier = new TestQuerier({ filter: { invalid: 123 } }, knex('test'))

    expect(() => querier.run()).throws(
      ValidationError,'filter:invalid is not allowed'
    );
  });
});

describe('exports', () => {
  it('the QueryQL class', () => {
    expect(QueryQL.name).to.equal('QueryQL');
  });

  it('an object of adapter classes', () => {
    
    expect(QueryQlExports.adapters).to.have.property('BaseAdapter');
  });

  it('the Config class', () => {
    expect(QueryQlExports.Config).to.equal(Config);
  });

  it('an object of error classes', () => {
    expect(QueryQlExports.errors).to.have.property('BaseError');
  });

  it('an object of validator classes', () => {
    expect(QueryQlExports.validators).to.have.property('BaseValidator');
  });
});
