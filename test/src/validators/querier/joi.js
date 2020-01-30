import Joi from '@hapi/joi';

import { JoiValidator } from '../../../../src/validators/querier/joi.mjs';
import { ValidationError } from '../../../../src/errors/validation.mjs';

import chai from 'chai';
var expect = chai.expect;

describe('constructor', () => {
  it('accepts/calls `defineSchema(Joi)` and sets the returned value', () => {
    const defineSchema = jest.fn(schema => ({
      'filter:test[=]': schema.number(),
    }));
    const validator = new JoiValidator(defineSchema);

    expect(defineSchema).toHaveBeenCalledWith(Joi);
    expect(Joi.isSchema(validator.schema)).to.equal(true);
  });
});

describe('defineSchemaArgs', () => {
  it('returns `Joi` argument to call `defineSchema` with', () => {
    const validator = new JoiValidator(() => {});

    expect(validator.defineSchemaArgs).to.deep.equal([Joi]);
  })
})

describe('buildError', () => {
  it('returns a `ValidationError`', () => {
    const validator = new JoiValidator(() => {});
    const { error } = Joi.object()
      .keys({
        invalid: Joi.number(),
      })
      .validate({ invalid: 'invalid' });

    expect(validator.buildError(error)).to.deep.equal(
      new ValidationError('invalid must be a number')
    );
  });
});

describe('validate', () => {
  it('returns `true` if no schema is defined', () => {
    const validator = new JoiValidator(() => {});

    expect(validator.schema).to.be.undefined;
    expect(validator.validate({ 'filter:test[=]': 123 })).to.equal(true);
  });

  it('returns `true` if valid', () => {
    const validator = new JoiValidator(schema => ({
      'filter:test[=]': schema.number(),
    }));

    expect(validator.validate({ 'filter:test[=]': 123 })).to.equal(true);
  });

  it('throws `ValidationError` if invalid', () => {
    const validator = new JoiValidator(schema => ({
      'filter:test[=]': schema.number(),
    }));

    expect(() => validator.validate({ 'filter:test[=]': 'invalid' })).toThrow(
      new ValidationError('filter:test[=] must be a number')
    );
  });
});
