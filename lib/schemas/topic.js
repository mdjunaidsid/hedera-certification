const Joi = require('joi');
const { accountIdRegex } = require('../constants');

module.exports = Joi.object({
  ADMIN_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  ADMIN_PRIVATE_KEY: Joi.string().required(),
}).unknown();
