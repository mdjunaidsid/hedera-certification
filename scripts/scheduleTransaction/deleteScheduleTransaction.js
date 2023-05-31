const { Client, PrivateKey, ScheduleDeleteTransaction } = require('@hashgraph/sdk');
const { scheduleTransactionEnvPath } = require('../../lib/constants');
const { scheduleTransactionEnvSchema } = require('../../lib/schemas');
const { validate } = require('../../lib/helper');
require('dotenv').config({ path: scheduleTransactionEnvPath });

// Validating environment variables
try {
  validate(scheduleTransactionEnvSchema, process.env);
} catch (err) {
  console.log('ENV Validation Error');
  console.error(err.stack);
  process.exit(1);
}

// Initializing Account information
const adminAccountId = process.env.ADMIN_ACCOUNT_ID;
const adminPrivateKey = PrivateKey.fromString(process.env.ADMIN_ACCOUNT_PRIVATE_KEY);

const scheduleId = Buffer.from(process.env.SCHEDULE_ID, 'base64').toString('ascii');

// Configuring client for test network(testnet) with primary account credentials
const client = Client.forTestnet();
client.setOperator(adminAccountId, adminPrivateKey);

/**
 * This function will Serialize the string and convert it to base64 string
 * @param {String} data Transaction Id
 * @returns {String} Base64 String
 */
// function convertToBase64(data) {
//   return Buffer.from(data.toString(), 'utf8').toString('base64');
// }

async function main() {
  try {
    // Create the transaction and sign with the admin key
    const transaction = await new ScheduleDeleteTransaction()
      .setScheduleId(scheduleId)
      .freezeWith(client)
      .sign(adminPrivateKey);

    // Sign with the operator key and submit to a Hedera network
    const txResponse = await transaction.execute(client);

    // Get the transaction receipt
    const receipt = await txResponse.getReceipt(client);

    // Get the schedule ID
    console.log(`The schedule ID is ${scheduleId}`);

    const transactionStatus = receipt.status;
    console.log('The transaction consensus status is ', transactionStatus);

    process.exit(0);
  } catch (err) {
    console.log('Something Went Wrong');
    console.error(err.stack);
    process.exit(1);
  }
}

main();
