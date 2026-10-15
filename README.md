# Orbit

Orbit is a B2B SaaS application for Product Managers. It helps manage a product across its full lifecycle:

- **Product development**: Idea → Business Case → Discovery → Approval → Development → Launch
- **Product maturity**: Introduction → Growth → Maturity → Decline → Retirement
- **Governance**: the organisational decisions a Product Manager needs, and the evidence behind them

## Status

The clickable UI prototype is complete for the Product Manager: every area of the journey works end to end on dummy data. There is no backend or database yet. Next: containerise it and run it on Kubernetes, then add a real backend.

## Repository layout

| Path | Purpose |
| --- | --- |
| [`web/`](web/README.md) | UI prototype (Vite, React, TypeScript) |
| [`docs/BACKLOG.md`](docs/BACKLOG.md) | Epics and user stories, and their status |
| `.github/workflows/` | GitHub Actions CI |
| `deploy/` | Kubernetes manifests. *Coming next.* |

## Workflow

- **`develop`** is the working branch. Work is committed and pushed to it directly; there are no per-feature branches.
- **`main`** is the protected release branch. It only changes through a pull request from `develop`, which must pass CI, and is merged with a merge commit (not a squash, so `develop` and `main` don't drift apart).
- Work is planned in [`docs/BACKLOG.md`](docs/BACKLOG.md). Commit messages and PR titles follow [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`) and name the story where there is one, for example `feat(web): add Home product list (E2-S1)`.
- CI runs on every pull request into `main` and on every push to `main`. Later, CI/CD pipelines will build container images and deploy to Kubernetes.

## Target platform

The application will run on Kubernetes. If a SQL database is needed, PostgreSQL will be used.
