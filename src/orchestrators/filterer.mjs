import { BaseOrchestrator } from './base.mjs';
import { FilterParser } from '../parsers/filter.mjs';

export class Filterer extends BaseOrchestrator {
  get queryKey() {
    return 'filter';
  }

  get schema() {
    return this.querier.schema.filters;
  }

  get isEnabled() {
    return this.schema.size >= 1;
  }

  buildParser() {
    return new FilterParser(
      this.queryKey,
      this.query || this.querier.defaultFilter,
      this.querier.schema,
      {
        operator: this.querier.adapter.constructor.DEFAULT_FILTER_OPERATOR,
        ...this.querier.filterDefaults,
      }
    )
  }

  validate() {
    if (!this.isEnabled) {
      return true;
    }

    if (!this._validate) {
      this._validate =
        this.parser.validate() &&
        this.querier.adapter.validator.validateFilters(this.parse()) &&
        this.querier.validator.validate(this.parser.flatten(this.parse()))
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
      filter = filters.get(key);

      if (filter) {
        this.apply(filter, key);
      }
    }

    return this.querier;
  }
}


