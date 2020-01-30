import Knex from 'knex'; const knex = new Knex({ client: 'pg' });

import {  KnexAdapter } from '../../../src/adapters/knex.mjs';
import { ValidationError } from '../../../src/errors/validation.mjs';

describe('filter', () => {
  it('supports the `=` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '=', value: 123 })
      .toString();

    expect(query).to.equal('select * from "test" where "test" = 123');
  });

  it('supports the `!=` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '!=', value: 123 })
      .toString();

    expect(query).to.equal('select * from "test" where "test" != 123')
  });

  it('supports the `<>` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '<>', value: 123 })
      .toString();

    expect(query).to.equal('select * from "test" where "test" <> 123')
  });

  it('supports the `>` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '>', value: 123 })
      .toString();

    expect(query).to.equal('select * from "test" where "test" > 123')
  });

  it('supports the `>=` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '>=', value: 123 })
      .toString();

    expect(query).to.equal('select * from "test" where "test" >= 123')
  });

  it('supports the `<` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '<', value: 123 })
      .toString();

    expect(query).to.equal('select * from "test" where "test" < 123')
  });

  it('supports the `<=` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: '<=', value: 123 })
      .toString();

    expect(query).to.equal('select * from "test" where "test" <= 123')
  });

  it('supports the `is` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: 'is', value: null })
      .toString();

    expect(query).to.equal('select * from "test" where "test" is null')
  });

  it('supports the `is not` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: 'is not', value: null })
      .toString();

    expect(query).to.equal('select * from "test" where "test" is not null')
  });

  it('supports the `in` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'in',
        value: [123, 456],
      })
      .toString();

    expect(query).to.equal('select * from "test" where "test" in (123, 456)')
  });

  it('supports the `not in` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'not in',
        value: [123, 456],
      })
      .toString();

    expect(query).to.equal('select * from "test" where "test" not in (123, 456)')
  });

  it('supports the `like` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), { field: 'test', operator: 'like', value: '%123%' })
      .toString();

    expect(query).to.equal('select * from "test" where "test" like \'%123%\'')
  });

  it('supports the `not like` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'not like',
        value: '%123%',
      })
      .toString();

    expect(query).to.equal('select * from "test" where "test" not like \'%123%\'')
  });

  it('supports the `ilike` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'ilike',
        value: '%123%',
      })
      .toString();

    expect(query).to.equal('select * from "test" where "test" ilike \'%123%\'')
  });

  it('supports the `not ilike` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'not ilike',
        value: '%123%',
      })
      .toString();

    expect(query).to.equal('select * from "test" where "test" not ilike \'%123%\'')
  });

  it('supports the `between` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'between',
        value: [123, 456],
      })
      .toString();

    expect(query).to.equal('select * from "test" where "test" between 123 and 456')
  });

  it('supports the `not between` operator', () => {
    const query = new KnexAdapter()
      .filter(knex('test'), {
        field: 'test',
        operator: 'not between',
        value: [123, 456],
      })
      .toString();

    expect(query).to.equal(
      'select * from "test" where "test" not between 123 and 456'
    );
  });
});

describe('sort', () => {
  it('adds an `order by` clause', () => {
    const query = new KnexAdapter()
      .sort(knex('test'), { field: 'test', order: 'desc' })
      .toString();

    expect(query).to.equal('select * from "test" order by "test" desc');
  });
});

describe('page', () => {
  it('adds a `limit` clause', () => {
    const query = new KnexAdapter()
      .page(knex('test'), { size: 10, offset: 20 })
      .toString();

    expect(query).to.equal('select * from "test" limit 10 offset 20')
  });
});

describe('validation', () => {
  describe('`filter:=`', () => {
    it('permits a boolean value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:=', 'test', true)).to.equal(true);
    });

    it('permits a number value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:=', 'test', 123)).to.equal(true)
    });

    it('permits a string value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:=', 'test', 'valid')).to.equal(true)
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() => validator.validateValue('filter:=', 'test', null)).toThrow(
        new ValidationError('test must be one of [boolean, number, string]')
      );
    });
  });

  describe('`filter:!=`', () => {
    it('permits a boolean value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:!=', 'test', true)).to.equal(true);
    });

    it('permits a number value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:!=', 'test', 123)).to.equal(true);
    });

    it('permits a string value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:!=', 'test', 'valid')).to.equal(true);
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() => validator.validateValue('filter:!=', 'test', null)).toThrow(
        new ValidationError('test must be one of [boolean, number, string]')
      );
    });
  });

  describe('`filter:<>`', () => {
    it('permits a boolean value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:<>', 'test', true)).to.equal(true);
    });

    it('permits a number value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:<>', 'test', 123)).to.equal(true);
    });

    it('permits a string value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:<>', 'test', 'valid')).to.equal(true);
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() => validator.validateValue('filter:<>', 'test', null)).toThrow(
        new ValidationError('test must be one of [boolean, number, string]')
      );
    });
  });

  describe('`filter:>`', () => {
    it('permits a number value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:>', 'test', 123)).to.equal(true)
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() =>
        validator.validateValue('filter:>', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be a number'));
    });
  });

  describe('`filter:>=`', () => {
    it('permits a number value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:>=', 'test', 123)).to.equal(true)
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() =>
        validator.validateValue('filter:>=', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be a number'));
    });
  });

  describe('`filter:<`', () => {
    it('permits a number value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:<', 'test', 123)).to.equal(true)
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() =>
        validator.validateValue('filter:<', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be a number'));
    });
  });

  describe('`filter:<=`', () => {
    it('permits a number value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:<=', 'test', 123)).to.equal(true)
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() =>
        validator.validateValue('filter:<=', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be a number'));
    });
  });

  describe('`filter:is`', () => {
    it('permits a `null` value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:is', 'test', null)).to.equal(true)
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator

      expect(() =>
        validator.validateValue('filter:is', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be [null]'))
    });
  });

  describe('`filter:is not`', () => {
    it('permits a `null` value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:is not', 'test', null)).to.equal(true)
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() =>
        validator.validateValue('filter:is not', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be [null]'))
    });
  });

  describe('`filter:in`', () => {
    it('permits an array of number / string values', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:in', 'test', [123, 'test'])).to.equal(
        true
      );
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() =>
        validator.validateValue('filter:in', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be an array'))
    });
  });

  describe('`filter:not in`', () => {
    it('permits an array of number / string values', () => {
      const validator = new KnexAdapter().validator;

      expect(
        validator.validateValue('filter:not in', 'test', [123, 'test'])
      ).to.equal(true);
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() =>
        validator.validateValue('filter:not in', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be an array'))
    });
  });

  describe('`filter:like`', () => {
    it('permits a string value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:like', 'test', 'valid')).to.equal(true)
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() => validator.validateValue('filter:like', 'test', 123)).toThrow(
        new ValidationError('test must be a string')
      );
    });
  });

  describe('`filter:not like`', () => {
    it('permits a string value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:not like', 'test', 'valid')).to.equal(
        true
      );
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() =>
        validator.validateValue('filter:not like', 'test', 123)
      ).toThrow(new ValidationError('test must be a string'));
    });
  });

  describe('`filter:ilike`', () => {
    it('permits a string value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:ilike', 'test', 'valid')).to.equal(
        true
      );
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() =>
        validator.validateValue('filter:ilike', 'test', 123)
      ).toThrow(new ValidationError('test must be a string'));
    });
  });

  describe('`filter:not ilike`', () => {
    it('permits a string value', () => {
      const validator = new KnexAdapter().validator;

      expect(validator.validateValue('filter:not ilike', 'test', 'valid')).to.equal(
        true
      );
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() =>
        validator.validateValue('filter:not ilike', 'test', 123)
      ).toThrow(new ValidationError('test must be a string'))
    });
  });

  describe('`filter:between`', () => {
    it('permits an array of two number values', () => {
      const validator = new KnexAdapter().validator;

      expect(
        validator.validateValue('filter:between', 'test', [123, 456])
      ).to.equal(true);
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() =>
        validator.validateValue('filter:between', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be an array'))
    });
  });

  describe('`filter:not between`', () => {
    it('permits an array of two number values', () => {
      const validator = new KnexAdapter().validator;

      expect(
        validator.validateValue('filter:not between', 'test', [123, 456])
      ).to.equal(true);
    });

    it('throws for a non-permitted value', () => {
      const validator = new KnexAdapter().validator;

      expect(() =>
        validator.validateValue('filter:not between', 'test', 'invalid')
      ).toThrow(new ValidationError('test must be an array'));
    });
  });
});
