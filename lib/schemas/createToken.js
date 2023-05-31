const Joi = require('joi');
const { accountIdRegex } = require('../constants');

module.exports = Joi.object({
  ADMIN_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  ADMIN_ACCOUNT_PRIVATEKEY: Joi.string().required(),
  FEE_COLLECTED_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  // SUPPLY_ACCOUNT_PRIVATEKEY: Joi.string().required(),
}).unknown();
