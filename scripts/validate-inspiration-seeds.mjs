import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoRoot = path.resolve(__dirname, "..");

const seedDir = path.join(repoRoot, "public", "seeds");
const indexPath = path.join(seedDir, "index.json");

const requiredSeedKeys = [
  "id",
  "title",
  "era",
  "region",
  "sourceType",
  "sourceTrail",
  "summary",
  "whyWild",
  "stakes",
  "hinge",
  "storyDNA",
  "charactersForces",
  "tags",
  "genreRemixes",
  "whatIfDivergences",
];

const requiredSourceTrailKeys = ["label", "url"];
const requiredGenreRemixKeys = ["genre", "angle", "prompt"];

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function ensure(condition, message, errors) {
  if (!condition) errors.push(message);
}

function validateStringField(seed, key, errors) {
  ensure(
    typeof seed[key] === "string" && seed[key].trim().length > 0,
    `seed ${seed.id ?? "<unknown>"}: ${key} must be a non-empty string`,
    errors
  );
}

function validateStringArray(seed, key, errors) {
  const value = seed[key];
  ensure(
    Array.isArray(value) && value.length > 0,
    `seed ${seed.id ?? "<unknown>"}: ${key} must be a non-empty array`,
    errors
  );
  if (!Array.isArray(value)) return;
  value.forEach((item, index) => {
    ensure(
      typeof item === "string" && item.trim().length > 0,
      `seed ${seed.id ?? "<unknown>"}: ${key}[${index}] must be a non-empty string`,
      errors
    );
  });
}

function validateExactKeys(object, keys, label, errors) {
  if (!isPlainObject(object)) {
    errors.push(`${label} must be an object`);
    return;
  }
  const actualKeys = Object.keys(object).sort();
  const expectedKeys = [...keys].sort();
  const missing = expectedKeys.filter((key) => !Object.hasOwn(object, key));
  const extra = actualKeys.filter((key) => !expectedKeys.includes(key));
  if (missing.length) errors.push(`${label} missing keys: ${missing.join(", ")}`);
  if (extra.length) errors.push(`${label} has extra keys: ${extra.join(", ")}`);
}

function validateSourceTrail(seed, errors) {
  const value = seed.sourceTrail;
  ensure(
    Array.isArray(value) && value.length > 0,
    `seed ${seed.id ?? "<unknown>"}: sourceTrail must be a non-empty array`,
    errors
  );
  if (!Array.isArray(value)) return;
  value.forEach((entry, index) => {
    const label = `seed ${seed.id ?? "<unknown>"}: sourceTrail[${index}]`;
    validateExactKeys(entry, requiredSourceTrailKeys, label, errors);
    if (!isPlainObject(entry)) return;
    ensure(
      typeof entry.label === "string" && entry.label.trim().length > 0,
      `${label}.label must be a non-empty string`,
      errors
    );
    ensure(
      typeof entry.url === "string" && entry.url.trim().length > 0,
      `${label}.url must be a non-empty string`,
      errors
    );
  });
}

function validateGenreRemixes(seed, errors) {
  const value = seed.genreRemixes;
  ensure(
    Array.isArray(value) && value.length > 0,
    `seed ${seed.id ?? "<unknown>"}: genreRemixes must be a non-empty array`,
    errors
  );
  if (!Array.isArray(value)) return;
  value.forEach((entry, index) => {
    const label = `seed ${seed.id ?? "<unknown>"}: genreRemixes[${index}]`;
    validateExactKeys(entry, requiredGenreRemixKeys, label, errors);
    if (!isPlainObject(entry)) return;
    ensure(
      typeof entry.genre === "string" && entry.genre.trim().length > 0,
      `${label}.genre must be a non-empty string`,
      errors
    );
    ensure(
      typeof entry.angle === "string" && entry.angle.trim().length > 0,
      `${label}.angle must be a non-empty string`,
      errors
    );
    ensure(
      typeof entry.prompt === "string" && entry.prompt.trim().length > 0,
      `${label}.prompt must be a non-empty string`,
      errors
    );
  });
}

function validateSeed(seed, errors) {
  if (!isPlainObject(seed)) {
    errors.push("seed entry must be an object");
    return;
  }

  validateExactKeys(seed, requiredSeedKeys, `seed ${seed.id ?? "<unknown>"}`, errors);
  requiredSeedKeys.forEach((key) => {
    if (
      [
        "sourceTrail",
        "storyDNA",
        "charactersForces",
        "tags",
        "genreRemixes",
        "whatIfDivergences",
      ].includes(key)
    )
      return;
    validateStringField(seed, key, errors);
  });
  validateSourceTrail(seed, errors);
  validateStringArray(seed, "storyDNA", errors);
  validateStringArray(seed, "charactersForces", errors);
  validateStringArray(seed, "tags", errors);
  validateStringArray(seed, "whatIfDivergences", errors);
  validateGenreRemixes(seed, errors);
}

async function main() {
  const errors = [];
  const index = JSON.parse(await fs.readFile(indexPath, "utf8"));
  const seedFiles = Array.isArray(index.seedFiles) ? index.seedFiles : [];

  ensure(seedFiles.length > 0, "public/seeds/index.json must list at least one seed file", errors);

  for (const fileName of seedFiles) {
    const filePath = path.join(seedDir, fileName);
    let seed;
    try {
      seed = JSON.parse(await fs.readFile(filePath, "utf8"));
    } catch (error) {
      errors.push(`${fileName}: unable to parse JSON`);
      continue;
    }
    validateSeed(seed, errors);
  }

  if (errors.length) {
    throw new Error(`Inspiration seed validation failed:\n- ${errors.join("\n- ")}`);
  }

  console.log(`Validated ${seedFiles.length} inspiration seed files`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
