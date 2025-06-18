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

  const transactions = [];
  for (let i = 0; i < 5; i++) {
    const block = await provider.getBlockWithTransactions(latest - i);
    for (const tx of block.transactions.slice(0, 5)) {
      const valueEther = parseFloat(ethers.formatEther(tx.value));
      transactions.push({
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: valueEther,
        fromDelta: -valueEther,
        toDelta: valueEther
      });
    }
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const prompt = `Classify each transaction as buy, sell, mint or transfer. Provide a short narrative sentence summarizing what happened and include the ETH delta for the from and to wallets.\n\n${JSON.stringify(transactions, null, 2)}`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  });

  console.log(completion.choices[0]?.message?.content || 'No response');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
