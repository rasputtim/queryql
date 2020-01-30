import { BaseOrchestrator } from './base.mjs';
import { FilterParser } from '../parsers/filter.mjs';

export class Filterer extends BaseOrchestrator {
  get queryKey() {
    return 'filter';
  }

  /**
   * return the map with all configured filters required in the query string parameter
   */
  get schema() {
    return this.querier.schema.filters;
  }
  /**
   * if there are any configuration in the map of filters return true
   * otherwise return false
   */
  get isEnabled() {
    return this.schema.size >= 1;
  }
  
  /**
   * this method is called when the object is created, by the constructor of the 
   * BaseOrchestrator class
   */
  buildParser() {
    // params: 
    //queryKey= 'filter' , 
    //query = will get query query from the base class and return if there are a query param caled 'filter'
    //        otherwise return the default filter defind in the user created schema, 
    //schema
    //defaults = {}
    let myQueryKey = this.queryKey;
    //para tipo [in] formato: {'created_by': {} }
    //para operador '=' : formato {'is_public': 'true' }
    let myQueryString = this.query || this.querier.defaultFilter;//{'created_by': {} };//
    let mySchema = this.querier.schema;
    let myOperator = this.querier.adapter.constructor.DEFAULT_FILTER_OPERATOR;
    let myFilterDefaults = this.querier.filterDefaults;
    return new FilterParser(
      this.querier,
      myQueryKey,
      myQueryString,
      mySchema,
      {
        operator: myOperator,
        ...myFilterDefaults,
      }

    );
  }

  /**
   * if it is not enabled, return true without validating the filters
   */
  validate() {
    if (!this.isEnabled) {
      return true;
    }

    

    return this._validate;
  }

  run() {
    this.validate();

    const filters = this.parse();

    if (!filters) {
      return this.querier;
    }

    let key;
    let filter;

    for (const filterSchema of this.schema.values()) {
      key = this.parser.buildKey(filterSchema);
      let is_function = this.parser.haveFunction(filterSchema);

      filter = filters.get(key);

      if (filter) {
        if(is_function != null) {
          this.apply(filter, is_function);
        }else {
          this.apply(filter, key);
        }
      }
    }

    return this.querier;
  }
}


