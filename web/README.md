# Orbit web

The Orbit UI prototype: Vite, React 18 and TypeScript. It runs entirely in the browser on dummy data; there is no backend yet.

## Requirements

- Node 22 or newer

## Run it

```bash
cd web
npm install
npm run dev
```

Then open the URL Vite prints (normally http://localhost:5173).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server with hot reload |
| `npm run typecheck` | Type-check without emitting files |
| `npm run build` | Type-check, then produce a production build in `dist/` |
| `npm run preview` | Serve the production build locally |

## What is in it

Every area of the Product Manager's journey is built, on dummy data held in the browser (saved in local storage, with a "Reset demo data" control in the sidebar):

| Area | What it does |
| --- | --- |
| Home | What needs attention today, ranked, plus My Products by urgency |
| My Products | All products, grouped into pre-launch and live, with stage, health, action and priority; create a new product |
| Product page | Always-visible lifecycle rail, plus Overview, Development or Lifecycle, Decision, Governance and Activity tabs |
| Development | Stage tracker, requirements, evidence, blockers, assigning actions, advancing a stage or launching |
| Lifecycle | Portfolio of live products; per-product maturity assessment with every signal explained; confirm or override |
| Lifecycle Decision | Recommended action with evidence and risks; accept, modify, reject or investigate; follow-ups and governance links |
| Governance | Review queue, evidence pack with gaps flagged, submit, record the outcome, audit trail |
| My Actions | One list across all products, with filters, completion and a link back to context |

The stories behind each area are in [`../docs/BACKLOG.md`](../docs/BACKLOG.md).

## Structure

```
src/
├── main.tsx              Entry point (HashRouter, so it works on any static host)
├── App.tsx               App shell: sidebar navigation and routes
├── types.ts              The data model (what a real API and database will later serve)
├── portfolio-context.tsx The one shared, editable copy of the data, and every change made to it
├── data/portfolio.ts     The seven-product dummy portfolio, with dates relative to today
├── lib/                  Logic with no UI: dates, formatting, health and attention,
│                         maturity assessment, lifecycle recommendation, governance reviews
├── components/           Shared pieces: badges, lifecycle rail, stage tracker, dialogs
└── pages/                One component per screen
```
