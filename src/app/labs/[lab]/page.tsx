import Link from "next/link";
import { notFound } from "next/navigation";
import { ModelTable } from "@/components/model-table";
import { getLabById } from "@/lib/catalog/fetch";

type Params = Promise<{ lab: string }>;

export async function generateMetadata({ params }: { params: Params }) {
  const { lab: labId } = await params;
  const lab = await getLabById(decodeURIComponent(labId));
  return { title: lab?.name ?? "Lab" };
}

export default async function LabDetailPage({ params }: { params: Params }) {
  const { lab: labId } = await params;
  const lab = await getLabById(decodeURIComponent(labId));
  if (!lab) notFound();

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="text-sm text-zinc-500">
          <Link href="/labs" className="hover:underline">
            Labs
          </Link>
          <span className="mx-2">/</span>
          <span>{lab.id}</span>
        </div>
        <div className="flex items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={lab.logo}
            alt=""
            width={48}
            height={48}
            className="h-12 w-12 rounded-lg bg-zinc-100 object-contain p-1 dark:bg-zinc-900"
          />
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">{lab.name}</h1>
            <p className="mt-1 text-sm text-zinc-500">{lab.modelCount} models</p>
          </div>
        </div>
        {lab.description && (
          <p className="max-w-3xl text-zinc-600 dark:text-zinc-300">{lab.description}</p>
        )}
      </div>
      <ModelTable models={lab.models} />
    </div>
  );
}
