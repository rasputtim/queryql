import { BaseAdapter } from '../../../src/adapters/base.mjs';
import { NotImplementedError }from '../../../src/errors/not_implemented.mjs';


import chai from 'chai';
var expect = chai.expect;


describe('constructor', () => {
  it('creates an instance of the validator, calls `defineValidation`', () => {
    const defineValidation = jest.spyOn(
      BaseAdapter.prototype,
      'defineValidation'
    );

    expect(new BaseAdapter().validator.constructor.name).to.equal(
      'AdapterValidator'
    );
    expect(defineValidation).toHaveBeenCalled()

    defineValidation.mockRestore()
  });
});

describe('FILTER_OPERATORS', () => {
  it('throws `NotImplementedError` when not extended', () => {
    expect(() => BaseAdapter.FILTER_OPERATORS).throws(NotImplementedError);
  });
});

describe('DEFAULT_FILTER_OPERATOR', () => {
  it('throws `NotImplementedError` when not extended', () => {
    expect(() => BaseAdapter.DEFAULT_FILTER_OPERATOR).toThrow(
      NotImplementedError
    );
  });
});

describe('filter:*', () => {
  it('throws `NotImplementedError` when not extended', () => {
    expect(() => new BaseAdapter()['filter:*']()).throws(NotImplementedError);
  });
});

describe('sort', () => {
  it('throws `NotImplementedError` when not extended', () => {
    expect(() => new BaseAdapter().sort()).throws(NotImplementedError);
  });
});

describe('page', () => {
  it('throws `NotImplementedError` when not extended', () => {
    expect(() => new BaseAdapter().page()).throws(NotImplementedError);
  });
});

describe('defineValidation', () => {
  it('is not defined by default', () => {
    expect(new BaseAdapter().defineValidation()).to.be.undefined;
  });
});

describe('filter', () => {
  it('calls/returns `filter:{operator}` if defined', () => {
    const adapter = new BaseAdapter();
    const builder = 'builder';
    const filter = { operator: '=' };

    const FILTER_OPERATORS = jest
      .spyOn(BaseAdapter, 'FILTER_OPERATORS', 'get')
      .mockReturnValue(['=']);

    adapter['filter:='] = jest.fn(() => 'test');

    adapter.filter(builder, filter);

    expect(adapter['filter:=']).toHaveBeenCalledWith(builder, filter);
    expect(adapter['filter:=']).toHaveReturnedWith('test');

    FILTER_OPERATORS.mockRestore();
  });

  it('calls/returns `filter:*` if operator method is not defined', () => {
    const adapter = new BaseAdapter();
    const builder = 'builder';
    const filter = { operator: '=' };

    const FILTER_OPERATORS = jest
      .spyOn(BaseAdapter, 'FILTER_OPERATORS', 'get')
      .mockReturnValue(['=']);

    adapter['filter:*'] = jest.fn(() => 'test');

    adapter.filter(builder, filter);

    expect(adapter['filter:*']).toHaveBeenCalledWith(builder, filter);
    expect(adapter['filter:*']).toHaveReturnedWith('test');

    FILTER_OPERATORS.mockRestore();
  })

  it('throws `NotImplementedError` if operator is not supported', () => {
    const FILTER_OPERATORS = jest
      .spyOn(BaseAdapter, 'FILTER_OPERATORS', 'get')
      .mockReturnValue(['=']);

    expect(() =>
      new BaseAdapter().filter('builder', { operator: 'invalid' })
    ).throws(NotImplementedError);

    FILTER_OPERATORS.mockRestore();
  });
});
