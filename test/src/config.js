import { Config }  from '../../src/config.mjs';
import chai from 'chai';
var expect = chai.expect;

describe('constructor', () => {
  it('accepts an object of values to set', () => {
    const values = { test: 123 };

    expect(new Config(values).get()).to.have.any.keys(values);
  });
});

describe('DEFAULTS', () => {
  it('returns `KnexAdapter` as the default adapter', () => {
    expect(Config.DEFAULTS.adapter.name).to.equal('KnexAdapter')
  });

  it('returns `JoiValidator` as the default validator', () => {
    expect(Config.DEFAULTS.validator.name).to.equal('JoiValidator')
  });
});

describe('defaults', () => {
  afterEach(() => {
    Config._defaults = Config.DEFAULTS;
  });

  describe('set', () => {
    it('accepts an object with new values', () => {
      const defaults = { test: 456 };

      Config.defaults = defaults;

      expect(Config.defaults).to.have.any.keys(defaults)
    });

    it('merges the new values with existing values', () => {
      const existingValues = Config.defaults;
      const newValues = { test: 789 };

      Config.defaults = newValues;

      expect(Config.defaults).to.deep.equal({
        ...existingValues,
        ...newValues
      });
    });
  });

  describe('get', () => {
    it('returns an object of all values', () => {
      expect(Config.defaults).to.deep.equal(Config.DEFAULTS);
    });
  });
});

describe('set', () => {
  it('accepts an object with new values', () => {
    const config = new Config({});
    const values = { test: 'testing' };

    config.set(values);

    expect(config.get()).to.have.any.keys(values);
  });

  it('merges the new values with default values', () => {
    const config = new Config({});

    config.set({ test: 'testing' });

    expect(config.get()).to.have.any.keys(Config.defaults);
  });

  it('merges the new values with existing values', () => {
    const config = new Config({});

    config.set({ before: 123 });

    const existingValues = config.get();
    const newValues = { after: 456 };

    config.set(newValues);

    expect(config.get()).to.deep.equal({
      ...existingValues,
      ...newValues
    });
  });
});

describe('get', () => {
  it('returns an object of all values when no key argument is passed', () => {
    expect(new Config({}).get()).to.deep.equal(Config.DEFAULTS);
  });

  it('returns a specific value when a key argument is passed', () => {
    expect(new Config({}).get('adapter')).to.equal(Config.DEFAULTS.adapter);
  });
});
