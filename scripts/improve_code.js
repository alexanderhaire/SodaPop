const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { OpenAI } = require("openai");

function parseArgs() {
  const opts = { dryRun: false, diff: false, targets: [] };
  for (const arg of process.argv.slice(2)) {
    if (arg === "--dry-run") opts.dryRun = true;
    else if (arg === "--diff") opts.diff = true;
    else opts.targets.push(arg);
  }
  if (opts.targets.length === 0) {
    console.error(
      "Usage: node scripts/improve_code.js <file|dir> [...more] [--dry-run] [--diff]"
    );
    process.exit(1);
  }
  return opts;
}

function collectFiles(target, out = []) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    if (path.basename(target) === "node_modules") return out;
    for (const f of fs.readdirSync(target)) {
      collectFiles(path.join(target, f), out);
    }
  } else if (/\.(ts|tsx|js|jsx)$/.test(target)) {
    out.push(path.resolve(target));
  }
  return out;
}

async function improveFile(file, openai, opts) {
  const original = fs.readFileSync(file, "utf8");
  const prompt =
    "Improve the following JavaScript or TypeScript code for readability and maintainability. Return only the updated code.\n\n" +
    original;

  const chat = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.2,
  });

  const improved = chat.choices[0]?.message?.content;
  if (!improved) {
    console.error("No response from OpenAI for", file);
    return;
  }

  if (opts.diff) {
    const tmp = file + ".improved";
    fs.writeFileSync(tmp, improved);
    spawnSync("diff", ["-u", file, tmp], { stdio: "inherit" });
    fs.unlinkSync(tmp);
  }

  if (!opts.dryRun) {
    fs.writeFileSync(file, improved);
    console.log(`Updated ${file}`);
  } else {
    console.log(`Would update ${file}`);
  }
}

async function main() {
  const opts = parseArgs();
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error("OPENAI_API_KEY not set in environment");
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });

  const files = opts.targets.flatMap((t) => collectFiles(t));
  for (const file of files) {
    await improveFile(file, openai, opts);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
