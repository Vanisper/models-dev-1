import Link from "next/link";

const links = [
  { href: "/", label: "Models" },
  { href: "/labs", label: "Labs" },
  { href: "/providers", label: "Providers" },
];

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-200 bg-white/90 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/90">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-xs text-white dark:bg-zinc-100 dark:text-zinc-900">
            M
          </span>
          <span>models.dev explorer</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://models.dev"
            target="_blank"
            rel="noreferrer"
            className="rounded-md px-3 py-1.5 text-zinc-500 transition hover:bg-zinc-100 hover:text-zinc-900 dark:hover:bg-zinc-900 dark:hover:text-zinc-50"
          >
            Source
          </a>
        </nav>
      </div>
    </header>
  );
}
