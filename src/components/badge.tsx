import type { ReactNode } from "react";

export function Badge({
  children,
  tone = "default",
}: {
  children: ReactNode;
  tone?: "default" | "green" | "blue" | "amber" | "purple";
}) {
  const tones = {
    default: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
    green: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
    blue: "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300",
    amber: "bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
    purple: "bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function CapabilityTags({
  reasoning,
  toolCall,
  openWeights,
  attachment,
  temperature,
  structuredOutput,
}: {
  reasoning?: boolean;
  toolCall?: boolean;
  openWeights?: boolean;
  attachment?: boolean;
  temperature?: boolean;
  structuredOutput?: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {reasoning && <Badge tone="purple">reasoning</Badge>}
      {toolCall && <Badge tone="blue">tools</Badge>}
      {openWeights && <Badge tone="green">open weights</Badge>}
      {attachment && <Badge tone="amber">attachments</Badge>}
      {temperature && <Badge>temperature</Badge>}
      {structuredOutput && <Badge>structured</Badge>}
    </div>
  );
}
