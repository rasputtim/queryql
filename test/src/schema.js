import { Schema } from '../../src/schema.mjs';
import chai from 'chai';
var expect = chai.expect;

describe('constructor', () => {
  it('defaults to no whitelisted filters', () => {
    expect(new Schema().filters.size).to.equal(0);
  });

  it('defaults to no whitelisted sorts', () => {
    expect(new Schema().sorts.size).to.equal(0);
  });

  it('defaults to pagination disabled', () => {
    expect(new Schema().pageOptions.isEnabled).to.equal(false);
  });
});

describe('filter', () => {
  it('whitelists a filter', () => {
    const schema = new Schema();

    schema.filter('test', '=');

    expect(schema.filters.get('test[=]')).to.deep.equal({
      field: 'test',
      operator: '=',
      options: {},
    });
  });

  it('accepts an optional options object', () => {
    const schema = new Schema();
    const options = { test: 123 };

    schema.filter('test', '=', options);

    expect(schema.filters.get('test[=]').options).to.deep.equal(options);
  });

  it('returns itself for chaining', () => {
    const schema = new Schema();

    expect(schema.filter('test', '=')).to.equal(schema);
  });
});

describe('sort', () => {
  it('whitelists a sort', () => {
    const schema = new Schema();

    schema.sort('test');

    expect(schema.sorts.get('test')).to.deep.equal({
      field: 'test',
      options: {},
    });
  });

  it('accepts an optional options object', () => {
    const schema = new Schema();
    const options = { test: 123 };

    schema.sort('test', options);

    expect(schema.sorts.get('test').options).to.deep.equal(options)
  })

  it('returns itself for chaining', () => {
    const schema = new Schema();

    expect(schema.sort('test')).to.equal(schema);
  });
});

describe('page', () => {
  it('accepts boolean `true` to enable', () => {
    const schema = new Schema();

    schema.page(true);

    expect(schema.pageOptions).to.deep.equal({ isEnabled: true });
  });

  it('accepts boolean `false` to disable', () => {
    const schema = new Schema();

    schema.page(false);

    expect(schema.pageOptions).to.deep.equal({ isEnabled: false });
  });

  it('defaults to enable when called without arguments', () => {
    const schema = new Schema();

    schema.page();

    expect(schema.pageOptions).to.deep.equal({ isEnabled: true });
  });

  it('accepts object of options', () => {
    const schema = new Schema();
    const options = {
      isEnabled: false,
      test: 123,
    };

    schema.page(options);

    expect(schema.pageOptions).to.deep.equal(options);
  });

  it('defaults to enable when `isEnabled` not specified in options', () => {
    const schema = new Schema();
    const options = { test: 123 };

    schema.page(options);

    expect(schema.pageOptions).to.deep.equal({
      ...options,
      isEnabled: true,
    });
  });
});

describe('mapFilterFieldsToOperators', () => {
  it('returns object with filter fields (keys) => operators (values)', () => {
    const schema = new Schema();

    schema.filter('test1', '=');
    schema.filter('test1', '!=');
    schema.filter('test2', 'in');

    expect(schema.mapFilterFieldsToOperators()).to.deep.equal({
      test1: ['=', '!='],
      test2: ['in'],
    });
  });
});
