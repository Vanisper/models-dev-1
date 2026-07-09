import type { ModelCatalogCost } from "./types";

export function catalogSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

export function catalogLabSlug(value: string) {
  const slug = catalogSlug(value);
  const aliases: Record<string, string> = {
    moonshot: "moonshotai",
    qwen: "alibaba",
    zhipu: "zhipuai",
    zai: "zhipuai",
  };
  return aliases[slug] ?? slug;
}

export function catalogIdKey(value: string) {
  return value.split("/").map(catalogSlug).join("/");
}

export function formatCatalogLabName(lab: string) {
  const known: Record<string, string> = {
    alibaba: "Alibaba",
    anthropic: "Anthropic",
    cohere: "Cohere",
    deepreinforce: "DeepReinforce",
    deepseek: "DeepSeek",
    google: "Google",
    meta: "Meta",
    meituan: "Meituan",
    microsoft: "Microsoft",
    minimax: "MiniMax",
    mistral: "Mistral",
    moonshotai: "Moonshot AI",
    nvidia: "NVIDIA",
    openai: "OpenAI",
    perplexity: "Perplexity",
    sakana: "Sakana AI",
    sarvam: "Sarvam AI",
    stepfun: "StepFun",
    tencent: "Tencent",
    xai: "xAI",
    xiaomi: "Xiaomi",
    zhipuai: "Zhipu AI",
  };
  return (
    known[catalogSlug(lab)] ??
    lab.replace(/[-_]/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase())
  );
}

export function formatUsdPerMillion(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return "—";
  if (value === 0) return "$0";
  if (value < 0.01) return `$${value.toFixed(4)}`;
  if (value < 1) return `$${value.toFixed(3)}`;
  if (value < 10) return `$${value.toFixed(2)}`;
  return `$${value.toFixed(value % 1 === 0 ? 0 : 2)}`;
}

export function formatCostRange(
  min: ModelCatalogCost | undefined,
  max: ModelCatalogCost | undefined,
) {
  if (!min) return "—";
  if (!max || min.input === max.input) {
    return `${formatUsdPerMillion(min.input)} / 1M in`;
  }
  return `${formatUsdPerMillion(min.input)}–${formatUsdPerMillion(max.input)} / 1M in`;
}

export function formatTokens(value: number | undefined) {
  if (value === undefined || !Number.isFinite(value)) return "—";
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return `${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  if (value >= 1_000) {
    const k = value / 1_000;
    return `${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}K`;
  }
  return String(value);
}

export function formatDate(value: string | undefined) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 10);
}

export function modelPath(id: string) {
  return `/models/${id.split("/").map(encodeURIComponent).join("/")}`;
}

export function labLogoUrl(lab: string) {
  return `https://models.dev/logos/labs/${catalogLabSlug(lab)}.svg`;
}

export function providerLogoUrl(provider: string) {
  return `https://models.dev/logos/${catalogSlug(provider)}.svg`;
}

export function displayDateTime(value: string | undefined) {
  return value ? new Date(value).getTime() || 0 : 0;
}

export function compareCostCheapest(
  a: { input: number; output: number },
  b: { input: number; output: number },
) {
  if (a.input !== b.input) return a.input - b.input;
  return a.output - b.output;
}
