import adapters  from './adapters/index.mjs';
import { Config }  from './config.mjs';
import errors  from './errors/index.mjs';
import { Filterer }  from './orchestrators/filterer.mjs';
import { NotImplementedError}   from './errors/not_implemented.mjs';
import { Pager }  from './orchestrators/pager.mjs';
import { Schema }   from './schema.mjs';
import { Sorter }  from './orchestrators/sorter.mjs';
import validators  from './validators/querier/index.mjs';

export class QueryQL {
  constructor(query, builder, config = {}) {
    this.query = query;
    this.builder = builder;

    this.config = new Config(config);

    this.adapter = new (this.config.get('adapter'))();

    this.schema = new Schema();
    this.defineSchema(this.schema);

    this.filterer = new Filterer(this);
    this.sorter = new Sorter(this);
    this.pager = new Pager(this);

    this.validator = new (this.config.get('validator'))(
      this.defineValidation.bind(this)
    );
  }

  defineSchema(/* schema */) {
    throw new NotImplementedError();
  }

  defineValidation(/* ...args */) {
    return undefined;
  }

  get defaultFilter() {
    return undefined;
  }

  get defaultSort() {
    return undefined;
  }

  get defaultPage() {
    return undefined;
  }

  get filterDefaults() {
    return undefined;
  }

  get sortDefaults() {
    return undefined;
  }

  get pageDefaults() {
    return undefined;
  }

  validate() {
    return (
      this.filterer.validate() &&
      this.sorter.validate() &&
      this.pager.validate()
    );
  }

  run() {
    //this.validate();

    if ( this.filterer.validate()) this.filterer.run();
    if ( this.sorter.validate()) this.sorter.run();
    const willPage = this.pager.validate();
    if (willPage) this.pager.run();

    return this.builder;
  }
}

export default {

  adapters: adapters,
  Config: Config,
  errors:errors,
  validators:validators
};