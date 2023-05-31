const Joi = require('joi');
const { accountIdRegex } = require('../constants');

module.exports = Joi.object({
  SMART_CONTRACT_ID: Joi.string().regex(accountIdRegex).required(),
  EXECUTOR_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  EXECUTOR_ACCOUNT_PRIVATE_KEY: Joi.string().required(),
}).unknown();
