import Link from "next/link";
import { getModelCatalog } from "@/lib/catalog/fetch";

export const metadata = {
  title: "Providers",
};

export default async function ProvidersPage() {
  const catalog = await getModelCatalog();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Providers</h1>
        <p className="mt-1 text-sm text-zinc-500">{catalog.providers.length} providers</p>
      </div>
      <div className="overflow-hidden rounded-xl border border-zinc-200 dark:border-zinc-800">
        <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-900/60">
            <tr>
              <th className="px-4 py-3 font-medium">Provider</th>
              <th className="px-4 py-3 font-medium">Models</th>
              <th className="px-4 py-3 font-medium">API</th>
              <th className="px-4 py-3 font-medium">Package</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 bg-white dark:divide-zinc-900 dark:bg-zinc-950">
            {catalog.providers.map((provider) => (
              <tr key={provider.id} className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40">
                <td className="px-4 py-3">
                  <Link
                    href={`/providers/${provider.id}`}
                    className="font-medium hover:underline"
                  >
                    {provider.name}
                  </Link>
                  <div className="font-mono text-xs text-zinc-500">{provider.id}</div>
                </td>
                <td className="px-4 py-3 tabular-nums">{provider.modelCount}</td>
                <td className="max-w-xs truncate px-4 py-3 text-zinc-500">
                  {provider.api ?? "—"}
                </td>
                <td className="px-4 py-3 font-mono text-xs text-zinc-500">
                  {provider.npm ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
