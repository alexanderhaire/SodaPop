#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { diffLines } = require('diff');

async function main() {
  const args = process.argv.slice(2);
  const flags = { explain: false, test: false, refactor: false };
  const files = [];

  for (const arg of args) {
    if (arg === '--explain') flags.explain = true;
    else if (arg === '--test') flags.test = true;
    else if (arg === '--refactor') flags.refactor = true;
    else files.push(arg);
  }

  const file = files[0];
  if (!file) {
    console.error('Usage: node scripts/improve_code.js [--explain] [--test] [--refactor] <file>');
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
  let prompt = 'Improve the following JavaScript or TypeScript code for readability and maintainability.';
  if (flags.explain) prompt += ' Add inline comments explaining the code.';
  if (flags.refactor) prompt += ' Refactor the code where appropriate.';
  if (flags.test) {
    prompt += ' After the code, provide Jest unit tests that cover the core functionality. Separate the tests from the code with a line containing only "TESTS".';
  }
  prompt += '\n\n' + code;

  const chat = await openai.chat.completions.create({
    model: 'gpt-4-turbo',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.2,
  });

  let improved = chat.choices[0]?.message?.content;
  if (!improved) {
    console.error('No response from OpenAI');
    process.exit(1);
  }

  let tests = '';
  if (flags.test) {
    const parts = improved.split(/^TESTS\s*$/m);
    if (parts.length > 1) {
      improved = parts[0].trim();
      tests = parts[1].trim();
    }
  }

  // Show diff before writing
  const patch = diffLines(code, improved)
    .map(part => {
      const color = part.added ? '\x1b[32m' : part.removed ? '\x1b[31m' : '\x1b[0m';
      return color + part.value + '\x1b[0m';
    })
    .join('');
  console.log(patch);

  fs.writeFileSync(absPath, improved);
  console.log(`Updated ${file}`);

  if (flags.test && tests) {
    const testPath = absPath.replace(/\.(js|ts)$/, '.test.$1');
    fs.writeFileSync(testPath, tests);
    console.log(`Wrote tests to ${testPath}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
