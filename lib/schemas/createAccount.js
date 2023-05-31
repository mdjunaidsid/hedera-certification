const Joi = require('joi');
const { accountIdRegex } = require('../constants');

module.exports = Joi.object({
  PRIMARY_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  PRIMARY_ACCOUNT_PRIVATEKEY: Joi.string().required(),
}).unknown();
