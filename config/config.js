/* eslint-disable no-nested-ternary */
const config = {
  development: {
    SQL: {},
    NOSQL: process.env.CONNECTION_STRING,
  },
  staging: {
    SQL: {},
    NOSQL: process.env.CONNECTION_STRING,
  },
  production: {
    SQL: {},
    NOSQL: process.env.CONNECTION_STRING,
  },
};

const configData =
  process.env.NODE_ENV.trim() === "development"
    ? config.development
    : process.env.NODE_ENV.trim() === "staging"
    ? config.staging
    : config.production;

module.exports = configData;
