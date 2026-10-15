// Orbit data model. These shapes are what a real API and database will later serve,
// so the screens should not need to change much when the dummy data is replaced.

export const DEV_STAGES = ['Idea', 'Business Case', 'Discovery', 'Approval', 'Development', 'Launch'] as const;
export type DevStage = (typeof DEV_STAGES)[number];

export const MATURITY_STAGES = ['Introduction', 'Growth', 'Maturity', 'Decline', 'Retirement'] as const;
export type MaturityStage = (typeof MATURITY_STAGES)[number];

export const LIFECYCLE_ACTIONS = [
  'Invest',
  'Accelerate',
  'Maintain',
  'Optimise',
  'Reposition',
  'Consolidate',
  'Harvest',
  'Retire',
] as const;
export type LifecycleAction = (typeof LIFECYCLE_ACTIONS)[number];

export type Level = 'Low' | 'Medium' | 'High';
export type Priority = 'High' | 'Medium' | 'Low';
export type RequirementStatus = 'not-started' | 'in-progress' | 'blocked' | 'complete';

/** A piece of evidence attached to a stage-gate requirement. */
export interface Evidence {
  id: string;
  title: string;
  addedBy: string;
  addedAt: string; // ISO date-time
}

/** Something that must be true before a product can leave its current development stage. */
export interface Requirement {
  id: string;
  title: string;
  description: string;
  status: RequirementStatus;
  owner: string;
  due?: string; // ISO date
  evidence: Evidence[];
  blockerNote?: string;
  /** Set when the requirement is satisfied by an organisational decision (a governance review). */
  reviewId?: string;
}

/** Commercial, customer, operational and strategic signals for a live product. */
export interface Metrics {
  revenue: number; // annual, £m
  revenueGrowth: number; // % year on year
  customers: number;
  customerGrowth: number; // % year on year
  margin: number; // gross margin, %
  customerHealth: number; // 0-100
  supportCostChange: number; // % year on year
  incidentsPerMonth: number;
  usageGrowth: number; // % year on year
  strategicRelevance: Level;
  competitivePressure: Level;
  monthsLive: number;
  /** The same measures one quarter ago, to show the direction of travel. */
  previous: {
    revenueGrowth: number;
    customerGrowth: number;
    margin: number;
    customerHealth: number;
    supportCostChange: number;
    usageGrowth: number;
  };
  /** Twelve monthly points, oldest first. */
  trend: {
    revenue: number[]; // £m a month
    customers: number[];
    margin: number[]; // %
    supportCost: number[]; // index, 100 = twelve months ago
  };
  /** Notable facts that matter to a decision, in plain words. */
  facts: string[];
}

export type ActivityKind = 'created' | 'stage' | 'requirement' | 'evidence' | 'maturity' | 'lifecycle' | 'governance' | 'action';

/** One line in a product's (or review's) audit history. */
export interface ActivityEntry {
  id: string;
  at: string; // ISO date-time
  actor: string;
  kind: ActivityKind;
  title: string;
  detail?: string;
}

/** The Product Manager's decision about what to do with a live product. */
export interface LifecycleDecision {
  status: 'accepted' | 'modified' | 'rejected' | 'investigating';
  recommended: LifecycleAction;
  chosen?: LifecycleAction;
  rationale: string;
  decidedAt: string;
  stage: MaturityStage;
  reviewId?: string;
}

export interface Product {
  id: string;
  name: string;
  summary: string;
  category: string;
  owner: string;
  phase: 'development' | 'live';
  /** Current stage while in development; `Launch` once live. */
  devStage: DevStage;
  /** Only for live products: the stage the Product Manager has confirmed. */
  maturity?: MaturityStage;
  maturityConfirmedAt?: string;
  launchedAt?: string;
  metrics?: Metrics;
  requirements: Record<DevStage, Requirement[]>;
  lifecycleDecision?: LifecycleDecision;
  activity: ActivityEntry[]; // newest first
  createdAt: string;
}

export interface ActionItem {
  id: string;
  productId: string;
  title: string;
  priority: Priority;
  due: string; // ISO date
  source: string;
  status: 'open' | 'done';
  /** App route to open when the action is selected. */
  link: string;
  createdAt: string;
}

export interface ReviewEvidence {
  id: string;
  title: string;
  provided: boolean;
  attachedAs?: string;
}

export type ReviewResult = 'Approved' | 'Approved with conditions' | 'Deferred' | 'Rejected';

/** An organisational decision the Product Manager needs, and the evidence behind it. */
export interface Review {
  id: string;
  productId: string;
  decision: string;
  status: 'draft' | 'submitted' | 'decided';
  forum: string;
  forumDate: string; // ISO date
  requestedInvestment?: string;
  customerImplications: string;
  risks: string[];
  recommendation: string;
  evidence: ReviewEvidence[];
  notes: string;
  outcome?: { result: ReviewResult; rationale: string; at: string };
  log: ActivityEntry[];
}

export interface Portfolio {
  /** The Product Manager these products belong to. */
  owner: string;
  products: Product[];
  actions: ActionItem[];
  reviews: Review[];
}
