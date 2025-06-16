const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

async function main() {
  const file = process.argv[2];
  if (!file) {
    console.error('Usage: node scripts/improve_code.js <file>');
    process.exit(1);
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not set in environment');
    process.exit(1);
  }

  const absPath = path.resolve(file);
  const code = fs.readFileSync(absPath, 'utf8');

  const openai = new OpenAI({ apiKey });
  const prompt = `Improve the following JavaScript or TypeScript code for readability and maintainability. Return only the updated code.\n\n${code}`;

  const chat = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });

  const improved = chat.choices[0]?.message?.content;
  if (!improved) {
    console.error('No response from OpenAI');
    process.exit(1);
  }

  fs.writeFileSync(absPath, improved);
  console.log(`Updated ${file}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
