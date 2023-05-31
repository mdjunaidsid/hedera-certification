const { Client, PrivateKey, TopicMessageSubmitTransaction } = require('@hashgraph/sdk');
const { consensusEnvPath } = require('../../lib/constants');
const { sendMessageEnvSchema } = require('../../lib/schemas');
const { validate } = require('../../lib/helper');
require('dotenv').config({ path: consensusEnvPath });

try {
  validate(sendMessageEnvSchema, process.env);
} catch (err) {
  console.log('ENV Validation Error');
  console.error(err.stack);
  process.exit(1);
}

const publisherAccountId = process.env.ADMIN_ACCOUNT_ID;
const publisherPrivateKey = PrivateKey.fromString(process.env.ADMIN_PRIVATE_KEY);

const topicId = process.env.TOPIC_ID;

const client = Client.forTestnet();
client.setOperator(publisherAccountId, publisherPrivateKey);

async function main() {
  try {
    // Send one message on the topic
    const sendResponse = await new TopicMessageSubmitTransaction({
      topicId,
      message: `${Date.now()}`,
    }).execute(client);

    // Get the receipt of the transaction
    const { status } = await sendResponse.getReceipt(client);

    console.log(`Topic Id: ${topicId}`);
    console.log(`The message transaction status: ${status}`);

    process.exit(0);
  } catch (err) {
    console.log('Something Went Wrong');
    console.error(err.stack);
    process.exit(1);
  }
}

main();
