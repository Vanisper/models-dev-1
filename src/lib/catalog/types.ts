export const modelCatalogSourceUrl = "https://models.dev/catalog.json";
export const modelCatalogPricingUrl = "https://models.dev/api.json";
export const modelCatalogLabSourceUrl = "https://models.dev/labs";
export const modelCatalogLogoBase = "https://models.dev/logos";

export type ModelCatalogCost = {
  input: number;
  output: number;
  cacheRead?: number;
  cacheWrite?: number;
};

export type ModelCatalogBenchmark = {
  name: string;
  score: number;
  metric?: string;
  harness?: string;
  variant?: string;
  dataset?: string;
  version?: string;
  source?: string;
};

export type ModelCatalogWeight = {
  label: string;
  url: string;
};

export type ModelCostSummary = {
  min: ModelCatalogCost;
  max: ModelCatalogCost;
  providerCount: number;
  cheapest: {
    providerId: string;
    cost: ModelCatalogCost;
  };
};

export type ModelProviderOffer = {
  providerId: string;
  providerName: string;
  cost?: ModelCatalogCost;
};

export type ModelCatalogEntry = {
  id: string;
  lab: string;
  slug: string;
  name: string;
  description?: string;
  family?: string;
  knowledge?: string;
  releaseDate?: string;
  lastUpdated?: string;
  limit?: { context?: number; output?: number };
  modalities: { input: string[]; output: string[] };
  openWeights: boolean;
  reasoning: boolean;
  toolCall: boolean;
  attachment: boolean;
  temperature: boolean;
  structuredOutput: boolean;
  cost?: ModelCatalogCost;
  costByProvider: Record<string, ModelCatalogCost>;
  costSummary?: ModelCostSummary;
  providers: ModelProviderOffer[];
  weights: ModelCatalogWeight[];
  benchmarks: ModelCatalogBenchmark[];
};

export type ModelCatalogLab = {
  id: string;
  name: string;
  description?: string;
  logo?: string;
  modelCount: number;
  providerCount?: number;
  models: ModelCatalogEntry[];
};

export type ModelCatalogProvider = {
  id: string;
  name: string;
  env?: string[];
  npm?: string;
  api?: string;
  doc?: string;
  modelCount: number;
  models: {
    id: string;
    name: string;
    cost?: ModelCatalogCost;
  }[];
};

export type ModelCatalog = {
  models: ModelCatalogEntry[];
  labs: ModelCatalogLab[];
  providers: ModelCatalogProvider[];
  fetchedAt: string;
  source: "live" | "fallback";
};

export type ModelListFilters = {
  q?: string;
  lab?: string;
  family?: string;
  reasoning?: boolean;
  toolCall?: boolean;
  openWeights?: boolean;
  attachment?: boolean;
  modality?: string;
  sort?: "release" | "name" | "context" | "price";
};
