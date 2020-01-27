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

    this._parse = null;

    /** buildParser create a FilterParser/PageParser/SortParser 
     * object depending on who has called the constructor 
     * */
    this.parser = this.buildParser();


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


/**
 * verify if the query string of the request have the param needed 'filter' or 'page' or 'sort'
 */
  get query() {

    let querystring = this.querier.query[this.queryKey];
    return querystring;
  }
  
  // unico lugar onde _parse eh setado 
  parse() {
    if (!this.isEnabled) {
      if (this.query) {
        throw new ValidationError(`${this.queryKey} is disabled`);
      }

      return null;
    }

    if (!this._parse) {
      //this.parser is created in the constructor with the function build parser of the caller object
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
    let is_function =  is.fn(this.querier[querierMethod]);
    this.querier.builder =
      (querierMethod && is_function)
        ? this.querier[querierMethod](...args)
        : this.querier.adapter[this.queryKey](...args);

    return this.querier.builder;
  }
}


