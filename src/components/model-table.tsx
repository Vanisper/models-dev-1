import Link from "next/link";
import { CapabilityTags } from "./badge";
import {
  formatCostRange,
  formatDate,
  formatTokens,
  modelPath,
} from "@/lib/catalog/format";
import type { ModelCatalogEntry } from "@/lib/catalog/types";

export function ModelTable({ models }: { models: ModelCatalogEntry[] }) {
  if (models.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-300 px-6 py-16 text-center text-sm text-zinc-500 dark:border-zinc-700">
        No models match the current filters.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
            <tr>
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 font-medium">Lab</th>
              <th className="px-4 py-3 font-medium">Context</th>
              <th className="px-4 py-3 font-medium">Price</th>
              <th className="px-4 py-3 font-medium">Capabilities</th>
              <th className="px-4 py-3 font-medium">Released</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-900 dark:bg-zinc-950">
            {models.map((model) => (
              <tr key={model.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40">
                <td className="px-4 py-3">
                  <Link
                    href={modelPath(model.id)}
                    className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                  >
                    {model.name}
                  </Link>
                  <div className="mt-0.5 font-mono text-xs text-zinc-500">{model.id}</div>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/labs/${model.lab}`}
                    className="text-zinc-700 hover:underline dark:text-zinc-300"
                  >
                    {model.lab}
                  </Link>
                  {model.family && (
                    <div className="text-xs text-zinc-500">{model.family}</div>
                  )}
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {formatTokens(model.limit?.context)}
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-700 dark:text-zinc-300">
                  {formatCostRange(model.costSummary?.min, model.costSummary?.max)}
                  {model.costSummary && model.costSummary.providerCount > 1 && (
                    <div className="text-xs text-zinc-500">
                      {model.costSummary.providerCount} providers
                    </div>
                  )}
                </td>
                <td className="px-4 py-3">
                  <CapabilityTags
                    reasoning={model.reasoning}
                    toolCall={model.toolCall}
                    openWeights={model.openWeights}
                    attachment={model.attachment}
                  />
                </td>
                <td className="px-4 py-3 tabular-nums text-zinc-600 dark:text-zinc-400">
                  {formatDate(model.releaseDate)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
