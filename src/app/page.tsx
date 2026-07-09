import { FilterBar } from "@/components/filter-bar";
import { ModelTable } from "@/components/model-table";
import { getModelCatalog } from "@/lib/catalog/fetch";
import {
  filterModels,
  parseBoolParam,
  parseStringParam,
  uniqueFamilies,
  uniqueModalities,
} from "@/lib/catalog/query";
import type { ModelListFilters } from "@/lib/catalog/types";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function HomePage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const catalog = await getModelCatalog();

  const sortRaw = parseStringParam(params.sort);
  const sort =
    sortRaw === "name" || sortRaw === "context" || sortRaw === "price" || sortRaw === "release"
      ? sortRaw
      : "release";

  const filters: ModelListFilters = {
    q: parseStringParam(params.q),
    lab: parseStringParam(params.lab),
    family: parseStringParam(params.family),
    modality: parseStringParam(params.modality),
    reasoning: parseBoolParam(params.reasoning) || undefined,
    toolCall: parseBoolParam(params.toolCall) || undefined,
    openWeights: parseBoolParam(params.openWeights) || undefined,
    attachment: parseBoolParam(params.attachment) || undefined,
    sort,
  };

  const models = filterModels(catalog.models, filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Models</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {catalog.models.length} models · {catalog.labs.length} labs ·{" "}
            {catalog.providers.length} providers
            {catalog.source === "fallback" ? " · offline fallback" : ""}
          </p>
        </div>
        <p className="text-xs text-zinc-400">
          Cached snapshot · {new Date(catalog.fetchedAt).toLocaleString()}
        </p>
      </div>

      <FilterBar
        filters={filters}
        labs={catalog.labs.map((lab) => ({ id: lab.id, name: lab.name }))}
        families={uniqueFamilies(catalog.models)}
        modalities={uniqueModalities(catalog.models)}
        resultCount={models.length}
      />

      <ModelTable models={models} />
    </div>
  );
}
