const {
  Client,
  PrivateKey,
  TransferTransaction,
  Hbar,
  ScheduleCreateTransaction,
} = require('@hashgraph/sdk');
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

const receiverAccountId = process.env.RECEIVER_ACCOUNT_ID;
const payerAccountId = process.env.PAYER_ACCOUNT_ID;

// Configuring client for test network(testnet) with primary account credentials
const client = Client.forTestnet();
client.setOperator(adminAccountId, adminPrivateKey);

/**
 * This function will Serialize the string and convert it to base64 string
 * @param {String} data Transaction Id
 * @returns {String} Base64 String
 */
function convertToBase64(data) {
  return Buffer.from(data.toString(), 'utf8').toString('base64');
}

async function main() {
  try {
    // Create a transaction to schedule
    const transaction = new TransferTransaction()
      .addHbarTransfer(payerAccountId, new Hbar(5).negated())
      .addHbarTransfer(receiverAccountId, new Hbar(5));

    // Schedule a transaction
    const scheduleTransaction = await new ScheduleCreateTransaction()
      .setScheduledTransaction(transaction)
      .setScheduleMemo('Sending Hbar from account1 to account 2')
      .setAdminKey(adminPrivateKey)
      .execute(client);

    // Get the receipt of the transaction
    const receipt = await scheduleTransaction.getReceipt(client);

    // Get the schedule ID
    const { scheduleId } = receipt;
    console.log(`The schedule ID is ${scheduleId}`);
    console.log(`Base64 of schedule Id ${convertToBase64(scheduleId)}`);

    // Get the scheduled transaction ID
    const scheduledTxId = receipt.scheduledTransactionId;
    console.log(`The scheduled transaction ID is ${scheduledTxId}`);

    process.exit(0);
  } catch (err) {
    console.log('Something Went Wrong');
    console.error(err.stack);
    process.exit(1);
  }
}

main();