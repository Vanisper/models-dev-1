import Link from "next/link";
import { notFound } from "next/navigation";
import { CapabilityTags, Badge } from "@/components/badge";
import { getModelById } from "@/lib/catalog/fetch";
import {
  formatCostRange,
  formatDate,
  formatTokens,
  formatUsdPerMillion,
} from "@/lib/catalog/format";

type Params = Promise<{ id: string[] }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const modelId = id.map(decodeURIComponent).join("/");
  const model = await getModelById(modelId);
  return {
    title: model?.name ?? "Model",
  };
}

export default async function ModelDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const modelId = id.map(decodeURIComponent).join("/");
  const model = await getModelById(modelId);
  if (!model) notFound();

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-500">
          <Link href="/" className="hover:underline">
            Models
          </Link>
          <span>/</span>
          <Link href={`/labs/${model.lab}`} className="hover:underline">
            {model.lab}
          </Link>
          <span>/</span>
          <span className="text-zinc-800 dark:text-zinc-200">{model.slug}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{model.name}</h1>
        <p className="font-mono text-sm text-zinc-500">{model.id}</p>
        {model.description && (
          <p className="max-w-3xl text-zinc-600 dark:text-zinc-300">{model.description}</p>
        )}
        <CapabilityTags
          reasoning={model.reasoning}
          toolCall={model.toolCall}
          openWeights={model.openWeights}
          attachment={model.attachment}
          temperature={model.temperature}
          structuredOutput={model.structuredOutput}
        />
      </div>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Context" value={formatTokens(model.limit?.context)} />
        <Stat label="Max output" value={formatTokens(model.limit?.output)} />
        <Stat
          label="Price range"
          value={formatCostRange(model.costSummary?.min, model.costSummary?.max)}
        />
        <Stat label="Released" value={formatDate(model.releaseDate)} />
        <Stat label="Family" value={model.family ?? "—"} />
        <Stat label="Knowledge" value={model.knowledge ?? "—"} />
        <Stat label="Last updated" value={formatDate(model.lastUpdated)} />
        <Stat
          label="Providers"
          value={String(model.costSummary?.providerCount ?? model.providers.length ?? 0)}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Modalities</h2>
        <div className="flex flex-wrap gap-2">
          {model.modalities.input.map((item) => (
            <Badge key={`in-${item}`} tone="blue">
              in: {item}
            </Badge>
          ))}
          {model.modalities.output.map((item) => (
            <Badge key={`out-${item}`} tone="green">
              out: {item}
            </Badge>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Provider pricing</h2>
        {model.providers.length === 0 ? (
          <p className="text-sm text-zinc-500">No provider pricing found for this model.</p>
        ) : (
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Provider</th>
                  <th className="px-4 py-3 font-medium">Input / 1M</th>
                  <th className="px-4 py-3 font-medium">Output / 1M</th>
                  <th className="px-4 py-3 font-medium">Cache read</th>
                  <th className="px-4 py-3 font-medium">Cache write</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-900 dark:bg-zinc-950">
                {model.providers.map((offer) => (
                  <tr key={offer.providerId}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/providers/${offer.providerId}`}
                        className="font-medium hover:underline"
                      >
                        {offer.providerName}
                      </Link>
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatUsdPerMillion(offer.cost?.input)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatUsdPerMillion(offer.cost?.output)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatUsdPerMillion(offer.cost?.cacheRead)}
                    </td>
                    <td className="px-4 py-3 tabular-nums">
                      {formatUsdPerMillion(offer.cost?.cacheWrite)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {model.benchmarks.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Benchmarks</h2>
          <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
            <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                  <th className="px-4 py-3 font-medium">Metric</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-900 dark:bg-zinc-950">
                {model.benchmarks.map((bench, index) => (
                  <tr key={`${bench.name}-${index}`}>
                    <td className="px-4 py-3">{bench.name}</td>
                    <td className="px-4 py-3 tabular-nums">{bench.score}</td>
                    <td className="px-4 py-3 text-zinc-500">{bench.metric ?? "—"}</td>
                    <td className="px-4 py-3">
                      {bench.source ? (
                        <a
                          href={bench.source}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sky-600 hover:underline dark:text-sky-400"
                        >
                          link
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {model.weights.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Weights</h2>
          <ul className="space-y-2">
            {model.weights.map((weight) => (
              <li key={weight.url}>
                <a
                  href={weight.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sky-600 hover:underline dark:text-sky-400"
                >
                  {weight.label}
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="mt-1 text-lg font-medium tabular-nums">{value}</div>
    </div>
  );
}
