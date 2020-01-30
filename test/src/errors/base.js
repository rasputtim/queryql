import { BaseError } from '../../../src/errors/base.mjs';

import chai from 'chai';
var expect = chai.expect;


it('extends Error', () => {
  expect(new BaseError('test')).toBeInstanceOf(Error);
});

describe('constructor', () => {
  it('accepts a message to set', () => {
    expect(new BaseError('test').message).to.equal('test');
  });

  it('captures the stack trace', () => {
    expect(new BaseError('test').stack).toMatch('BaseError');
  });

  it('sets the `name` property to the class name', () => {
    expect(new BaseError('test').name).to.equal('BaseError');
  });
});
