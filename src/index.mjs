import adapters  from './adapters/index.mjs';
import { Config }  from './config.mjs';
import errors  from './errors/index.mjs';
import { NotImplementedError}   from './errors/not_implemented.mjs';
import { Schema }   from './schema.mjs';
import { Sorter }  from './orchestrators/sorter.mjs';
import { Filterer }  from './orchestrators/filterer.mjs';
import { Pager }  from './orchestrators/pager.mjs';
import validators  from './validators/querier/index.mjs';

/**
 * 
 * @param query the query string
 * @param builder the knex database connector with table
 * @param config the config options
 */
export class QueryQL {
  constructor(query, builder, config = {}) {
    this.query = query;
    this.builder = builder;
    
    this.config = new Config(config);
    //the database adapter
    //defaults to knex adapter
    this.adapter = new (this.config.get('adapter'))();
    /**
     * holder of configuration for the query strings for filtering and sorting.
     * there is no map for cofiguring page query string parameters by default
     * * the configuratios are <key,value> pairs in the format <'field[operator]', options >
     */
    this.schema = new Schema();
    this.defineSchema(this.schema);

    this.filterer = new Filterer(this);
    this.sorter = new Sorter(this);
    this.pager = new Pager(this);

    //defaults to Joi validator
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
  /**
   * Run only what is enabled 
   * if I do not what pagination does not run it
   */
  run() {
    //this.validate();

    if ( this.filterer.isEnabled) {
      if ( this.filterer.validate()){
        this.filterer.run();
      }
    }
    if(this.sorter.isEnabled) {
      if ( this.sorter.validate()) this.sorter.run();
    }
    if (this.pager.isEnabled) {
      const willPage = this.pager.validate();
      if (willPage) this.pager.run();
    }
    //run the knex command in the builder
    
    return this.builder;
  }
}

export default {

  adapters: adapters,
  Config: Config,
  errors:errors,
  validators:validators
};