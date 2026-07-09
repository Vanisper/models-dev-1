import {
  catalogIdKey,
  catalogLabSlug,
  catalogSlug,
  compareCostCheapest,
  displayDateTime,
  formatCatalogLabName,
  labLogoUrl,
} from "./format";
import type {
  ModelCatalog,
  ModelCatalogBenchmark,
  ModelCatalogCost,
  ModelCatalogEntry,
  ModelCatalogLab,
  ModelCatalogProvider,
  ModelCatalogWeight,
  ModelCostSummary,
  ModelProviderOffer,
} from "./types";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function numberValue(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function booleanValue(value: unknown) {
  return value === true;
}

function stringArrayValue(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim() !== "")
    : [];
}

function readCatalogCost(value: unknown): ModelCatalogCost | undefined {
  if (!isRecord(value)) return undefined;
  const input = numberValue(value.input);
  const output = numberValue(value.output);
  if (input === undefined || output === undefined) return undefined;
  return {
    input,
    output,
    cacheRead: numberValue(value.cache_read),
    cacheWrite: numberValue(value.cache_write),
  };
}

function readCatalogLimit(value: unknown) {
  if (!isRecord(value)) return undefined;
  return {
    context: numberValue(value.context),
    output: numberValue(value.output),
  };
}

function readCatalogModalities(value: unknown) {
  if (!isRecord(value)) return { input: [] as string[], output: [] as string[] };
  return {
    input: stringArrayValue(value.input),
    output: stringArrayValue(value.output),
  };
}

function readCatalogWeights(value: unknown): ModelCatalogWeight[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const label = stringValue(item.label);
    const url = stringValue(item.url);
    return label && url ? [{ label, url }] : [];
  });
}

function readCatalogBenchmarks(value: unknown): ModelCatalogBenchmark[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const name = stringValue(item.name);
    const score = numberValue(item.score);
    return name && score !== undefined
      ? [
          {
            name,
            score,
            metric: stringValue(item.metric),
            harness: stringValue(item.harness),
            variant: stringValue(item.variant),
            dataset: stringValue(item.dataset),
            version: stringValue(item.version),
            source: stringValue(item.source),
          },
        ]
      : [];
  });
}

function readModelCatalogEntry(value: unknown): ModelCatalogEntry[] {
  if (!isRecord(value)) return [];
  const id = stringValue(value.id);
  const name = stringValue(value.name);
  const lab = id?.split("/")[0];
  const slug = id?.split("/").slice(1).join("/");
  if (!id || !name || !lab || !slug) return [];
  return [
    {
      id,
      lab: catalogLabSlug(lab),
      slug: catalogSlug(slug),
      name,
      description: stringValue(value.description),
      family: stringValue(value.family),
      knowledge: stringValue(value.knowledge),
      releaseDate: stringValue(value.release_date),
      lastUpdated: stringValue(value.last_updated),
      limit: readCatalogLimit(value.limit),
      modalities: readCatalogModalities(value.modalities),
      openWeights: booleanValue(value.open_weights),
      reasoning: booleanValue(value.reasoning),
      toolCall: booleanValue(value.tool_call),
      attachment: booleanValue(value.attachment),
      temperature: booleanValue(value.temperature),
      structuredOutput: booleanValue(value.structured_output),
      cost: readCatalogCost(value.cost),
      costByProvider: {},
      providers: [],
      weights: readCatalogWeights(value.weights),
      benchmarks: readCatalogBenchmarks(value.benchmarks),
    },
  ];
}

function readCatalogModels(payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (!isRecord(payload)) return [];
  if (Array.isArray(payload.models)) return payload.models;
  if (isRecord(payload.models)) return Object.values(payload.models);
  return Object.values(payload);
}

function buildCostSummary(
  costByProvider: Record<string, ModelCatalogCost>,
): ModelCostSummary | undefined {
  const entries = Object.entries(costByProvider);
  if (entries.length === 0) return undefined;

  const sorted = [...entries].sort((a, b) => compareCostCheapest(a[1], b[1]));
  const [cheapestProviderId, cheapestCost] = sorted[0];

  const min: ModelCatalogCost = {
    input: Math.min(...entries.map(([, c]) => c.input)),
    output: Math.min(...entries.map(([, c]) => c.output)),
  };
  const max: ModelCatalogCost = {
    input: Math.max(...entries.map(([, c]) => c.input)),
    output: Math.max(...entries.map(([, c]) => c.output)),
  };

  const cacheReads = entries
    .map(([, c]) => c.cacheRead)
    .filter((v): v is number => v !== undefined);
  const cacheWrites = entries
    .map(([, c]) => c.cacheWrite)
    .filter((v): v is number => v !== undefined);
  if (cacheReads.length) {
    min.cacheRead = Math.min(...cacheReads);
    max.cacheRead = Math.max(...cacheReads);
  }
  if (cacheWrites.length) {
    min.cacheWrite = Math.min(...cacheWrites);
    max.cacheWrite = Math.max(...cacheWrites);
  }

  return {
    min,
    max,
    providerCount: entries.length,
    cheapest: { providerId: cheapestProviderId, cost: cheapestCost },
  };
}

type ProviderCostIndex = {
  costsByModel: Map<string, Record<string, ModelCatalogCost>>;
  offersByModel: Map<string, ModelProviderOffer[]>;
  providers: ModelCatalogProvider[];
  providerNames: Map<string, string>;
};

function readPricingPayload(payload: unknown): ProviderCostIndex {
  const costsByModel = new Map<string, Record<string, ModelCatalogCost>>();
  const offersByModel = new Map<string, ModelProviderOffer[]>();
  const providers: ModelCatalogProvider[] = [];
  const providerNames = new Map<string, string>();

  if (!isRecord(payload)) {
    return { costsByModel, offersByModel, providers, providerNames };
  }

  for (const [providerKey, providerValue] of Object.entries(payload)) {
    if (!isRecord(providerValue)) continue;
    const providerId = catalogSlug(stringValue(providerValue.id) ?? providerKey);
    const providerName = stringValue(providerValue.name) ?? providerId;
    providerNames.set(providerId, providerName);

    const modelsValue = providerValue.models;
    const modelEntries: { id: string; name: string; cost?: ModelCatalogCost }[] = [];

    if (isRecord(modelsValue)) {
      for (const modelValue of Object.values(modelsValue)) {
        if (!isRecord(modelValue)) continue;
        const rawId = stringValue(modelValue.id);
        if (!rawId) continue;
        const modelId = catalogIdKey(rawId);
        const cost = readCatalogCost(modelValue.cost);
        const name = stringValue(modelValue.name) ?? rawId;
        modelEntries.push({ id: modelId, name, cost });

        if (cost) {
          const bucket = costsByModel.get(modelId) ?? {};
          bucket[providerId] = cost;
          costsByModel.set(modelId, bucket);
        }

        const offers = offersByModel.get(modelId) ?? [];
        offers.push({ providerId, providerName, cost });
        offersByModel.set(modelId, offers);
      }
    }

    providers.push({
      id: providerId,
      name: providerName,
      env: stringArrayValue(providerValue.env),
      npm: stringValue(providerValue.npm),
      api: stringValue(providerValue.api),
      doc: stringValue(providerValue.doc),
      modelCount: modelEntries.length,
      models: modelEntries.toSorted((a, b) => a.name.localeCompare(b.name)),
    });
  }

  providers.sort((a, b) => a.name.localeCompare(b.name));
  return { costsByModel, offersByModel, providers, providerNames };
}

function readCatalogLabDescriptions(...payloads: unknown[]) {
  const descriptions = new Map<string, string>();
  const logos = new Map<string, string>();
  const providerCounts = new Map<string, number>();

  const add = (value: unknown, fallbackId?: string) => {
    if (!isRecord(value)) return;
    const description = stringValue(value.description);
    const id = stringValue(value.id) ?? fallbackId;
    const name = stringValue(value.name) ?? stringValue(value.title);
    const logo = stringValue(value.logo);
    const providerCount = numberValue(value.providerCount);
    const keys = [id, name].filter(Boolean) as string[];
    keys.forEach((key) => {
      const slug = catalogLabSlug(key);
      if (description) descriptions.set(slug, description);
      if (logo) logos.set(slug, logo.startsWith("http") ? logo : `https://models.dev${logo}`);
      if (providerCount !== undefined) providerCounts.set(slug, providerCount);
    });
  };

  const addCollection = (value: unknown) => {
    if (Array.isArray(value)) {
      value.forEach((item) => add(item));
      return;
    }
    if (!isRecord(value)) return;
    Object.entries(value).forEach(([key, item]) => add(item, key));
  };

  payloads.forEach((payload) => {
    if (Array.isArray(payload)) {
      payload.forEach((item) => add(item));
      return;
    }
    if (!isRecord(payload)) return;
    addCollection(payload.labs);
    addCollection(payload.providers);
    Object.entries(payload).forEach(([key, value]) => add(value, key));
  });

  return { descriptions, logos, providerCounts };
}

export function readLabSearchIndex(html: string) {
  const match = /<script[^>]*id=["']search-index["'][^>]*>([\s\S]*?)<\/script>/.exec(html);
  if (!match) return undefined;
  try {
    const parsed = JSON.parse(match[1]) as unknown;
    if (!Array.isArray(parsed)) return undefined;
    return parsed.filter((item) => isRecord(item) && item.type === "lab");
  } catch {
    return undefined;
  }
}

export function buildModelCatalog(
  catalogPayload: unknown,
  pricingPayload?: unknown,
  labPayload?: unknown,
  options?: { source?: "live" | "fallback" },
): ModelCatalog {
  const pricing = readPricingPayload(pricingPayload);
  const labMeta = readCatalogLabDescriptions(catalogPayload, pricingPayload, labPayload);

  const models = readCatalogModels(catalogPayload)
    .flatMap(readModelCatalogEntry)
    .map((model) => {
      const key = catalogIdKey(model.id);
      const altKey = `${model.lab}/${model.slug}`;
      const costByProvider =
        pricing.costsByModel.get(key) ??
        pricing.costsByModel.get(altKey) ??
        (model.cost ? { catalog: model.cost } : {});
      const costSummary = buildCostSummary(costByProvider);
      const providers =
        pricing.offersByModel.get(key) ??
        pricing.offersByModel.get(altKey) ??
        [];

      return {
        ...model,
        cost: costSummary?.cheapest.cost ?? model.cost,
        costByProvider,
        costSummary,
        providers: providers.toSorted((a, b) => {
          if (a.cost && b.cost) return compareCostCheapest(a.cost, b.cost);
          if (a.cost) return -1;
          if (b.cost) return 1;
          return a.providerName.localeCompare(b.providerName);
        }),
      };
    })
    .toSorted(
      (a, b) =>
        a.lab.localeCompare(b.lab) ||
        displayDateTime(b.releaseDate) - displayDateTime(a.releaseDate),
    );

  const labs: ModelCatalogLab[] = Object.values(
    models.reduce<Record<string, ModelCatalogLab>>((result, model) => {
      const existing = result[model.lab];
      result[model.lab] = {
        id: model.lab,
        name: formatCatalogLabName(model.lab),
        description: existing?.description ?? labMeta.descriptions.get(model.lab),
        logo: existing?.logo ?? labMeta.logos.get(model.lab) ?? labLogoUrl(model.lab),
        providerCount: existing?.providerCount ?? labMeta.providerCounts.get(model.lab),
        modelCount: (existing?.modelCount ?? 0) + 1,
        models: [...(existing?.models ?? []), model],
      };
      return result;
    }, {}),
  ).toSorted((a, b) => a.name.localeCompare(b.name));

  return {
    models,
    labs,
    providers: pricing.providers,
    fetchedAt: new Date().toISOString(),
    source: options?.source ?? "live",
  };
}
