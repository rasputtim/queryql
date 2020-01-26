import is from 'is';

/**
* holder of configuration for the query strings for filtering and sorting.
* there is no map for cofiguring page query string parameters by default
* the configuratios are <key,value> pairs in the format <'field[operator]', options > 
*/
export class Schema {
  constructor() {
    /**The Map object holds key-value pairs and remembers the original insertion order of the keys. 
    A Map object iterates its elements in insertion order:
    a for...of loop returns an array of [key, value] for each iteration.
    */
    this.filters = new Map();
    this.sorts = new Map();
    //disable paging by default. how to enable paging?
    this.page(false);
  }

  /**
   * Create a entry to the filters map  mapping the query string in the format field[operator] to the options
   * @param field the name of the query param, will create a key with operator in the format 'field[operator]'
   * @param operator the operator of the query param, will create a key in the format: 'field[operator]'
   * @param options the value for the created map entry: [field[operator],options]
   */
  filter(field, operator, options = {}) {
    //Map.prototype.set(key, value)
    //Sets the value for the key in the Map object. Returns the Map object.
    this.filters.set(`${field}[${operator}]`, {
      field,
      operator,
      options,
    });

    return this;
  }

  /**
   * Creates a entry to the sort map with pair keys <field> to values <options>
   * @param field the kay of the created map
   * @param options the value of the created entry
   */
  sort(field, options = {}) {
    this.sorts.set(field, {
      field,
      options,
    });

    return this;
  }

  /**
   * internal class to control paging
   * @param isEnabledOrOptions if it is boolean value set isEnabled to true or false
   *                           if it is an object. enable paging with the passed options
   */
  page(isEnabledOrOptions = true) {
    if (is.bool(isEnabledOrOptions)) {
      this.pageOptions = { isEnabled: isEnabledOrOptions };
    } else {
      this.pageOptions = {
        ...isEnabledOrOptions,
        isEnabled:
          isEnabledOrOptions.isEnabled !== undefined
            ? isEnabledOrOptions.isEnabled
            : true,
      };
    }

    return this;
  }

  mapFilterFieldsToOperators() {
    const filters = Array.from(this.filters.values());

    return filters.reduce((accumulator, filter) => {
      if (!accumulator[filter.field]) {
        accumulator[filter.field] = [];
      }

      accumulator[filter.field].push(filter.operator);

      return accumulator;
    }, {});
  }
}


