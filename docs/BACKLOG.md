# Orbit backlog

Work is organised as **epics** (a capability a Product Manager can use) made of **user stories**. This file is the single place we track them. Update the checkbox and status when a story's PR merges.

**Scope for now:** one persona, the Product Manager. UI and UX first, on dummy data. Backend, containers and Kubernetes come after the UI is settled.

**Status key:** `[ ]` not started · `[~]` in progress · `[x]` done

Stories marked *(brief #n)* are the 15 MVP user stories from the original product brief.

## Build order

E1 → E2 → E3 → E4 → E8 → E5 → E6 → E7, then E9 and E10.

E8 follows E4 because Product Development is the first thing that creates actions. E6 and E7 depend on E5, and they are linked: accepting a lifecycle decision can create a governance review.

---

## E1 · Foundation

Enablers that every later epic builds on.

- [x] **E1-S1** App shell: sidebar navigation and a route for each main area (PR #1, #3)
- [x] **E1-S2** CI on pull requests: typecheck and build (PR #2)
- [ ] **E1-S3** Shared dummy portfolio: the seven example products and their data model
- [ ] **E1-S4** Shared UI components: status badges, lifecycle rail, cards, side panel, dialogs
- [ ] **E1-S5** Client-side state that survives a page reload, with a "reset demo data" option

## E2 · Portfolio & Home

*Goal: the Product Manager sees every product they manage and what needs attention today.*

- [ ] **E2-S1** *(brief #1)* As a Product Manager, I want to see all products I manage.
  - Home lists every product with its name, stage, health, outstanding action and priority.
  - Clicking a product opens it.
- [ ] **E2-S2** *(brief #2)* As a Product Manager, I want to see the current stage of each product.
  - Pre-launch products show their development stage; live products show their maturity stage.
  - A My Products page groups products into pre-launch and live.
- [ ] **E2-S3** *(brief #3)* As a Product Manager, I want to know which products require my attention.
  - Home answers "What needs my attention today?" with a ranked list.
  - Each item says why (overdue action, decision required, stage gate, missing evidence) and links to where to act.

## E3 · Product workspace

*Goal: a product has one home that shows its full context.*

- [ ] **E3-S1** *(brief #4)* As a Product Manager, I want to open a product and see its complete context.
  - A header always shows the product, its stage, its health and where it sits in the full lifecycle.
  - An overview shows the next action, open actions, governance reviews and recent activity.
- [ ] **E3-S2** *(brief #5)* As a Product Manager, I want to create a new product.
  - Name, summary and category are enough to create it.
  - It starts at Idea with the standard requirements and a first action.

## E4 · Product Development

*Goal: the Product Manager takes a product from Idea to Launch through stage gates.*

- [ ] **E4-S1** *(brief #6)* As a Product Manager, I want to see the development lifecycle visually.
  - Idea → Business Case → Discovery → Approval → Development → Launch, showing done, current and upcoming stages.
- [ ] **E4-S2** *(brief #7)* As a Product Manager, I want to see what is required to complete the current stage.
  - The current stage's requirements are listed with their status.
  - The screen states clearly how many blockers stand before the next stage.
- [ ] **E4-S3** *(brief #8)* As a Product Manager, I want to complete stage-gate requirements.
  - I can mark a requirement complete, add evidence, record a blocker and assign an action.
- [ ] **E4-S4** *(brief #9)* As a Product Manager, I want to progress a product to the next stage.
  - Advancing is only possible when every requirement is complete.
  - Advancing from Launch makes the product live, in Introduction.
  - Each gate decision is recorded in the product's history.

## E5 · Lifecycle & Maturity

*Goal: the Product Manager understands where a live product is in its maturity, and why.*

- [ ] **E5-S1** *(brief #10)* As a Product Manager, I want to see a live product's maturity stage.
  - A portfolio view shows every live product with its stage, direction of travel and whether a decision is outstanding.
  - The application recommends a stage ("appears to be in Growth"). I confirm it or set my own, and my choice is recorded.
- [ ] **E5-S2** *(brief #11)* As a Product Manager, I want to see the evidence supporting that maturity assessment.
  - Revenue, growth, customers, margin, customer health, support burden, strategic relevance and competitive pressure are shown.
  - Each signal says which stage it points to and why, and whether it is improving or deteriorating.

## E6 · Lifecycle Decisions

*Goal: the Product Manager decides what to do with a live product, with the evidence in front of them.*

- [ ] **E6-S1** *(brief #12)* As a Product Manager, I want to receive a recommended lifecycle action.
  - One of Invest, Accelerate, Maintain, Optimise, Reposition, Consolidate, Harvest or Retire is recommended.
  - The recommendation shows its reasoning, key metrics and risks.
- [ ] **E6-S2** *(brief #13)* As a Product Manager, I want to accept or change that recommendation.
  - I can accept, modify, reject or investigate further, and I record my reasoning.
  - The decision creates follow-up actions and is kept in the product's history.
  - Where organisational approval is needed, a governance review is created or linked.

## E7 · Governance

*Goal: the Product Manager gets the organisational decision they need, with the evidence to support it.*

- [ ] **E7-S1** *(brief #14)* As a Product Manager, I want to prepare a product for a governance decision.
  - A review queue lists the decisions I need.
  - Each review brings together the metrics, risks, customer implications and recommendation, and flags missing evidence.
  - I can attach evidence, submit the review and record the outcome.
  - The outcome creates follow-up actions and an audit trail.

## E8 · My Actions

*Goal: one list of everything the Product Manager is personally responsible for.*

- [ ] **E8-S1** *(brief #15)* As a Product Manager, I want to see my outstanding actions across all products.
  - Each action shows its product, priority, due date, source and status.
  - Selecting an action opens the relevant product context.
  - I can complete actions and add new ones.

---

## Later (not part of the UI phase)

- [ ] **E9 · Containerisation & Kubernetes**: container image for `web`, Kubernetes manifests, then CD pipelines.
- [ ] **E10 · Backend & persistence**: an API and PostgreSQL, replacing the dummy data.
