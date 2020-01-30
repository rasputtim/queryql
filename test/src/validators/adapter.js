import { Joi } from '@hapi/joi';

import { AdapterValidator } from '../../../src/validators/adapter.mjs';
import { FilterParser  } from '../../../src/parsers/filter.mjs';
import { PageParser } from '../../../src/parsers/page.mjs';
import  { Schema }  from '../../../src/schema.mjs';
import  { SortParser } from '../../../src/parsers/sort.mjs';
import { ValidationError } from '../../../src/errors/validation.mjs';

import chai from 'chai';
var expect = chai.expect;


describe('constructor', () => {
  it('accepts/calls `defineSchema` and sets the returned value', () => {
    const schema = { 'filter:=': Joi.string() };
    const defineSchema = jest.fn(() => schema);

    const validator = new AdapterValidator(defineSchema);

    expect(defineSchema).toHaveBeenCalledWith(Joi);
    expect(validator.schema).to.deep.equal(schema);
  })
})

describe('buildError', () => {
  it('returns a `ValidationError`', () => {
    const validator = new AdapterValidator(() => {});
    const { error } = Joi.object()
      .keys({
        invalid: Joi.number(),
      })
      .validate({ invalid: 'invalid' })

    expect(validator.buildError(error)).to.deep.equal(
      new ValidationError('invalid must be a number')
    );
  });
});

describe('validateValue', () => {
  it('returns `true` if no schema is defined', () => {
    const validator = new AdapterValidator(() => {});

    expect(validator.schema).to.be.undefined;
    expect(validator.validateValue('filter:=', 'filter:test[=]', 123)).to.equal(
      true
    );
  });

  it('returns `true` if no schema key is defined', () => {
    const validator = new AdapterValidator(schema => ({
      'filter:=': schema.number(),
    }));

    expect(validator.schema['filter:!=']).to.be.undefined;
    expect(validator.validateValue('filter:!=', 'filter:test[!=]', 123)).to.equal(
      true
    );
  });

  it('returns `true` if valid', () => {
    const validator = new AdapterValidator(schema => ({
      'filter:=': schema.number(),
    }));

    expect(validator.validateValue('filter:=', 'filter:test[=]', 123)).to.equal(
      true
    );
  });

  it('throws `ValidationError` if invalid', () => {
    const validator = new AdapterValidator(schema => ({
      'filter:=': schema.number(),
    }));

    expect(() =>
      validator.validateValue('filter:=', 'filter:test[=]', 'invalid')
    ).toThrow(new ValidationError('filter:test[=] must be a number'));
  });
});

describe('validateFilters', () => {
  it('returns `true` if no schema is defined', () => {
    const parser = new FilterParser(
      'filter',
      { test: { '=': 123 } },
      new Schema().filter('test', '=')
    );
    const validator = new AdapterValidator(() => {});

    expect(validator.schema).to.be.undefined;
    expect(validator.validateFilters(parser.parse())).to.equal(true);
  });

  it('returns `true` if all filters are valid', () => {
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
    const validator = new AdapterValidator(schema => ({
      'filter:=': schema.number(),
      'filter:!=': schema.number(),
    }));

    expect(validator.validateFilters(parser.parse())).to.equal(true);
  });

  it('throws `ValidationError` if a filter is invalid', () => {
    const parser = new FilterParser(
      'filter',
      { test: { '=': 'invalid' } },
      new Schema().filter('test', '=')
    );
    const validator = new AdapterValidator(schema => ({
      'filter:=': schema.number(),
    }));

    expect(() => validator.validateFilters(parser.parse())).toThrow(
      new ValidationError('filter:test[=] must be a number')
    );
  });
});

describe('validateSorts', () => {
  it('returns `true` if no schema is defined', () => {
    const parser = new SortParser('sort', 'test', new Schema().sort('test'));
    const validator = new AdapterValidator(() => {});

    expect(validator.schema).to.be.undefined;
    expect(validator.validateSorts(parser.parse())).to.equal(true);
  });

  it('returns `true` if no schema key is defined', () => {
    const parser = new SortParser('sort', 'test', new Schema().sort('test'));
    const validator = new AdapterValidator(schema => ({
      'filter:=': schema.number(),
    }));

    expect(validator.schema['sort']).to.be.undefined;
    expect(validator.validateSorts(parser.parse())).to.equal(true);
  });

  it('returns `true` if all sorts are valid', () => {
    const parser = new SortParser(
      'sort',
      ['test1', 'test2'],
      new Schema().sort('test1').sort('test2')
    );
    const validator = new AdapterValidator(schema => ({
      sort: schema.string().valid('asc'),
    }));

    expect(validator.validateSorts(parser.parse())).to.equal(true);
  });

  it('throws `ValidationError` if a sort is invalid', () => {
    const parser = new SortParser('sort', 'test', new Schema().sort('test'));
    const validator = new AdapterValidator(schema => ({
      sort: schema.string().invalid('asc'),
    }));

    expect(() => validator.validateSorts(parser.parse())).toThrow(
      new ValidationError('sort:test contains an invalid value')
    );
  });
});

describe('validatePage', () => {
  it('returns `true` if no schema is defined', () => {
    const parser = new PageParser('page', '2', new Schema());
    const validator = new AdapterValidator(() => {});

    expect(validator.schema).to.be.undefined;
    expect(validator.validatePage(parser.parse())).to.equal(true);
  });

  it('returns `true` if page is valid', () => {
    const parser = new PageParser('page', '2', new Schema());
    const validator = new AdapterValidator(schema => ({
      'page:size': schema.number().valid(20),
      'page:number': schema.number().valid(2),
    }));

    expect(validator.validatePage(parser.parse())).to.equal(true);
  });

  it('throws `ValidationError` if page is invalid', () => {
    const parser = new PageParser('page', '2', new Schema());
    const validator = new AdapterValidator(schema => ({
      'page:number': schema.number().invalid(2),
    }));

    expect(() => validator.validatePage(parser.parse())).toThrow(
      new ValidationError('page:number contains an invalid value')
    );
  });
});
