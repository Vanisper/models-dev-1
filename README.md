# models.dev explorer

Browse AI models, labs, providers, and multi-provider pricing from [models.dev](https://models.dev).

## Requirements

- Node.js >= 20.9

## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run sync` | Download latest `catalog.json`, `api.json`, labs index into `public/data/` |

## Data sources

- `https://models.dev/catalog.json` — canonical model metadata
- `https://models.dev/api.json` — provider listings and pricing
- `https://models.dev/labs` — lab descriptions (parsed from search index)

The app fetches these online (1h process-memory TTL). If live catalog fetch fails, it falls back to `public/data/catalog.json`.

## Pricing model

The same canonical model can have different prices across providers. The app stores:

- `costByProvider` — full provider → cost map
- `costSummary.min/max` — per-field range
- `costSummary.cheapest` — lowest input (then output) offer
- `cost` — alias of cheapest (list convenience)

## Routes

- `/` — search, filter, sort models
- `/models/[...id]` — model detail + provider price table
- `/labs`, `/labs/[lab]`
- `/providers`, `/providers/[id]`
