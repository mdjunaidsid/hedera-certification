const {
  Client,
  PrivateKey,
  Hbar,
  AccountAllowanceApproveTransaction,
  TransferTransaction,
  TransactionId,
} = require('@hashgraph/sdk');
const { multiSignatureEnvPath } = require('../../lib/constants');
const { multiSignatureEnvSchema } = require('../../lib/schemas');
const { validate } = require('../../lib/helper');
require('dotenv').config({ path: multiSignatureEnvPath });

// Global Variables Declaration
try {
  validate(multiSignatureEnvSchema, process.env);
} catch (err) {
  console.log('ENV Validation Error');
  console.error(err.stack);
  process.exit(1);
}
// Allowance Amount
const ALLOWANCE_AMOUNT = Hbar.fromTinybars(35 * 100000000);

// Initializing Account Information
const treasuryAccountId = process.env.TREASURY_ACCOUNT_ID;
const treasuryPrivateKey = PrivateKey.fromString(process.env.TREASURY_ACCOUNT_PRIVATE_KEY);

const spenderAccountId = process.env.SPENDER_ACCOUNT_ID;
const spenderPrivateKey = PrivateKey.fromString(process.env.SPENDER_ACCOUNT_PRIVATE_KEY);

const receiver1AccountId = process.env.RECEIVER1_ACCOUNT_ID;
const receiver2AccountId = process.env.RECEIVER2_ACCOUNT_ID;

const client = Client.forTestnet();
client.setOperator(treasuryAccountId, treasuryPrivateKey);

/**
 * This function will approve allowance for an account
 * @returns {String} Transaction Status
 */
async function approveAllowance() {
  // Create the transaction
  const transaction = new AccountAllowanceApproveTransaction()
    .approveHbarAllowance(treasuryAccountId, spenderAccountId, ALLOWANCE_AMOUNT)
    .freezeWith(client);

  // Sign the transaction with the owner account key
  const signTx = await transaction.sign(treasuryPrivateKey);

  // Sign the transaction with the client operator private key and submit to a Hedera network
  const txResponse = await signTx.execute(client);

  // Request the receipt of the transaction
  const receipt = await txResponse.getReceipt(client);

  // Get the transaction consensus status
  const transactionStatus = receipt.status;

  return transactionStatus;
}

/**
 * This function will transfer the amount to receiver account using approve allowance
 * @param {*} receiverAccountId Receiver Account ID
 * @param {*} amount Amount in tinybars
 * @returns
 */
async function transferHbars(receiverAccountId, amount) {
  try {
    console.log(
      `${spenderAccountId} transferring ${amount.toTinybars()} tinybars to ${receiverAccountId} using the allowance\n`,
    );
    const transaction = new TransferTransaction()
      .addApprovedHbarTransfer(treasuryAccountId, amount.negated())
      .addHbarTransfer(receiverAccountId, amount)
      .setTransactionId(TransactionId.generate(spenderAccountId))
      .freezeWith(client);

    // Sign the transaction with the sender account key
    const signTx = await transaction.sign(spenderPrivateKey);

    // Sign the transaction with the client operator private key and submit to a Hedera network
    const txResponse = await signTx.execute(client);

    // Request the receipt of the transaction
    const { status } = await txResponse.getReceipt(client);
    console.log(`Successfully transferred the amount with status ${status}\n`);
    return;
  } catch (err) {
    if (err.status) {
      console.log(`Transaction unsuccessful with status ${err.status.toString()}\n`);
    } else {
      throw err;
    }
  }
}

async function main() {
  try {
    const transactionStatus = await approveAllowance();

    console.log(
      `An allowance approved from ${treasuryAccountId} of amount ${ALLOWANCE_AMOUNT.toTinybars()} tinybars for account ${spenderAccountId} with status ${transactionStatus}`,
    );
    // Transfer the amount to account 3
    await transferHbars(receiver1AccountId, Hbar.fromTinybars(15 * 100000000));
    await transferHbars(receiver2AccountId, Hbar.fromTinybars(20 * 100000000));

    console.log('Retrying the same transaction again\n');
    // Retrying to use the same allowance again
    await transferHbars(receiver1AccountId, Hbar.fromTinybars(15 * 100000000));
    await transferHbars(receiver2AccountId, Hbar.fromTinybars(20 * 100000000));
    process.exit(0);
  } catch (err) {
    console.log('Something Went Wrong');
    console.error(err.stack);
    process.exit(1);
  }
}

main();
