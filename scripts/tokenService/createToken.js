const {
  Client,
  Wallet,
  TokenCreateTransaction,
  TokenType,
  PrivateKey,
  TokenSupplyType,
  CustomRoyaltyFee,
  CustomFixedFee,
  Hbar,
} = require('@hashgraph/sdk');

const { tokenServiceEnvPath } = require('../../lib/constants');
const { createTokenEnvSchema } = require('../../lib/schemas');
const { validate } = require('../../lib/helper');
require('dotenv').config({ path: tokenServiceEnvPath });

const adminAccountId = process.env.ADMIN_ACCOUNT_ID;
const adminPrivateKey = PrivateKey.fromString(process.env.ADMIN_ACCOUNT_PRIVATEKEY);
const feeCollectorAccountId = process.env.FEE_COLLECTED_ACCOUNT_ID;

const client = Client.forTestnet();
client.setOperator(adminAccountId, adminPrivateKey);

const adminWallet = new Wallet(adminAccountId, adminPrivateKey);

try {
  validate(createTokenEnvSchema, process.env);
} catch (err) {
  console.log('ENV Validation Error');
  console.error(err.stack);
  process.exit(1);
}

async function main() {
  try {
    const transaction = await new TokenCreateTransaction()
      .setTokenName('My First Token')
      .setTokenSymbol('MFT')
      .setTokenType(TokenType.NonFungibleUnique)
      .setSupplyType(TokenSupplyType.Finite)
      .setTreasuryAccountId(adminAccountId)
      .setMaxSupply(5)
      .setInitialSupply(0)
      .setCustomFees([
        new CustomRoyaltyFee()
          .setNumerator(10) // The numerator of the fraction
          .setDenominator(100) // The denominator of the fraction
          .setFallbackFee(
            new CustomFixedFee()
              .setHbarAmount(new Hbar(200)) // The fallback fee
              .setFeeCollectorAccountId(feeCollectorAccountId),
          )
          .setFeeCollectorAccountId(feeCollectorAccountId),
      ])
      .setAdminKey(adminWallet.publicKey)
      .setMaxTransactionFee(new Hbar(60))
      .setSupplyKey(adminWallet.publicKey)
      // .setPauseKey(adminWallet.publicKey)
      .freezeWith(client);

    // Sign the transaction with the client, who is set as admin and treasury account
    const signTx = await transaction.sign(
      PrivateKey.fromString(process.env.ADMIN_ACCOUNT_PRIVATEKEY),
    );

    // Submit to a Hedera network
    const txResponse = await signTx.execute(client);

    // Get the receipt of the transaction
    const receipt = await txResponse.getReceipt(client);

    // Get the token ID from the receipt
    const { tokenId } = receipt;

    console.log(`The new token ID is ${tokenId}`);

    process.exit(0);
  } catch (err) {
    console.log('Something Went Wrong');
    console.error(err.stack);
    process.exit(1);
  }
}

main();
