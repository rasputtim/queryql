import { PageParser } from '../../../src/parsers/page.mjs';
import  { Schema }  from '../../../src/schema.mjs';
import { ValidationError } from '../../../src/errors/validation.mjs';

import chai from 'chai';
var expect = chai.expect;

describe('DEFAULTS', () => {
  it('returns `20` as the default size', () => {
    expect(PageParser.DEFAULTS.size).to.equal(20);
  });

  it('returns `1` as the default number', () => {
    expect(PageParser.DEFAULTS.number).to.equal(1)
  });
});

describe('buildKey', () => {
  it('builds/returns a string to use as a key', () => {
    const parser = new PageParser('page', {}, new Schema())
    const key = parser.buildKey({
      field: 'size',
    });

    expect(key).to.equal('page:size');
  });

  it('builds/returns a key without the query key, if specified', () => {
    const parser = new PageParser('page', {}, new Schema());
    const key = parser.buildKey(
      {
        field: 'size',
      },
      false
    );

    expect(key).to.equal('size');
  });
});

describe('validation', () => {
  describe('`page=number`', () => {
    it('throws if the number is not an integer', () => {
      const parser = new PageParser('page', '1.1', new Schema());

      expect(() => parser.validate()).toThrow(
        new ValidationError('page must be an integer')
      );
    });

    it('throws if the number is not positive', () => {
      const parser = new PageParser('page', '-1', new Schema())

      expect(() => parser.validate()).toThrow(
        new ValidationError('page must be a positive number')
      );
    });
  });

  describe('`page[number]=value`', () => {
    it('throws if the number is not an integer', () => {
      const parser = new PageParser('page', { number: '1.1' }, new Schema());

      expect(() => parser.validate()).toThrow(
        new ValidationError('page:number must be an integer')
      );
    });

    it('throws if the number is not positive', () => {
      const parser = new PageParser('page', { number: '-1' }, new Schema());

      expect(() => parser.validate()).toThrow(
        new ValidationError('page:number must be a positive number')
      );
    });
  });

  describe('`page[size]=value`', () => {
    it('throws if the number is not an integer', () => {
      const parser = new PageParser('page', { size: '1.1' }, new Schema())

      expect(() => parser.validate()).toThrow(
        new ValidationError('page:size must be an integer')
      );
    });

    it('throws if the number is not positive', () => {
      const parser = new PageParser('page', { size: '-1' }, new Schema())

      expect(() => parser.validate()).toThrow(
        new ValidationError('page:size must be a positive number')
      );
    });
  });
});

describe('flatten', () => {
  it('flattens/returns parsed map into object with keys => values', () => {
    const parser = new PageParser('page', 2, new Schema());

    expect(parser.flatten(parser.parse())).to.deep.equal({
      'page:size': 20,
      'page:number': 2,
      'page:offset': 20,
    });
  });

  it('optionally excludes the query key from the key', () => {
    const parser = new PageParser('page', 2, new Schema());

    expect(parser.flatten(parser.parse(), false)).to.deep.equal({
      size: 20,
      number: 2,
      offset: 20,
    });
  });
});

describe('parse', () => {
  it('`page=number` with a string number', () => {
    const parser = new PageParser('page', '2', new Schema());
    const parsed = parser.parse();

    expect(parsed.get('page:size')).to.deep.equal({
      field: 'size',
      value: 20,
    });

    expect(parsed.get('page:number')).to.deep.equal({
      field: 'number',
      value: '2',
    });

    expect(parsed.get('page:offset')).to.deep.equal({
      field: 'offset',
      value: 20,
    });
  });

  it('`page=number` with a number number', () => {
    const parser = new PageParser('page', 2, new Schema())
    const parsed = parser.parse()

    expect(parsed.get('page:size')).to.deep.equal({
      field: 'size',
      value: 20,
    });

    expect(parsed.get('page:number')).to.deep.equal({
      field: 'number',
      value: 2,
    });

    expect(parsed.get('page:offset')).to.deep.equal({
      field: 'offset',
      value: 20,
    });
  });

  it('`page[number]=value`', () => {
    const parser = new PageParser('page', { number: '2' }, new Schema())
    const parsed = parser.parse()

    expect(parsed.get('page:size')).to.deep.equal({
      field: 'size',
      value: 20,
    });

    expect(parsed.get('page:number')).to.deep.equal({
      field: 'number',
      value: '2',
    });

    expect(parsed.get('page:offset')).to.deep.equal({
      field: 'offset',
      value: 20,
    });
  });

  it('`page[size]=value`', () => {
    const parser = new PageParser('page', { size: '10' }, new Schema())
    const parsed = parser.parse()

    expect(parsed.get('page:size')).to.deep.equal({
      field: 'size',
      value: '10',
    });

    expect(parsed.get('page:number')).to.deep.equal({
      field: 'number',
      value: 1,
    });

    expect(parsed.get('page:offset')).to.deep.equal({
      field: 'offset',
      value: 0,
    });
  });

  it('`page[number]=value&page[size]=value`', () => {
    const parser = new PageParser(
      'page',
      { number: '2', size: '10' },
      new Schema().page()
    );
    const parsed = parser.parse();

    expect(parsed.get('page:size')).to.deep.equal({
      field: 'size',
      value: '10',
    });

    expect(parsed.get('page:number')).to.deep.equal({
      field: 'number',
      value: '2',
    });

    expect(parsed.get('page:offset')).to.deep.equal({
      field: 'offset',
      value: 10,
    });
  });

  it('uses the defaults if no query', () => {
    const parser = new PageParser('page', undefined, new Schema());
    const parsed = parser.parse()

    expect(parsed.get('page:size')).to.deep.equal({
      field: 'size',
      value: PageParser.DEFAULTS.size,
    });

    expect(parsed.get('page:number')).to.deep.equal({
      field: 'number',
      value: PageParser.DEFAULTS.number,
    });

    expect(parsed.get('page:offset')).to.deep.equal({
      field: 'offset',
      value: 0,
    });
  });

  it('throws `ValidationError` if invalid', () => {
    const parser = new PageParser('page', 'invalid', new Schema());

    expect(() => parser.parse()).toThrow(
      new ValidationError('page must be one of [number, object]')
    );
  });
});
