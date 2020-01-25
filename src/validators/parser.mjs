import Joi from '@hapi/joi';

import joiValidationErrorConverter from '../services/joi_validation_error_converter';

export class ParserValidator {
  constructor(defineSchema, queryKey, query) {
    this.schema = defineSchema(Joi);
    this.queryKey = queryKey;
    this.query = query;
  }

  buildError(error) {
    return joiValidationErrorConverter(error, this.queryKey);
  }

  validate() {
    if (!this.schema) {
      return true;
    }

    const { error } = this.schema.validate(this.query);

    if (error) {
      throw this.buildError(error);
    }

    return true;
  }
}


