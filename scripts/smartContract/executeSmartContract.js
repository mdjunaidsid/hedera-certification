const {
  Client,
  PrivateKey,
  ContractExecuteTransaction,
  ContractFunctionParameters,
} = require('@hashgraph/sdk');
const { smartContractEnvPath } = require('../../lib/constants');
const { executeSmartContractEnvSchema } = require('../../lib/schemas');
const { validate } = require('../../lib/helper');
require('dotenv').config({ path: smartContractEnvPath });

// Validating environment variables
try {
  validate(executeSmartContractEnvSchema, process.env);
} catch (err) {
  console.log('ENV Validation Error');
  console.error(err.stack);
  process.exit(1);
}
// Variables Declaration
const accountId = process.env.EXECUTOR_ACCOUNT_ID;
const privateKey = PrivateKey.fromString(process.env.EXECUTOR_ACCOUNT_PRIVATE_KEY);
const smartContractId = process.env.SMART_CONTRACT_ID;

// Operator account ID and private key from string value
const client = Client.forTestnet();
client.setOperator(accountId, privateKey);

async function main() {
  try {
    // Query the contract for the contract message
    const contractExecTxFunction1 = new ContractExecuteTransaction()
      .setContractId(smartContractId)
      .setGas(100000)
      .setFunction('function1', new ContractFunctionParameters().addUint16(4).addUint16(3));

    // Submit the transaction to a Hedera network and store the response
    const submitExecFunction1 = await contractExecTxFunction1.execute(client);

    // Get the receipt of the transaction
    const receiptFunction1 = await submitExecFunction1.getReceipt(client);

    // Confirm the transaction was executed successfully
    console.log(`The transaction status of function 1 is ${receiptFunction1.status.toString()}`);

    // Query the contract for the contract message
    const contractExecTxFunction2 = new ContractExecuteTransaction()
      .setContractId(smartContractId)
      .setGas(100000)
      .setFunction('function2', new ContractFunctionParameters().addUint16(12));

    // Submit the transaction to a Hedera network and store the response
    const submitExecFunction2 = await contractExecTxFunction2.execute(client);

    // Get the receipt of the transaction
    const receiptFunction2 = await submitExecFunction2.getReceipt(client);

    // Confirm the transaction was executed successfully
    console.log(`The transaction status of function 2 is ${receiptFunction2.status.toString()}`);

    process.exit(0);
  } catch (err) {
    console.log('Something Went Wrong');
    console.error(err.stack);
    process.exit(1);
  }
}

main();
