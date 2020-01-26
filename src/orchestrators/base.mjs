import is from 'is';

import { NotImplementedError } from '../errors/not_implemented.mjs';
import { ValidationError } from '../errors/validation.mjs';

export class BaseOrchestrator {
  /**
   * 
   * @param querier the QueryQL object
   */
  constructor(querier) {
    this.querier = querier;

    this.parser = this.buildParser();
    this._parse = null;

    this._validate = null;
  }

  get queryKey() {
    throw new NotImplementedError();
  }

  get schema() {
    throw new NotImplementedError();
  }

  get isEnabled() {
    throw new NotImplementedError();
  }

  buildParser() {
    throw new NotImplementedError();
  }

  validate() {
    throw new NotImplementedError();
  }

  run() {
    throw new NotImplementedError();
  }

  get query() {
    return this.querier.query[this.queryKey];
  }

  parse() {
    if (!this.isEnabled) {
      if (this.query) {
        throw new ValidationError(`${this.queryKey} is disabled`);
      }

      return null;
    }

    if (!this._parse) {
      this._parse = this.parser.parse();
    }

    return this._parse;
  }

  /**
   * changes the database commend to execute based on filters and queries
   * @param values 
   * @param querierMethod 
   */
  apply(values, querierMethod = null) {
    const args = [this.querier.builder, values];

    this.querier.builder =
      (querierMethod && is.fn(this.querier[querierMethod]))
        ? this.querier[querierMethod](...args)
        : this.querier.adapter[this.queryKey](...args);

    return this.querier.builder;
  }
}


