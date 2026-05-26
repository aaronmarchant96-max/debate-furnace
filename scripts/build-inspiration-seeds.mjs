import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const seedDir = path.join(repoRoot, "public", "seeds");
const indexPath = path.join(seedDir, "index.json");
const batchPath = path.join(repoRoot, "data", "inspiration-seeds.batch.jsonl");
const manifestPath = path.join(repoRoot, "data", "inspiration-seeds.manifest.json");

const batchInstruction = [
  "You are generating original story ideas from a real historical seed.",
  "Do not retell the event as fiction.",
  "Extract the reusable conflict pattern, then produce new creative directions that are clearly transformed.",
  "Return concise JSON with: summary, whyWild, stakes, hinge, storyDNA, storyFuel, and sourceTrail."
].join(" ");

const normalizeList = (value) =>
  Array.isArray(value)
    ? [...new Set(value.map((item) => String(item).trim()).filter(Boolean))]
    : [];

const seedToPrompt = (seed) => ({
  historical_seed: seed.title,
  context: {
    era: seed.era,
    region: seed.region,
    sourceType: seed.sourceType,
    summary: seed.summary,
    whyWild: seed.whyWild,
    stakes: seed.stakes,
    hinge: seed.hinge,
    storyDNA: normalizeList(seed.storyDNA),
    tags: normalizeList(seed.tags),
    charactersForces: normalizeList(seed.charactersForces),
    genreRemixes: Array.isArray(seed.genreRemixes) ? seed.genreRemixes : [],
    whatIfDivergences: normalizeList(seed.whatIfDivergences),
    sourceTrail: Array.isArray(seed.sourceTrail) ? seed.sourceTrail : []
  },
  instruction: batchInstruction
});

async function readSeedLibrary() {
  const indexRaw = await fs.readFile(indexPath, "utf8");
  const index = JSON.parse(indexRaw);
  const files = Array.isArray(index?.seedFiles) ? index.seedFiles : [];

  if (!files.length) {
    throw new Error("No inspiration seed files found in public/seeds/index.json");
  }

  const seeds = await Promise.all(
    files.map(async (file) => {
      const raw = await fs.readFile(path.join(seedDir, file), "utf8");
      return JSON.parse(raw);
    })
  );

  return seeds.filter(Boolean);
}

async function main() {
  const seeds = await readSeedLibrary();

  await fs.mkdir(path.dirname(batchPath), { recursive: true });

  const lines = seeds.map((seed) =>
    JSON.stringify({
      custom_id: `inspiration-seed-${seed.id}`,
      seed_id: seed.id,
      seed_title: seed.title,
      prompt: seedToPrompt(seed)
    })
  );

  await fs.writeFile(batchPath, `${lines.join("\n")}\n`, "utf8");

  const tagCounts = new Map();
  for (const seed of seeds) {
    for (const tag of normalizeList(seed.tags)) {
      tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
    }
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    seedCount: seeds.length,
    batchFile: path.relative(repoRoot, batchPath),
    inputFile: path.relative(repoRoot, indexPath),
    sourceDirectory: path.relative(repoRoot, seedDir),
    tags: [...tagCounts.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }))
  };

  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  console.log(`Built ${seeds.length} seeds`);
  console.log(`Wrote ${path.relative(repoRoot, batchPath)}`);
  console.log(`Wrote ${path.relative(repoRoot, manifestPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
