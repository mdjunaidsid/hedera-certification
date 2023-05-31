const Joi = require('joi');
const { accountIdRegex } = require('../constants');

module.exports = Joi.object({
  ADMIN_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  ADMIN_ACCOUNT_PRIVATEKEY: Joi.string().required(),
  TOKEN_ID: Joi.string().regex(accountIdRegex).required(),
  ACCOUNT3_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  ACCOUNT3_ACCOUNT_PRIVATEKEY: Joi.string().required(),
  ACCOUNT4_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  ACCOUNT4_ACCOUNT_PRIVATEKEY: Joi.string().required(),
}).unknown();
