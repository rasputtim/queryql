import  { SortParser } from '../../../src/parsers/sort.mjs';
import  { Schema }  from '../../../src/schema.mjs';
import { ValidationError } from '../../../src/errors/validation.mjs';

import chai from 'chai';
var expect = chai.expect;

describe('DEFAULTS', () => {
  it('returns `null` as the default field', () => {
    expect(SortParser.DEFAULTS.field).to.be.null;
  });

  it('returns `asc` as the default order', () => {
    expect(SortParser.DEFAULTS.order).to.equal('asc');
  });
});

describe('buildKey', () => {
  it('builds/returns a string to use as a key', () => {
    const parser = new SortParser('sort', {}, new Schema());
    const key = parser.buildKey({ field: 'test' });

    expect(key).to.equal('sort:test');
  });
});

describe('validation', () => {
  it('throws if no fields are whitelisted in the schema', () => {
    const parser = new SortParser('sort', 'invalid', new Schema());

    expect(() => parser.validate()).toThrow(
      new ValidationError('sort is not allowed')
    );
  });

  describe('`sort=field`', () => {
    it('throws if the field is not whitelisted in the schema', () => {
      const parser = new SortParser(
        'sort',
        'invalid',
        new Schema().sort('valid')
      );

      expect(() => parser.validate()).toThrow(
        new ValidationError('sort must be one of [valid, array, object]')
      );
    });
  });

  describe('`sort[]=field`', () => {
    it('throws if the field is not whitelisted in the schema', () => {
      const parser = new SortParser(
        'sort',
        ['invalid'],
        new Schema().sort('valid')
      );

      expect(() => parser.validate()).toThrow(
        new ValidationError('sort:0 must be [valid]')
      );
    });

    it('throws if the field appears more than once', () => {
      const parser = new SortParser(
        'sort',
        ['invalid', 'invalid'],
        new Schema().sort('invalid')
      );

      expect(() => parser.validate()).toThrow(
        new ValidationError('sort:1 contains a duplicate value')
      );
    });
  });

  describe('`sort[field]=order`', () => {
    it('throws if the field is not whitelisted in the schema', () => {
      const parser = new SortParser(
        'sort',
        { invalid: 'asc' },
        new Schema().sort('valid')
      );

      expect(() => parser.validate()).toThrow(
        new ValidationError('sort:invalid is not allowed')
      );
    });

    it('throws if the order is not `asc` or `desc`', () => {
      const parser = new SortParser(
        'sort',
        { invalid: 'test' },
        new Schema().sort('invalid')
      );

      expect(() => parser.validate()).toThrow(
        new ValidationError('sort:invalid must be one of [asc, desc]')
      );
    });


    it('permits case-insensitive `asc` or `desc` order', () => {
      const parser = new SortParser(
        'sort',
        { valid: 'ASC' },
        new Schema().sort('valid')
      );

      expect(() => parser.validate()).not.toThrow();
    });
  });
});

describe('flatten', () => {
  it('flattens/returns parsed map into object with keys => values', () => {
    const parser = new SortParser(
      'sort',
      { test: 'asc' },
      new Schema().sort('test')
    );

    expect(parser.flatten(parser.parse())).to.deep.equal({
      'sort:test': 'asc',
    });
  });
});

describe('parse', () => {
  it('`sort=field`', () => {
    const parser = new SortParser('sort', 'test', new Schema().sort('test'));

    expect(parser.parse().get('sort:test')).to.deep.equal({
      field: 'test',
      order: 'asc',
    });
  });

  it('`sort[]=field` with one field', () => {
    const parser = new SortParser('sort', ['test'], new Schema().sort('test'));

    expect(parser.parse().get('sort:test')).to.deep.equal({
      field: 'test',
      order: 'asc',
    });
  });

  it('`sort[]=field` with multiple fields', () => {
    const parser = new SortParser(
      'sort',
      ['test1', 'test2'],
      new Schema().sort('test1').sort('test2')
    );

    const parsed = parser.parse()

    expect(parsed.get('sort:test1')).to.deep.equal({
      field: 'test1',
      order: 'asc',
    });

    expect(parsed.get('sort:test2')).to.deep.equal({
      field: 'test2',
      order: 'asc',
    });
  });

  it('`sort[field]=order` with one field', () => {
    const parser = new SortParser(
      'sort',
      { test: 'desc' },
      new Schema().sort('test')
    );

    expect(parser.parse().get('sort:test')).to.deep.equal({
      field: 'test',
      order: 'desc',
    });
  });

  it('`sort[field]=order` with multiple fields', () => {
    const parser = new SortParser(
      'sort',
      {
        test1: 'desc',
        test2: 'asc',
      },
      new Schema().sort('test1').sort('test2')
    );

    const parsed = parser.parse();

    expect(parsed.get('sort:test1')).to.deep.equal({
      field: 'test1',
      order: 'desc',
    });

    expect(parsed.get('sort:test2')).to.deep.equal({
      field: 'test2',
      order: 'asc',
    });
  });

  it('returns an empty `Map` if no query', () => {
    const parser = new SortParser('sort', undefined, new Schema());

    expect(parser.parse().size).to.equal(0);
  });

  it('throws `ValidationError` if invalid', () => {
    const parser = new SortParser('sort', 'invalid', new Schema().sort('valid'));

    expect(() => parser.parse()).toThrow(
      new ValidationError('sort must be one of [valid, array, object]')
    );
  });
});
