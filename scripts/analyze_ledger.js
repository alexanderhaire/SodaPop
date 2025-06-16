const { ethers } = require('ethers');
const { OpenAI } = require('openai');
require('dotenv').config();

const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

async function main() {
  if (!ALCHEMY_API_URL) {
    console.error('ALCHEMY_API_URL not set in environment');
    process.exit(1);
  }
  if (!OPENAI_API_KEY) {
    console.error('OPENAI_API_KEY not set in environment');
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);
  const latest = await provider.getBlockNumber();

  const blocks = [];
  for (let i = 0; i < 5; i++) {
    const block = await provider.getBlockWithTransactions(latest - i);
    blocks.push({
      number: block.number,
      transactions: block.transactions.slice(0, 5).map(tx => ({
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value)
      }))
    });
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const prompt =
    'Summarize these blockchain transactions. Provide general insights only, not financial advice.\n\n' +
    JSON.stringify(blocks, null, 2);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  });

  console.log('OpenAI summary:\n');
  console.log(completion.choices[0]?.message?.content || 'No response');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
