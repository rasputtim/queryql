import NotImplementedError from '../../errors/not_implemented.mjs';
import ValidationError from '../../errors/validation.mjs';

export class BaseValidator {
  constructor(defineSchema) {
    this.schema = defineSchema(...this.defineSchemaArgs);
  }

  validate(/* values */) {
    throw new NotImplementedError();
  }

  get defineSchemaArgs() {
    return [];
  }

  buildError(message) {
    return new ValidationError(message);
  }
}

