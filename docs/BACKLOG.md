# Orbit backlog

Work is organised as **epics** (a capability a Product Manager can use) made of **user stories**. This file is the single place we track them. Update the checkbox and status when a story's PR merges.

Every story says who wants something, what they want, and **why**: "As a Product Manager, I want X so that Y". Acceptance bullets under a story say when it is done.

**Scope for now:** one persona, the Product Manager. UI and UX first, on dummy data. Backend, containers and Kubernetes come after the UI is settled.

**Status key:** `[ ]` not started · `[~]` in progress · `[x]` done

Stories marked *(brief #n)* are the 15 MVP user stories from the original product brief. The brief gave the "what"; the "so that" has been added here, drawn from the questions Orbit is meant to answer.

## Build order

E1 → E2 → E3 → E4 → E8 → E5 → E6 → E7, then E9 and E10.

E8 follows E4 because Product Development is the first thing that creates actions. E6 and E7 depend on E5, and they are linked: accepting a lifecycle decision can create a governance review.

Within an epic, stories are built in order and each ships as its own small change, so every change adds something visible.

---

## E1 · Foundation

What every later epic builds on. Only the shared portfolio is built up front. Shared components and saved state are built inside the first story that needs them, so they are shaped by real screens.

- [x] **E1-S1** As a Product Manager, I want to move between Orbit's main areas from one navigation bar, **so that** I always know where I am and can get to any area in one click. (PR #1, #3)
- [x] **E1-S2** As a Product Manager, I want every screen to show the same portfolio of realistic products, **so that** I can trust what I see and follow a product from one screen to the next. (PR #7)

## E2 · Portfolio & Home

*Goal: the Product Manager sees every product they manage and what needs attention today.*

- [x] **E2-S1** *(brief #1)* As a Product Manager, I want to see all the products I'm responsible for in one place, **so that** I know what is in my portfolio without checking several tools. (PR #8)
  - Home has a My Products list showing every product with its name, category and summary.
  - Clicking a product opens it.
- [x] **E2-S2** *(brief #2)* As a Product Manager, I want to see the current stage of each product, **so that** I can tell at a glance whether it needs development work or a lifecycle decision. (PR #9)
  - Each product shows its stage: the development stage if it is pre-launch, the maturity stage if it is live.
  - A My Products page groups products into pre-launch and live.
- [x] **E2-S3** *(brief #3)* As a Product Manager, I want to know which products need my attention, **so that** I spend my time on what matters most today.
  - Each product shows its health, outstanding action and priority.
  - Home answers "What needs my attention today?" with a ranked list.
  - Each item says why (overdue action, decision required, stage gate, missing evidence) and links to where to act.

## E3 · Product workspace

*Goal: a product has one home that shows its full context.*

- [x] **E3-S1** *(brief #4)* As a Product Manager, I want to open a product and see its complete context, **so that** I can understand what it is, where it stands and what to do next without searching elsewhere.
  - A header always shows the product, its stage, its health and where it sits in the full lifecycle.
  - An overview shows the next action, open actions, governance reviews and recent activity.
- [x] **E3-S2** *(brief #5)* As a Product Manager, I want to create a new product, **so that** a new idea is managed from its first day and does not live in a side document.
  - Name, summary and category are enough to create it.
  - It starts at Idea with the standard requirements and a first action.

## E4 · Product Development

*Goal: the Product Manager takes a product from Idea to Launch through stage gates.*

- [x] **E4-S1** *(brief #6)* As a Product Manager, I want to see the development lifecycle visually, **so that** I immediately know where the product is, what is done and what remains.
  - Idea → Business Case → Discovery → Approval → Development → Launch, showing done, current and upcoming stages.
- [x] **E4-S2** *(brief #7)* As a Product Manager, I want to see what is required to complete the current stage, **so that** I know exactly what is stopping the product from moving on.
  - The current stage's requirements are listed with their status.
  - The screen states clearly how many blockers stand before the next stage.
- [x] **E4-S3** *(brief #8)* As a Product Manager, I want to complete stage-gate requirements, **so that** progress is backed by evidence and anyone can see why a product passed a gate.
  - I can mark a requirement complete, add evidence, record a blocker and assign an action.
- [x] **E4-S4** *(brief #9)* As a Product Manager, I want to progress a product to the next stage, **so that** the product moves forward only when it is genuinely ready, and the decision is on record.
  - Advancing is only possible when every requirement is complete.
  - Advancing from Launch makes the product live, in Introduction.
  - Each gate decision is recorded in the product's history.

## E5 · Lifecycle & Maturity

*Goal: the Product Manager understands where a live product is in its maturity, and why.*

- [x] **E5-S1** *(brief #10)* As a Product Manager, I want to see a live product's maturity stage, **so that** I know whether it is growing, mature or declining and can plan accordingly, while staying accountable for the final classification.
  - A portfolio view shows every live product with its stage, direction of travel and whether a decision is outstanding.
  - The application recommends a stage ("appears to be in Growth"). I confirm it or set my own, and my choice is recorded.
- [x] **E5-S2** *(brief #11)* As a Product Manager, I want to see the evidence supporting that maturity assessment, **so that** I can trust it, challenge it, and explain it to others.
  - Revenue, growth, customers, margin, customer health, support burden, strategic relevance and competitive pressure are shown.
  - Each signal says which stage it points to and why, and whether it is improving or deteriorating.

## E6 · Lifecycle Decisions

*Goal: the Product Manager decides what to do with a live product, with the evidence in front of them.*

- [x] **E6-S1** *(brief #12)* As a Product Manager, I want to receive a recommended lifecycle action, **so that** I start from an evidence-based suggestion instead of a blank page when deciding what to do with a product.
  - One of Invest, Accelerate, Maintain, Optimise, Reposition, Consolidate, Harvest or Retire is recommended.
  - The recommendation shows its reasoning, key metrics and risks.
- [x] **E6-S2** *(brief #13)* As a Product Manager, I want to accept or change that recommendation, **so that** the final call is mine, my reasoning is captured, and the decision turns into follow-up work.
  - I can accept, modify, reject or investigate further, and I record my reasoning.
  - The decision creates follow-up actions and is kept in the product's history.
  - Where organisational approval is needed, a governance review is created or linked.

## E7 · Governance

*Goal: the Product Manager gets the organisational decision they need, with the evidence to support it.*

- [x] **E7-S1** *(brief #14)* As a Product Manager, I want to prepare a product for a governance decision, **so that** I walk into the review with the evidence assembled, know what is missing beforehand, and the outcome is on record.
  - A review queue lists the decisions I need.
  - Each review brings together the metrics, risks, customer implications and recommendation, and flags missing evidence.
  - I can attach evidence, submit the review and record the outcome.
  - The outcome creates follow-up actions and an audit trail.

## E8 · My Actions

*Goal: one list of everything the Product Manager is personally responsible for.*

- [x] **E8-S1** *(brief #15)* As a Product Manager, I want to see my outstanding actions across all products, **so that** nothing I owe falls through the cracks and I can plan my week from one list.
  - Each action shows its product, priority, due date, source and status.
  - Selecting an action opens the relevant product context.
  - I can complete actions and add new ones.

---

## Later (after the UI is settled)

- [ ] **E9 · Available to my team**: as a Product Manager, I want to open Orbit at a web address, **so that** I and my colleagues can use it without installing anything. (Delivered by running it on Kubernetes.)
- [ ] **E10 · My work is saved**: as a Product Manager, I want my products, decisions and actions to be saved, **so that** they are still there tomorrow and visible to my team. (Delivered by an API and PostgreSQL, replacing the dummy data.)
