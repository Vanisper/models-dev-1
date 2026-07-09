import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const modelCatalogSourceUrl = "https://models.dev/catalog.json";
const modelCatalogPricingUrl = "https://models.dev/api.json";
const modelCatalogLabSourceUrl = "https://models.dev/labs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed ${url}: ${response.status}`);
  return response.json();
}

function readLabSearchIndex(html) {
  const match = /<script[^>]*id=["']search-index["'][^>]*>([\s\S]*?)<\/script>/.exec(html);
  if (!match) return [];
  try {
    const parsed = JSON.parse(match[1]);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item) => item && item.type === "lab");
  } catch {
    return [];
  }
}

async function main() {
  const [catalog, pricing, labsHtml] = await Promise.all([
    fetchJson(modelCatalogSourceUrl),
    fetchJson(modelCatalogPricingUrl),
    fetch(modelCatalogLabSourceUrl).then((r) => r.text()),
  ]);
  const labs = readLabSearchIndex(labsHtml);

  const outDir = path.join(root, "public", "data");
  await mkdir(outDir, { recursive: true });
  await writeFile(path.join(outDir, "catalog.json"), JSON.stringify(catalog));
  await writeFile(path.join(outDir, "api.json"), JSON.stringify(pricing));
  await writeFile(path.join(outDir, "labs.json"), JSON.stringify(labs, null, 2));

  const modelCount = catalog?.models
    ? Array.isArray(catalog.models)
      ? catalog.models.length
      : Object.keys(catalog.models).length
    : 0;
  const providerCount = pricing && typeof pricing === "object" ? Object.keys(pricing).length : 0;

  console.log(
    `Synced catalog models=${modelCount}, providers=${providerCount}, labs=${labs.length}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
