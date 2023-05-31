const Joi = require('joi');
const { accountIdRegex } = require('../constants');

module.exports = Joi.object({
  TREASURY_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  TREASURY_ACCOUNT_PRIVATE_KEY: Joi.string().required(),
  SPENDER_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  SPENDER_ACCOUNT_PRIVATE_KEY: Joi.string().required(),
  RECEIVER1_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  RECEIVER2_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
}).unknown();
