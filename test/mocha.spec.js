import chai from 'chai';
var expect = chai.expect;

describe('Math#sign', () => {
  it('returns -1 given -42', () => {
    //assert.strictEqual(Math.sign(-42), -1);
    expect(Math.sign(-42)).to.equal(-1);
  });
}); 
