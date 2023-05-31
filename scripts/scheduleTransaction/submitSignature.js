const {
  Client,
  PrivateKey,
  ScheduleSignTransaction,
  AccountBalanceQuery,
} = require('@hashgraph/sdk');
const { scheduleTransactionEnvPath } = require('../../lib/constants');
const { submitSignatureEnvSchema } = require('../../lib/schemas');
const { validate, sleep } = require('../../lib/helper');
require('dotenv').config({ path: scheduleTransactionEnvPath });

// Validating environment variables
try {
  validate(submitSignatureEnvSchema, process.env);
} catch (err) {
  console.log('ENV Validation Error');
  console.error(err.stack);
  process.exit(1);
}

// Initializing Account information
const payerAccountId = process.env.PAYER_ACCOUNT_ID;
const receiverAccountId = process.env.RECEIVER_ACCOUNT_ID;
const payerPrivateKey = PrivateKey.fromString(process.env.PAYER_ACCOUNT_PRIVATE_KEY);

// Decode the encoded transaction id
const scheduleId = Buffer.from(process.env.SCHEDULE_ID, 'base64').toString('ascii');

// Configuring client for test network(testnet) with primary account credentials
const client = Client.forTestnet();
client.setOperator(payerAccountId, payerPrivateKey);

/**
 * This function will fetch the account balance of a given account Id
 * @param {String} accountId
 * @returns {Number} Account balance in Tinybars
 */
async function getAccountBalance(accountId) {
  const accountBalance = await new AccountBalanceQuery().setAccountId(accountId).execute(client);
  return accountBalance.hbars.toTinybars();
}

async function main() {
  try {
    // Get Intial Account balance for both the user
    let payerAccountBalance = await getAccountBalance(payerAccountId);
    let receiverAccountBalance = await getAccountBalance(receiverAccountId);

    console.log('Before Transaction');
    console.log(`Payer Account Balance ${payerAccountBalance} tinybar`);
    console.log(`Receiver Account Balance ${receiverAccountBalance} tinybar\n`);
    // Create the transaction
    const transaction = await new ScheduleSignTransaction()
      .setScheduleId(scheduleId)
      .freezeWith(client)
      .sign(payerPrivateKey);

    // Sign with the client operator key to pay for the transaction and submit to a Hedera network
    const txResponse = await transaction.execute(client);

    // Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    // Get the transaction status
    const transactionStatus = receipt.status;
    console.log(`The transaction consensus status is ${transactionStatus}`);

    await sleep(5000);
    // Get Updated Account balance for both the user
    payerAccountBalance = await getAccountBalance(payerAccountId);
    receiverAccountBalance = await getAccountBalance(receiverAccountId);

    console.log('After Transaction');
    console.log(`Payer Account Balance ${payerAccountBalance} tinybar`);
    console.log(`Receiver Account Balance ${receiverAccountBalance} tinybar\n`);
    process.exit(0);
  } catch (err) {
    console.log('Something Went Wrong');
    console.error(err.stack);
    process.exit(1);
  }
}

main();
