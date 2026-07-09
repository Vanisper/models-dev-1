import Link from "next/link";
import type { ModelListFilters } from "@/lib/catalog/types";

type Props = {
  filters: ModelListFilters;
  labs: { id: string; name: string }[];
  families: string[];
  modalities: string[];
  resultCount: number;
};

function buildHref(base: ModelListFilters, patch: Partial<ModelListFilters>) {
  const next: ModelListFilters = { ...base, ...patch };
  const params = new URLSearchParams();
  if (next.q) params.set("q", next.q);
  if (next.lab) params.set("lab", next.lab);
  if (next.family) params.set("family", next.family);
  if (next.modality) params.set("modality", next.modality);
  if (next.sort && next.sort !== "release") params.set("sort", next.sort);
  if (next.reasoning) params.set("reasoning", "1");
  if (next.toolCall) params.set("toolCall", "1");
  if (next.openWeights) params.set("openWeights", "1");
  if (next.attachment) params.set("attachment", "1");
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

function Toggle({
  active,
  href,
  children,
}: {
  active: boolean;
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-xs transition ${
        active
          ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-300"
      }`}
    >
      {children}
    </Link>
  );
}

export function FilterBar({ filters, labs, families, modalities, resultCount }: Props) {
  return (
    <div className="space-y-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <form className="flex flex-col gap-3 sm:flex-row" action="/" method="get">
        {filters.lab && <input type="hidden" name="lab" value={filters.lab} />}
        {filters.family && <input type="hidden" name="family" value={filters.family} />}
        {filters.modality && <input type="hidden" name="modality" value={filters.modality} />}
        {filters.sort && filters.sort !== "release" && (
          <input type="hidden" name="sort" value={filters.sort} />
        )}
        {filters.reasoning && <input type="hidden" name="reasoning" value="1" />}
        {filters.toolCall && <input type="hidden" name="toolCall" value="1" />}
        {filters.openWeights && <input type="hidden" name="openWeights" value="1" />}
        {filters.attachment && <input type="hidden" name="attachment" value="1" />}
        <input
          name="q"
          defaultValue={filters.q ?? ""}
          placeholder="Search models, labs, families..."
          className="h-10 flex-1 rounded-lg border border-zinc-200 bg-zinc-50 px-3 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          Search
        </button>
      </form>

      <div className="flex flex-wrap items-center gap-2">
        <Toggle
          active={!!filters.reasoning}
          href={buildHref(filters, { reasoning: filters.reasoning ? undefined : true })}
        >
          Reasoning
        </Toggle>
        <Toggle
          active={!!filters.toolCall}
          href={buildHref(filters, { toolCall: filters.toolCall ? undefined : true })}
        >
          Tools
        </Toggle>
        <Toggle
          active={!!filters.openWeights}
          href={buildHref(filters, { openWeights: filters.openWeights ? undefined : true })}
        >
          Open weights
        </Toggle>
        <Toggle
          active={!!filters.attachment}
          href={buildHref(filters, { attachment: filters.attachment ? undefined : true })}
        >
          Attachments
        </Toggle>
      </div>

      <form action="/" method="get" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {filters.q && <input type="hidden" name="q" value={filters.q} />}
        {filters.reasoning && <input type="hidden" name="reasoning" value="1" />}
        {filters.toolCall && <input type="hidden" name="toolCall" value="1" />}
        {filters.openWeights && <input type="hidden" name="openWeights" value="1" />}
        {filters.attachment && <input type="hidden" name="attachment" value="1" />}
        <label className="block text-xs text-zinc-500">
          Lab
          <select
            name="lab"
            defaultValue={filters.lab ?? ""}
            className="mt-1 h-9 w-full rounded-lg border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">All labs</option>
            {labs.map((lab) => (
              <option key={lab.id} value={lab.id}>
                {lab.name}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-zinc-500">
          Family
          <select
            name="family"
            defaultValue={filters.family ?? ""}
            className="mt-1 h-9 w-full rounded-lg border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">All families</option>
            {families.map((family) => (
              <option key={family} value={family}>
                {family}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-zinc-500">
          Input modality
          <select
            name="modality"
            defaultValue={filters.modality ?? ""}
            className="mt-1 h-9 w-full rounded-lg border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">Any</option>
            {modalities.map((modality) => (
              <option key={modality} value={modality}>
                {modality}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-zinc-500">
          Sort
          <select
            name="sort"
            defaultValue={filters.sort ?? "release"}
            className="mt-1 h-9 w-full rounded-lg border border-zinc-200 bg-white px-2 text-sm dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="release">Release date</option>
            <option value="name">Name</option>
            <option value="context">Context size</option>
            <option value="price">Cheapest price</option>
          </select>
        </label>
        <div className="flex items-center justify-between gap-3 sm:col-span-2 lg:col-span-4">
          <p className="text-sm text-zinc-500">{resultCount} models</p>
          <div className="flex gap-2">
            <Link
              href="/"
              className="h-9 rounded-lg border border-zinc-200 px-3 text-sm leading-9 text-zinc-600 dark:border-zinc-700"
            >
              Reset
            </Link>
            <button
              type="submit"
              className="h-9 rounded-lg bg-zinc-900 px-3 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
            >
              Apply
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
