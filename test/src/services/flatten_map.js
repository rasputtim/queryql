import { flattenMap } from '../../../src/services/flatten_map.mjs';

import chai from 'chai';
var expect = chai.expect;

it('uses the map key/value as the object key/value by default', () => {
  const map = new Map([
    ['test', 123],
    ['testing', 456],
  ]);

  expect(flattenMap({ map })).to.deep.equal({
    test: 123,
    testing: 456,
  });
});

it('optionally calls a `key` function to build the key', () => {
  const map = new Map([['test', 123]])
  const key = (key, value) => `${key}:${value}`;

  expect(flattenMap({ map, key })).to.deep.equal({
    'test:123': 123,
  });
});

it('optionally calls a `value` function to build the value', () => {
  const map = new Map([['test', 123]])
  const value = (value, key) => `${value}:${key}`;

  expect(flattenMap({ map, value })).to.deep.equal({
    test: '123:test',
  });
});

it('returns an empty object if the map is empty', () => {
  const map = new Map()

  expect(flattenMap({ map })).to.deep.equal({});
});
