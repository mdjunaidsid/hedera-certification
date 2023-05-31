const Joi = require('joi');
const { accountIdRegex } = require('../constants');

module.exports = Joi.object({
  PAYER_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  PAYER_ACCOUNT_PRIVATE_KEY: Joi.string().required(),
  RECEIVER_ACCOUNT_ID: Joi.string().regex(accountIdRegex).required(),
  SCHEDULE_ID: Joi.string().required(),
}).unknown();
