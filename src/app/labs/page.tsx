import Link from "next/link";
import { getModelCatalog } from "@/lib/catalog/fetch";

export const metadata = {
  title: "Labs",
};

export default async function LabsPage() {
  const catalog = await getModelCatalog();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Labs</h1>
        <p className="mt-1 text-sm text-zinc-500">{catalog.labs.length} labs</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.labs.map((lab) => (
          <Link
            key={lab.id}
            href={`/labs/${lab.id}`}
            className="rounded-xl border border-zinc-200 bg-white p-5 transition hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-700"
          >
            <div className="flex items-start gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lab.logo}
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 rounded bg-zinc-100 object-contain p-1 dark:bg-zinc-900"
              />
              <div className="min-w-0">
                <h2 className="font-semibold">{lab.name}</h2>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {lab.modelCount} models
                  {lab.providerCount !== undefined ? ` · ${lab.providerCount} providers` : ""}
                </p>
              </div>
            </div>
            {lab.description && (
              <p className="mt-3 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-400">
                {lab.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
