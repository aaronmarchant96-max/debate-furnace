export async function loadSeedLibrary() {
  const indexResponse = await fetch("/seeds/index.json", { cache: "no-store" });
  if (!indexResponse.ok) {
    throw new Error(`Unable to load seed index: ${indexResponse.status}`);
  }

  const index = await indexResponse.json();
  const files = Array.isArray(index?.seedFiles) ? index.seedFiles : [];

  if (!files.length) {
    throw new Error("Seed index does not list any seed files.");
  }

  const seeds = await Promise.all(
    files.map(async (file) => {
      const response = await fetch(`/seeds/${file}`, { cache: "no-store" });
      if (!response.ok) {
        throw new Error(`Unable to load seed file ${file}: ${response.status}`);
      }
      return response.json();
    })
  );

  return seeds.filter(Boolean);
}
