import { displayDateTime } from "./format";
import type { ModelCatalogEntry, ModelListFilters } from "./types";

export function filterModels(models: ModelCatalogEntry[], filters: ModelListFilters) {
  const q = filters.q?.trim().toLowerCase();
  let result = models;

  if (q) {
    result = result.filter((model) => {
      const haystack = [
        model.id,
        model.name,
        model.lab,
        model.family,
        model.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  if (filters.lab) {
    result = result.filter((model) => model.lab === filters.lab);
  }

  if (filters.family) {
    result = result.filter((model) => model.family === filters.family);
  }

  if (filters.reasoning) {
    result = result.filter((model) => model.reasoning);
  }

  if (filters.toolCall) {
    result = result.filter((model) => model.toolCall);
  }

  if (filters.openWeights) {
    result = result.filter((model) => model.openWeights);
  }

  if (filters.attachment) {
    result = result.filter((model) => model.attachment);
  }

  if (filters.modality) {
    result = result.filter((model) => model.modalities.input.includes(filters.modality!));
  }

  const sort = filters.sort ?? "release";
  return [...result].sort((a, b) => {
    switch (sort) {
      case "name":
        return a.name.localeCompare(b.name);
      case "context":
        return (b.limit?.context ?? 0) - (a.limit?.context ?? 0);
      case "price": {
        const pa = a.costSummary?.cheapest.cost.input ?? Number.POSITIVE_INFINITY;
        const pb = b.costSummary?.cheapest.cost.input ?? Number.POSITIVE_INFINITY;
        return pa - pb;
      }
      case "release":
      default:
        return displayDateTime(b.releaseDate) - displayDateTime(a.releaseDate);
    }
  });
}

export function uniqueFamilies(models: ModelCatalogEntry[]) {
  return [...new Set(models.map((model) => model.family).filter(Boolean) as string[])].sort();
}

export function uniqueModalities(models: ModelCatalogEntry[]) {
  const set = new Set<string>();
  models.forEach((model) => model.modalities.input.forEach((item) => set.add(item)));
  return [...set].sort();
}

export function parseBoolParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) value = value[0];
  return value === "1" || value === "true";
}

export function parseStringParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) value = value[0];
  return value?.trim() || undefined;
}
