import { Joi } from  '@hapi/joi';

import { ParserValidator  } from '../../../src/validators/parser.mjs';
import { ValidationError } from '../../../src/errors/validation.mjs';

import chai from 'chai';
var expect = chai.expect;


describe('constructor', () => {
  it('accepts/calls `defineSchema` and sets the returned value', () => {
    const schema = Joi.number();
    const defineSchema = jest.fn(() => schema);
    const validator = new ParserValidator(defineSchema, 'test', 123);

    expect(defineSchema).toHaveBeenCalledWith(Joi);
    expect(validator.schema).to.equal(schema);
  });

  it('accepts a query key to set', () => {
    const queryKey = 'test';
    const validator = new ParserValidator(() => {}, queryKey, 123);

    expect(validator.queryKey).to.equal(queryKey);
  })

  it('accepts a query to set', () => {
    const query = 123
    const validator = new ParserValidator(() => {}, 'test', query);

    expect(validator.query).to.equal(query);
  })
})

describe('buildError', () => {
  it('returns a `ValidationError`', () => {
    const validator = new ParserValidator(() => {}, 'test', 'invalid');
    const { error } = Joi.object()
      .keys({
        invalid: Joi.number(),
      })
      .validate({ invalid: 'invalid' });

    expect(validator.buildError(error)).to.deep.equal(
      new ValidationError('test:invalid must be a number')
    );
  });
});

describe('validate', () => {
  it('returns `true` if no schema is defined', () => {
    const validator = new ParserValidator(() => {}, 'test', 123);

    expect(validator.schema).to.be.undefined;
    expect(validator.validate()).to.equal(true);
  })

  it('returns `true` if valid', () => {
    const validator = new ParserValidator(
      schema => schema.number(),
      'test',
      123
    );

    expect(validator.validate()).to.equal(true);
  });

  it('throws `ValidationError` if invalid', () => {
    const validator = new ParserValidator(
      schema => schema.number(),
      'test',
      'invalid'
    );

    expect(() => validator.validate()).throws(
       ValidationError , 'test must be a number'
    );
  });
});
