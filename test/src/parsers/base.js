import { BaseParser } from '../../../src/parsers/base.mjs';
import { NotImplementedError }from '../../../src/errors/not_implemented.mjs';
import  { Schema }  from '../../../src/schema.mjs';
import { ValidationError } from '../../../src/errors/validation.mjs';

import chai from 'chai';
var expect = chai.expect;

describe('constructor', () => {
  it('accepts a query key to set', () => {
    const queryKey = 'test';
    const parser = new BaseParser(queryKey, {}, new Schema());

    expect(parser.queryKey).to.equal(queryKey);
  })

  it('accepts a query to set', () => {
    const query = { test: 123 };
    const parser = new BaseParser('test', query, new Schema());

    expect(parser.query).to.deep.equal(query);
  })

  it('accepts a schema to set', () => {
    const schema = new Schema();
    const parser = new BaseParser('test', {}, schema);

    expect(parser.schema).to.equal(schema);
  })

  it('accepts an optional defaults object to set', () => {
    const defaults = { operator: '=' };
    const parser = new BaseParser('test', {}, new Schema(), defaults);

    expect(parser.defaults).to.have.any.keys(defaults);
  });
});

describe('buildKey', () => {
  it('throws `NotImplementedError` when not extended', () => {
    const parser = new BaseParser('test', {}, new Schema())

    expect(() => parser.buildKey()).throws(NotImplementedError);
  });
});

describe('flatten', () => {
  it('throws `NotImplementedError` when not extended', () => {
    const parser = new BaseParser('test', {}, new Schema());

    expect(() => parser.flatten()).throws(NotImplementedError);
  });
});

describe('parse', () => {
  it('throws `NotImplementedError` when not extended', () => {
    const parser = new BaseParser('test', {}, new Schema());

    expect(() => parser.parse()).throws(NotImplementedError);
  });
});

describe('defineValidation', () => {
  it('is not defined by default', () => {
    const parser = new BaseParser('test', {}, new Schema())

    expect(parser.defineValidation()).to.be.undefined;
  });
});

describe('DEFAULTS', () => {
  it('returns an object of values to merge with instance defaults', () => {
    expect(BaseParser.DEFAULTS).toBeInstanceOf(Object)
  });
});

describe('defaults', () => {
  describe('set', () => {
    it('accepts an object with new values', () => {
      const parser = new BaseParser('test', {}, new Schema());
      const defaults = { test: 456 };

      parser.defaults = defaults;

      expect(parser.defaults).to.have.any.keys(defaults);
    });
  });

  describe('get', () => {
    it('returns an object of all values', () => {
      const parser = new BaseParser('test', {}, new Schema());
      const defaults = { test: 789 };

      parser.defaults = defaults;

      expect(parser.defaults).to.have.any.keys(defaults);
    });
  });
});

describe('validate', () => {
  it('returns `true` if valid', () => {
    const defineValidation = jest
      .spyOn(BaseParser.prototype, 'defineValidation')
      .mockImplementation(schema =>
        schema.object().keys({
          test: schema.number(),
        })
      );

    const parser = new BaseParser('test', { test: 123 }, new Schema())

    expect(parser.validate()).to.equal(true);

    defineValidation.mockRestore();
  });

  it('returns the cached `true` on subsequent calls', () => {
    const defineValidation = jest
      .spyOn(BaseParser.prototype, 'defineValidation')
      .mockImplementation(schema =>
        schema.object().keys({
          test: schema.number(),
        })
      );

    const parser = new BaseParser('test', { test: 123 }, new Schema());

    const validate = jest.spyOn(parser.validator, 'validate');

    expect(parser.validate()).to.equal(true);
    expect(parser.validate()).to.equal(true);
    expect(validate).toHaveBeenCalledTimes(1);

    defineValidation.mockRestore();
  });

  it('throws `ValidationError` if invalid', () => {
    const defineValidation = jest
      .spyOn(BaseParser.prototype, 'defineValidation')
      .mockImplementation(schema =>
        schema.object().keys({
          invalid: schema.number(),
        })
      );

    const parser = new BaseParser('test', { invalid: 'invalid' }, new Schema())

    expect(() => parser.validate()).toThrow(
      new ValidationError('test:invalid must be a number')
    );

    defineValidation.mockRestore();
  });
});
