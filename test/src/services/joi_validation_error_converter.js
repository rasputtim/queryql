import Joi from '@hapi/joi';

import chai from 'chai';
var expect = chai.expect;

import {  joiValidationErrorConverter } from '../../../src/services/joi_validation_error_converter.mjs';
import { ValidationError } from '../../../src/errors/validation.mjs';

it('prepends optional path prefix to path if path exists', () => {
  const { error } = Joi.object()
    .keys({
      invalid: Joi.number(),
    })
    .validate({ invalid: 'invalid' });

  expect(joiValidationErrorConverter(error, 'test')).to.deep.equal(
    new ValidationError('test:invalid must be a number')
  );
});

it('uses optional path prefix as path if no path exists', () => {
  const { error } = Joi.number().validate({ invalid: 'invalid' });

  expect(joiValidationErrorConverter(error, 'test')).to.deep.equal(
    new ValidationError('test must be a number')
  );
});

it('delineates path segments with []', () => {
  const { error } = Joi.object()
    .keys({
      invalid: Joi.object().keys({
        not_valid: Joi.number(),
      }),
    })
    .validate({ invalid: { not_valid: 'invalid' } })

  expect(joiValidationErrorConverter(error)).to.deep.equal(
    new ValidationError('invalid[not_valid] must be a number')
  );
});
