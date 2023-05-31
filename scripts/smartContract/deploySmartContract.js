const {
  Client,
  PrivateKey,
  FileCreateTransaction,
  ContractCreateTransaction,
  ContractFunctionParameters,
} = require('@hashgraph/sdk');
const { smartContractEnvPath } = require('../../lib/constants');
const { deploySmartContractEnvSchema } = require('../../lib/schemas');
const { validate } = require('../../lib/helper');
require('dotenv').config({ path: smartContractEnvPath });
const { bytecode } = require('./metadata/CertificationC1.json');

// Validating environment variables
try {
  validate(deploySmartContractEnvSchema, process.env);
} catch (err) {
  console.log('ENV Validation Error');
  console.error(err.stack);
  process.exit(1);
}

// Operator account ID and private key from string value
const adminAccountId = process.env.ADMIN_ACCOUNT_ID;
const adminPrivateKey = PrivateKey.fromString(process.env.ADMIN_ACCOUNT_PRIVATE_KEY);

// Configuring client for test network(testnet) with primary account credentials
const client = Client.forTestnet();
client.setOperator(adminAccountId, adminPrivateKey);

async function main() {
  try {
    // Create a file on Hedera and store the hex-encoded bytecode
    const fileCreateTx = new FileCreateTransaction().setContents(bytecode);

    // Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
    const submitTx = await fileCreateTx.execute(client);

    // Get the receipt of the file create transaction
    const fileReceipt = await submitTx.getReceipt(client);

    // Get the file ID from the receipt
    const bytecodeFileId = fileReceipt.fileId;

    console.log(`The smart contract byte code file ID is ${bytecodeFileId}`);

    // Instantiate the contract instance
    const contractTx = await new ContractCreateTransaction()
      .setBytecodeFileId(bytecodeFileId)
      .setGas(100000)
      .setConstructorParameters(
        new ContractFunctionParameters().addString('Participating in Hedera Certification'),
      );

    // Submit the transaction to the Hedera test network
    const contractResponse = await contractTx.execute(client);

    // Get the receipt of the file create transaction
    const contractReceipt = await contractResponse.getReceipt(client);

    // Get the smart contract ID
    const newContractId = contractReceipt.contractId;

    // Log the smart contract ID
    console.log(`The smart contract ID is ${newContractId}`);

    process.exit(0);
  } catch (err) {
    console.log('Something Went Wrong');
    console.error(err.stack);
    process.exit(1);
  }
}

main();
