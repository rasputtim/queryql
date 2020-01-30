import { NotImplementedError } from '../errors/not_implemented.mjs';
import { ParserValidator } from '../validators/parser.mjs';

export class BaseParser {
  constructor(querier,queryKey, query, schema, defaults = {}) {
    this.queryKey = queryKey;
    this.query = query;
    this.schema = schema;
    this.defaults = defaults;
    this.querier = querier;
    this.validator = new ParserValidator(
      this.defineValidation.bind(this),
      queryKey,
      query
    );
    this._validate = null;
  }

  buildKey(/* parsed */) {
    throw new NotImplementedError();
  }
  haveFunction(/* parsed */) {
    throw new NotImplementedError();
  }
  
  flatten(/* map */) {
    throw new NotImplementedError();
  }

  parse() {
    throw new NotImplementedError();
  }

  defineValidation(/* schema */) {
    return undefined;
  }

  static get DEFAULTS() {
    return {};
  }

  set defaults(defaults) {
    this._defaults = {
      ...this.constructor.DEFAULTS,
      ...defaults,
    };
  }

  get defaults() {
    return this._defaults;
  }

  validate() {
    if (!this._validate) {
      this._validate = this.validator.validate();
    }

    return this._validate;
  }
}

