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

## Structure

```
src/
├── main.tsx          Entry point (HashRouter, so it works on any static host)
├── App.tsx           App shell: sidebar navigation and routes
├── index.css         Global styles and design tokens
└── pages/            One component per screen
```

## Current state

Only the app shell exists: sidebar navigation (Home, My Products, Lifecycle, Governance, My Actions) and a placeholder page for each route. Real screens are added one area per PR.
