import { BaseOrchestrator } from './base.mjs';
import { PageParser } from '../parsers/page.mjs';

export class Pager extends BaseOrchestrator {
  get queryKey() {
    return 'page';
  }

  get schema() {
    return this.querier.schema.pageOptions;
  }

  get isEnabled() {
    return this.schema.isEnabled;
  }

  buildParser() {
    return new PageParser(
      this.queryKey,
      this.query || this.querier.defaultPage,
      this.querier.schema,
      this.querier.pageDefaults
    );
  }

  validate() {
    //this is a tempórary hack. fix it
    return false;
    if (!this.isEnabled) {
      return true;
    }

    if (!this._validate) {
      this._validate =
        this.parser.validate() &&
        this.querier.adapter.validator.validatePage(this.parse()) &&
        this.querier.validator.validate(this.parser.flatten(this.parse()))
    }

    return this._validate;
  }

  run() {
    this.validate();

    const page = this.parse();

    if (page) {
      this.apply(this.parser.flatten(this.parse(), false));
    }

    return this.querier;
  }
}


