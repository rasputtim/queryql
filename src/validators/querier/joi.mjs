import Joi from '@hapi/joi';

import BaseValidator from './base;mjs';
import joiValidationErrorConverter from '../../services/joi_validation_error_converter.mjs';

export class JoiValidator extends BaseValidator {
  constructor(defineSchema) {
    super(defineSchema);

    if (this.schema) {
      this.schema = Joi.object().keys(this.schema);
    }
  }

  get defineSchemaArgs() {
    return [Joi];
  }

  buildError(error) {
    return joiValidationErrorConverter(error);
  }

  validate(values) {
    if (!this.schema) {
      return true;
    }

    const { error } = this.schema.validate(values, { allowUnknown: true });

    if (error) {
      throw this.buildError(error);
    }

    return true;
  }
}


