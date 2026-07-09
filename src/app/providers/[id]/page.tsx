import Link from "next/link";
import { notFound } from "next/navigation";
import { getProviderById } from "@/lib/catalog/fetch";
import { formatUsdPerMillion, modelPath } from "@/lib/catalog/format";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { id } = await params;
  const provider = await getProviderById(decodeURIComponent(id));
  return { title: provider?.name ?? "Provider" };
}

export default async function ProviderDetailPage({ params }: { params: Params }) {
  const { id } = await params;
  const provider = await getProviderById(decodeURIComponent(id));
  if (!provider) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="text-sm text-zinc-500">
          <Link href="/providers" className="hover:underline">
            Providers
          </Link>
          <span className="mx-2">/</span>
          <span>{provider.id}</span>
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{provider.name}</h1>
        <div className="flex flex-wrap gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          {provider.api && (
            <div>
              <span className="text-zinc-500">API: </span>
              <span className="font-mono text-xs">{provider.api}</span>
            </div>
          )}
          {provider.npm && (
            <div>
              <span className="text-zinc-500">npm: </span>
              <span className="font-mono text-xs">{provider.npm}</span>
            </div>
          )}
          {provider.doc && (
            <a
              href={provider.doc}
              target="_blank"
              rel="noreferrer"
              className="text-sky-600 hover:underline dark:text-sky-400"
            >
              Documentation
            </a>
          )}
        </div>
        {provider.env && provider.env.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {provider.env.map((env) => (
              <code
                key={env}
                className="rounded bg-zinc-100 px-2 py-1 text-xs dark:bg-zinc-900"
              >
                {env}
              </code>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
            <tr>
              <th className="px-4 py-3 font-medium">Model</th>
              <th className="px-4 py-3 font-medium">Input / 1M</th>
              <th className="px-4 py-3 font-medium">Output / 1M</th>
              <th className="px-4 py-3 font-medium">Cache read</th>
              <th className="px-4 py-3 font-medium">Cache write</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-900 dark:bg-zinc-950">
            {provider.models.map((model) => (
              <tr key={model.id}>
                <td className="px-4 py-3">
                  <Link href={modelPath(model.id)} className="font-medium hover:underline">
                    {model.name}
                  </Link>
                  <div className="font-mono text-xs text-zinc-500">{model.id}</div>
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatUsdPerMillion(model.cost?.input)}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatUsdPerMillion(model.cost?.output)}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatUsdPerMillion(model.cost?.cacheRead)}
                </td>
                <td className="px-4 py-3 tabular-nums">
                  {formatUsdPerMillion(model.cost?.cacheWrite)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
