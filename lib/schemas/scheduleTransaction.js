const Joi = require('joi');
const { accountIdRegex } = require('../constants');

module.exports = Joi.object({
  ADMIN_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  ADMIN_ACCOUNT_PRIVATE_KEY: Joi.string().required(),
  PAYER_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  RECEIVER_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
}).unknown();
