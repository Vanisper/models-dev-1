export default function Loading() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 w-48 rounded bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-32 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
      <div className="h-64 rounded-xl bg-zinc-200 dark:bg-zinc-800" />
    </div>
  );
}
