const { ethers, ZeroAddress } = require('ethers');
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
      const fromBefore = await provider.getBalance(tx.from, tx.blockNumber - 1);
      const fromAfter = await provider.getBalance(tx.from, tx.blockNumber);

      let toBefore = 0n;
      let toAfter = 0n;
      const toAddr = tx.to ?? ZeroAddress;
      if (tx.to) {
        toBefore = await provider.getBalance(tx.to, tx.blockNumber - 1);
        toAfter = await provider.getBalance(tx.to, tx.blockNumber);
      }

      transactions.push({
        block: block.number,
        hash: tx.hash,
        from: tx.from,
        to: toAddr,
        value: ethers.formatEther(tx.value),
        fromDelta: ethers.formatEther(fromAfter - fromBefore),
        toDelta: ethers.formatEther(toAfter - toBefore)
      });
    }
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const prompt =
    'Classify each transaction as a buy, sell, mint, or transfer and narrate it in one sentence. Include wallet balance deltas if provided. Provide general insights only, not financial advice.\n\n' +
    JSON.stringify(transactions, null, 2);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.3
  });

  console.log('OpenAI transaction narratives:\n');
  console.log(completion.choices[0]?.message?.content || 'No response');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
