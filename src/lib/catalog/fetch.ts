import { cache } from "react";
import { readFile } from "fs/promises";
import path from "path";
import {
  modelCatalogLabSourceUrl,
  modelCatalogPricingUrl,
  modelCatalogSourceUrl,
} from "./types";
import { buildModelCatalog, readLabSearchIndex } from "./parse";
import { catalogIdKey } from "./format";
import type { ModelCatalog } from "./types";

const MEMORY_TTL_MS = 60 * 60 * 1000;

let memoryCache:
  | {
      expiresAt: number;
      catalog: ModelCatalog;
    }
  | undefined;

async function fetchJson(url: string): Promise<unknown | undefined> {
  try {
    // Large payloads exceed Next.js 2MB data cache; use plain fetch + process memory TTL.
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return undefined;
    return (await response.json()) as unknown;
  } catch {
    return undefined;
  }
}

async function fetchLabIndex(url: string): Promise<unknown | undefined> {
  try {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) return undefined;
    const html = await response.text();
    return readLabSearchIndex(html);
  } catch {
    return undefined;
  }
}

async function loadFallbackCatalog(): Promise<unknown | undefined> {
  try {
    const filePath = path.join(process.cwd(), "public", "data", "catalog.json");
    const text = await readFile(filePath, "utf8");
    return JSON.parse(text) as unknown;
  } catch {
    return undefined;
  }
}

async function loadModelCatalog(): Promise<ModelCatalog> {
  if (memoryCache && memoryCache.expiresAt > Date.now()) {
    return memoryCache.catalog;
  }

  const [catalog, pricing, labs] = await Promise.all([
    fetchJson(modelCatalogSourceUrl),
    fetchJson(modelCatalogPricingUrl),
    fetchLabIndex(modelCatalogLabSourceUrl),
  ]);

  let result: ModelCatalog;
  if (catalog) {
    result = buildModelCatalog(catalog, pricing, labs, { source: "live" });
  } else {
    const fallback = await loadFallbackCatalog();
    if (fallback) {
      result = buildModelCatalog(fallback, pricing, labs, { source: "fallback" });
    } else {
      result = {
        models: [],
        labs: [],
        providers: [],
        fetchedAt: new Date().toISOString(),
        source: "fallback",
      };
    }
  }

  memoryCache = {
    expiresAt: Date.now() + MEMORY_TTL_MS,
    catalog: result,
  };
  return result;
}

export const getModelCatalog = cache(async (): Promise<ModelCatalog> => {
  return loadModelCatalog();
});

export async function getModelById(id: string) {
  const catalog = await getModelCatalog();
  const normalized = catalogIdKey(id);
  return (
    catalog.models.find((model) => catalogIdKey(model.id) === normalized) ??
    catalog.models.find((model) => model.id.toLowerCase() === id.trim().toLowerCase())
  );
}

export async function getLabById(lab: string) {
  const catalog = await getModelCatalog();
  const id = lab.trim().toLowerCase();
  return catalog.labs.find((entry) => entry.id === id);
}

export async function getProviderById(provider: string) {
  const catalog = await getModelCatalog();
  const id = provider.trim().toLowerCase();
  return catalog.providers.find((entry) => entry.id === id);
}
