const { Client, PrivateKey, TopicCreateTransaction } = require('@hashgraph/sdk');
const { consensusEnvPath } = require('../../lib/constants');
const { topicEnvSchema } = require('../../lib/schemas');
const { validate, sleep } = require('../../lib/helper');
require('dotenv').config({ path: consensusEnvPath });

try {
  validate(topicEnvSchema, process.env);
} catch (err) {
  console.log('ENV Validation Error');
  console.error(err.stack);
  process.exit(1);
}

const adminAccountId = process.env.ADMIN_ACCOUNT_ID;
const adminPrivateKey = PrivateKey.fromString(process.env.ADMIN_PRIVATE_KEY);

const client = Client.forTestnet();
client.setOperator(adminAccountId, adminPrivateKey);

async function main() {
  try {
    const createTopicTransaction = await new TopicCreateTransaction()
      .setAdminKey(adminPrivateKey)
      .setTopicMemo('This is a demo topic')
      .execute(client);

    // Grab the newly generated topic ID
    const receipt = await createTopicTransaction.getReceipt(client);
    const { topicId } = receipt;

    console.log(`Your topic ID is: ${topicId}`);

    // Wait 5 seconds between consensus topic creation and subscription creation
    await sleep(5000);

    process.exit(0);
  } catch (err) {
    console.log('Something Went Wrong');
    console.error(err.stack);
    process.exit(1);
  }
}

main();
