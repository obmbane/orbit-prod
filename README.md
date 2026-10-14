# Orbit

Orbit is a B2B SaaS application for Product Managers. It helps manage a product across its full lifecycle:

- **Product development**: Idea → Business Case → Discovery → Approval → Development → Launch
- **Product maturity**: Introduction → Growth → Maturity → Decline → Retirement
- **Governance**: the organisational decisions a Product Manager needs, and the evidence behind them

## Status

Early stage. The current focus is a clickable UI prototype using dummy data. There is no backend or database yet.

## Repository layout

| Path | Purpose |
| --- | --- |
| [`web/`](web/README.md) | UI prototype (Vite, React, TypeScript) |
| [`docs/BACKLOG.md`](docs/BACKLOG.md) | Epics and user stories, and their status |
| `.github/workflows/` | GitHub Actions CI |
| `deploy/` | Kubernetes manifests. *Coming once the UI is settled.* |

## Workflow

- `main` is protected. Changes go through pull requests from short-lived feature branches (`feature/<short-name>`).
- Commits and PR titles follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`).
- CI runs on every PR. Later, CI/CD pipelines will build container images and deploy to Kubernetes.

## Target platform

The application will run on Kubernetes. If a SQL database is needed, PostgreSQL will be used.
