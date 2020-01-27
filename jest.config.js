const {defaults} = require('jest-config');

module.exports = {
  coverageDirectory: 'test/coverage',
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test/reports',
      },
    ],
  ],
  testMatch: ['**/test/src/**/*.js'],
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'mjs', 'ts', 'tsx'],
}
