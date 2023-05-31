const {
  Client,
  PrivateKey,
  AccountCreateTransaction,
  AccountBalanceQuery,
  Hbar,
} = require('@hashgraph/sdk');
const fs = require('fs');
const { createAccountEnvPath } = require('../../lib/constants');
const { createAccountEnvSchema } = require('../../lib/schemas');
const { validate } = require('../../lib/helper');
require('dotenv').config({ path: createAccountEnvPath });

// Validating environment variables
try {
  validate(createAccountEnvSchema, process.env);
} catch (err) {
  console.log('ENV Validation Error');
  console.error(err.stack);
  process.exit(1);
}

// Global Variables Declaration
const NUMBER_OF_ACCOUNT = 5;
const INITIAL_HBAR_AMOUNT = 500 * 100000000;
const ACCOUNT_DETAILS_FILE_PATH = 'account-details.json';

// Operator account ID and private key from string value
const primaryAccountId = process.env.PRIMARY_ACCOUNT_ID;
const primaryAccountPrivateKey = PrivateKey.fromString(process.env.PRIMARY_ACCOUNT_PRIVATEKEY);

// Configuring client for test network(testnet) with primary account credentials
const client = Client.forTestnet();
client.setOperator(primaryAccountId, primaryAccountPrivateKey);

/**
 * This function will be used for creating new hedera accounts
 * @returns {Object} Account ID and Private Keys for new Accounts
 */
async function createNewHederaAccount() {
  // Create new keys
  const newAccountPrivateKey = PrivateKey.generateED25519();
  const newAccountPublicKey = newAccountPrivateKey.publicKey;

  // Create a new account with 1,000 tinybar starting balance
  const newAccount = await new AccountCreateTransaction()
    .setKey(newAccountPublicKey)
    .setInitialBalance(Hbar.fromTinybars(INITIAL_HBAR_AMOUNT))
    .execute(client);

  const { accountId } = await newAccount.getReceipt(client);
  return { accountId: `${accountId}`, accountPrivateKey: `${newAccountPrivateKey}` };
}
/**
 * Get Account Balance of an account
 * @param {String} accountId Requested Account ID
 * @returns {Number} Available balance of that account(Tinybars)
 */
async function getAccountBalance(accountId) {
  const accountBalance = await new AccountBalanceQuery().setAccountId(accountId).execute(client);

  return accountBalance.hbars.toTinybars();
}

/**
 * Log the newly created account details
 * @param {*} index Number of Account
 * @param {*} accountId Account Id
 * @param {*} initialBalance Intial balance for the account(Tinybars)
 */
function logAccountInformation(index, accountId, initialBalance) {
  console.log('-------------------------------------------');
  console.log(`Account ${index + 1}`);
  console.log(`Account Id: ${accountId}`);
  console.log(`Initial Balance: ${initialBalance} tinybar`);
  console.log('-------------------------------------------');
}
async function main() {
  try {
    const accountDetails = [];

    console.log(
      `Creating ${NUMBER_OF_ACCOUNT} Hedera Accounts(With Initial Balance ${INITIAL_HBAR_AMOUNT} tinybar) Using Hedera APIs`,
    );

    // Creating accounts in a loop
    /* eslint-disable no-await-in-loop */
    for (let index = 0; index < NUMBER_OF_ACCOUNT; index += 1) {
      const newAccountDetails = await createNewHederaAccount();
      const newAccountBalance = await getAccountBalance(newAccountDetails.accountId);
      logAccountInformation(index, newAccountDetails.accountId, newAccountBalance);
      accountDetails.push({ ...newAccountDetails, initialBalance: newAccountBalance.toNumber() });
    }

    fs.writeFileSync(ACCOUNT_DETAILS_FILE_PATH, JSON.stringify(accountDetails, null, 2));

    console.log(
      `Account creation successfully completed. Further details can be found on ${ACCOUNT_DETAILS_FILE_PATH} file`,
    );
    process.exit(0);
  } catch (err) {
    console.log('Something Went Wrong');
    console.error(err.stack);
    process.exit(1);
  }
}

main();
