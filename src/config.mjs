import { JoiValidator } from './validators/querier/joi.mjs';
import  { KnexAdapter } from './adapters/knex.mjs';

export class Config {
  constructor(config) {
    this.set(config);
  }

  static get DEFAULTS() {
    return {
      adapter: KnexAdapter,
      validator: JoiValidator,
      /**
       * hapi process query string not the same as express
       * to use hapi request.query we need to parse the query-string using the module 'qs'
       * because queryQl was designed to use express the query string parsed by express
       */
      queryType: 'express'
    };
  }

    static set defaults(defaults) {
    this._defaults = {
      ...this._defaults,
      ...defaults,
    };
  }

  static get defaults() {
    return this._defaults;
  }

  set(config) {
    this._config = {
      ...this.constructor.defaults,
      ...this._config,
      ...config
    };
  }

  get(key = null) {
    if (key) {
      return this._config[key];
    } else {
      return this._config;
    }
  }
}

Config.defaults = Config.DEFAULTS;


