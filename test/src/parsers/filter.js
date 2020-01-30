import { FilterParser  } from '../../../src/parsers/filter.mjs';
import  { Schema }  from '../../../src/schema.mjs';
import { ValidationError } from '../../../src/errors/validation.mjs';

import chai from 'chai';
var expect = chai.expect;

describe('DEFAULTS', () => {
  it('returns `null` as the default field', () => {
    expect(FilterParser.DEFAULTS.field).to.be.null;
  });

  it('returns `null` as the default operator', () => {
    expect(FilterParser.DEFAULTS.operator).to.be.null;
  });

  it('returns `null` as the default value', () => {
    expect(FilterParser.DEFAULTS.value).to.be.null;
  });
})

describe('buildKey', () => {
  it('builds/returns a string to use as a key', () => {
    const parser = new FilterParser('filter', {}, new Schema());
    const key = parser.buildKey({
      field: 'test',
      operator: '=',
    });

    expect(key).to.equal('filter:test[=]')
  });
});

describe('validation', () => {
  it('throws if the field is not whitelisted in the schema', () => {
    const parser = new FilterParser('filter', { invalid: 123 }, new Schema());

    expect(() => parser.validate()).toThrow(
      new ValidationError('filter:invalid is not allowed')
    );
  });

  it('throws if the operator is not whitelisted in the schema', () => {
    const parser = new FilterParser(
      'filter',
      { invalid: { '!=': 123 } },
      new Schema().filter('invalid', '=')
    );

    expect(() => parser.validate()).toThrow(
      new ValidationError('filter:invalid[!=] is not allowed')
    );
  });

  it('throws if no operator or default operator is specified', () => {
    const parser = new FilterParser(
      'filter',
      { invalid: 123 },
      new Schema().filter('invalid', '=')
    );

    expect(() => parser.validate()).toThrow(
      new ValidationError('filter:invalid must be of type object')
    );
  });

  it('permits an array value', () => {
    const parser = new FilterParser(
      'filter',
      { valid: { in: [1, 2, 3] } },
      new Schema().filter('valid', 'in')
    );

    expect(() => parser.validate()).not.toThrow()
  });

  it('permits a boolean value', () => {
    const parser = new FilterParser(
      'filter',
      { valid: { '=': true } },
      new Schema().filter('valid', '=')
    );

    expect(() => parser.validate()).not.toThrow()
  });

  it('permits a number value', () => {
    const parser = new FilterParser(
      'filter',
      { valid: { '=': 123 } },
      new Schema().filter('valid', '=')
    );

    expect(() => parser.validate()).not.toThrow()
  });

  it('permits a string value', () => {
    const parser = new FilterParser(
      'filter',
      { valid: { '=': 'string' } },
      new Schema().filter('valid', '=')
    );

    expect(() => parser.validate()).not.toThrow()
  });

  it('throws for a non-permitted value', () => {
    const parser = new FilterParser(
      'filter',
      { invalid: { '=': null } },
      new Schema().filter('invalid', '=')
    );

    expect(() => parser.validate()).toThrow(
      new ValidationError(
        'filter:invalid[=] must be one of [array, boolean, number, string]'
      )
    );
  });
});

describe('flatten', () => {
  it('flattens/returns parsed map into object with keys => values', () => {
    const parser = new FilterParser(
      'filter',
      { test: { '=': 123 } },
      new Schema().filter('test', '=')
    );

    expect(parser.flatten(parser.parse())).to.deep.equal({
      'filter:test[=]': 123,
    });
  });
});

describe('parse', () => {
  it('`filter[field]=value` with a default operator', () => {
    const parser = new FilterParser(
      'filter',
      { test: 123 },
      new Schema().filter('test', '='),
      { operator: '=' }
    )

    expect(parser.parse().get('filter:test[=]')).to.deep.equal({
      field: 'test',
      operator: '=',
      value: 123,
    });
  });

  it('`filter[field][operator]=value` with one operator', () => {
    const parser = new FilterParser(
      'filter',
      { test: { '!=': 456 } },
      new Schema().filter('test', '!=')
    );

    expect(parser.parse().get('filter:test[!=]')).to.deep.equal({
      field: 'test',
      operator: '!=',
      value: 456,
    });
  });

  it('`filter[field][operator]=value` with multiple operators', () => {
    const parser = new FilterParser(
      'filter',
      {
        test: {
          '=': 123,
          '!=': 456,
        },
      },
      new Schema().filter('test', '=').filter('test', '!=')
    );

    expect(parser.parse().get('filter:test[=]')).to.deep.equal({
      field: 'test',
      operator: '=',
      value: 123,
    });

    expect(parser.parse().get('filter:test[!=]')).to.deep.equal({
      field: 'test',
      operator: '!=',
      value: 456,
    });
  });

  it('`filter[field][operator]=value` with multiple fields', () => {
    const parser = new FilterParser(
      'filter',
      {
        test1: { '=': 123 },
        test2: { '!=': 456 },
      },
      new Schema().filter('test1', '=').filter('test2', '!=')
    );

    expect(parser.parse().get('filter:test1[=]')).to.deep.equal({
      field: 'test1',
      operator: '=',
      value: 123,
    });

    expect(parser.parse().get('filter:test2[!=]')).to.deep.equal({
      field: 'test2',
      operator: '!=',
      value: 456,
    });
  });

  it('returns an empty `Map` if no query', () => {
    const parser = new FilterParser('filter', undefined, new Schema())

    expect(parser.parse().size).to.equal(0)
  });

  it('throws `ValidationError` if invalid', () => {
    const parser = new FilterParser('filter', { invalid: 123 }, new Schema())

    expect(() => parser.parse()).toThrow(
      new ValidationError('filter:invalid is not allowed')
    );
  });
});
