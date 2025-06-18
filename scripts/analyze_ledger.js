const { ethers } = require("ethers");
const { OpenAI } = require("openai");
require("dotenv").config();

const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Usage: node scripts/analyze_ledger.js [walletAddress]
async function main() {
  const wallet = process.argv[2];
  if (!ALCHEMY_API_URL) {
    console.error("ALCHEMY_API_URL not set in environment");
    process.exit(1);
  }
  if (!OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY not set in environment");
    process.exit(1);
  }

  const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);
  const latest = await provider.getBlockNumber();

  const blocks = [];
  for (let i = 0; i < 3; i++) {
    const block = await provider.getBlockWithTransactions(latest - i);
    const txs = block.transactions.filter((tx) => {
      const val = parseFloat(ethers.formatEther(tx.value));
      const involvesWallet = wallet ? tx.from === wallet || tx.to === wallet : true;
      return val > 1 && involvesWallet; // high value filter
    });
    blocks.push({
      number: block.number,
      transactions: txs.slice(0, 5).map((tx) => ({
        from: tx.from,
        to: tx.to,
        value: ethers.formatEther(tx.value),
      })),
    });
  }

  const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  const prompt =
    'You are an on-chain analytics assistant. Provide a concise summary of high value transactions.\nWallet filter: ' +
    (wallet || 'none') +
    '\n' +
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
