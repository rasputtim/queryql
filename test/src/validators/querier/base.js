import { BaseValidator } from '../../../../src/validators/querier/base.mjs';
import { NotImplementedError } from '../../../../src/errors/not_implemented.mjs';
import { ValidationError } from '../../../../src/errors/validation.mjs';


import chai from 'chai';
var expect = chai.expect;

describe('constructor', () => {
  it('accepts/calls `defineSchema` and sets the returned value', () => {
    const defineSchema = jest.fn(() => 'test');
    const validator = new BaseValidator(defineSchema);

    expect(defineSchema).toHaveBeenCalled();
    expect(validator.schema).to.equal('test');
  });
});

describe('validate', () => {
  it('throws `NotImplementedError` when not extended', () => {
    const validator = new BaseValidator(() => {});

    expect(() => validator.validate()).throws(NotImplementedError);
  });
});

describe('defineSchemaArgs', () => {
  it('returns no arguments to call `defineSchema` with', () => {
    const validator = new BaseValidator(() => {});

    expect(validator.defineSchemaArgs).to.deep.equal([]);
  });
});

describe('buildError', () => {
  it('returns a `ValidationError` with the specified message', () => {
    const validator = new BaseValidator(() => {});

    expect(validator.buildError('test')).to.deep.equal(new ValidationError('test'));
  });
});
