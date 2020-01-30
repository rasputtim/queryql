import is from 'is';

import { BaseParser } from './base.mjs';
import flattenMap from '../services/flatten_map.mjs';

export class FilterParser extends BaseParser {
  static get DEFAULTS() {
    return {
      field: null,
      operator: null,
      value: null,
    };
  }

  buildKey({ field, operator }) {
    let myKey = `${this.queryKey}:${field}[${operator}]`;
    return myKey;
  }

  /**
   * this method indicates that the querier class have a method to handle this query and will override the where clause
   * @param param0 { fileld , operator }
   * will return the methos it it exists
   * otherwise will return null
   */
  haveFunction({ field, operator }) {
    let myKey = `${this.queryKey}:${field}[${operator}]`;
    let is_function =  is.fn(this.querier[field]);
   
    if(is_function) {
      return  this.querier[field];
                            
    }else {
      return null;
    }
  }

  defineValidation(schema) {
    const defaultOperator = this.defaults.operator;
    const mapFieldsToOperators = Object.entries(
      this.schema.mapFilterFieldsToOperators()
    );

    const values = [
      schema.array(),
      schema.boolean(),
      schema.number(),
      schema.string(),
    ];

    return schema.object().keys(
      mapFieldsToOperators.reduce((accumulator, [field, operators]) => {
        const operatorObject = schema
          .object()
          .pattern(schema.string().valid(...operators), values);

        return {
          ...accumulator,
          [field]: operators.includes(defaultOperator)
            ? [...values, operatorObject]
            : operatorObject,
        };
      }, {})
    );
  }

  flatten(map) {
    return flattenMap({
      map,
      value: value => value.value,
    });
  }

  parseObject(field, value) {
    return Object.keys(value).map(operator => ({
      ...this.defaults,
      field,
      operator,
      value: value[operator],
    }));
  }

  parseNonObject(field, value) {
    return {
      ...this.defaults,
      field,
      value,
    };
  }

  parse() {
    if (!this.query) {
      return new Map();
    }

    /**
     * if the _validate is null, will call validator.validate() and assing it to _validate
     */
    this.validate();

    const entries = Object.entries(this.query);
    const filters = [];

    for (const [field, value] of entries) {
      if (is.object(value)) {
        filters.push(...this.parseObject(field, value));
      } else {
        filters.push(this.parseNonObject(field, value));
      }
    }

    return new Map(filters.map(filter => [this.buildKey(filter), filter]));
  }
}


