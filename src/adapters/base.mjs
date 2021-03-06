import is from 'is';

import { AdapterValidator } from '../validators/adapter.mjs';
import { NotImplementedError } from '../errors/not_implemented.mjs';

export class BaseAdapter {
  constructor(querier) {
    this.validator = new AdapterValidator(this.defineValidation.bind(this));
    this.querier = querier;
  }

  static get FILTER_OPERATORS() {
    throw new NotImplementedError();
  }

  static get DEFAULT_FILTER_OPERATOR() {
    throw new NotImplementedError();
  }

  'filter:*'(/* builder, { field, operator, value } */) {
    throw new NotImplementedError();
  }

  sort(/* builder, { field, order } */) {
    throw new NotImplementedError();
  }

  page(/* builder, { size, number, offset } */) {
    throw new NotImplementedError();
  }

  defineValidation(/* schema */) {
    return undefined;
  }

  filter(builder, filter,myFunction = null) {
    const { operator } = filter;

    if (!this.constructor.FILTER_OPERATORS.includes(operator)) {
      throw new NotImplementedError();
    }

    const operatorMethod = `filter:${operator}`;

    if (is.fn(this[operatorMethod])) {
      return this[operatorMethod](builder, filter);
    }

    return this['filter:*'](builder, filter, myFunction);
  }
  
}


