import {
  ActionItem,
  ActivityEntry,
  DEV_STAGES,
  DevStage,
  Metrics,
  Portfolio,
  Product,
  Requirement,
  RequirementStatus,
  Review,
  ReviewEvidence,
} from '../types';

// Dummy data for the seven example products. Dates are generated relative to today,
// so "overdue" and "due Friday" stay true whenever the app is opened.

export const OWNER = 'Alex Morgan';

const pad = (n: number) => String(n).padStart(2, '0');

/** ISO date (yyyy-mm-dd), `days` from today. Negative = in the past. */
function dateFromToday(days: number): string {
  const d = new Date();
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** ISO date-time, `days` before now. */
function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

let counter = 0;
let seeding = false;
/** Stable ids while building the seed; random ids afterwards, so new records never collide with saved ones. */
const nextId = (prefix: string) => (seeding ? `${prefix}${++counter}` : `${prefix}${Math.random().toString(36).slice(2, 9)}`);

// ---------------------------------------------------------------------------
// Stage-gate requirements
// ---------------------------------------------------------------------------

type RequirementTemplate = [title: string, description: string, evidence: string];

const REQUIREMENT_TEMPLATES: Record<DevStage, RequirementTemplate[]> = {
  Idea: [
    ['Problem statement drafted', 'Describe the customer problem and who has it.', 'Problem statement v1'],
    ['Target customer segment identified', 'Name the segment and the rough size of the opportunity.', 'Segment sizing note'],
    ['Strategic fit assessed', 'Show how this supports portfolio strategy.', 'Strategy fit summary'],
    ['Executive sponsor identified', 'Someone senior who will stand behind the idea.', 'Sponsor confirmation'],
  ],
  'Business Case': [
    ['Market sizing completed', 'Total, serviceable and obtainable market, with sources.', 'Market sizing model'],
    ['Revenue and cost model built', 'Five-year view with the key assumptions.', 'Financial model v2'],
    ['Pricing hypothesis defined', 'Initial price points and packaging.', 'Pricing hypothesis deck'],
    ['Risks and dependencies logged', 'Technical, commercial and regulatory.', 'Risk register'],
    ['Business case reviewed with Finance', 'A finance partner has challenged the numbers.', 'Finance review notes'],
  ],
  Discovery: [
    ['Customer problem validated', 'Interviews or pilots confirm the problem is real.', 'Customer interview summaries'],
    ['Commercial hypothesis defined', 'Who pays, how much, and why now.', 'Commercial hypothesis one-pager'],
    ['Technical feasibility assessed', 'Engineering confirms it can be built and run at cost.', 'Feasibility assessment'],
    ['Regulatory assessment completed', 'Legal and compliance have reviewed the proposition.', 'Regulatory assessment'],
  ],
  Approval: [
    ['Investment approved', 'The governance board has approved funding.', 'Board decision record'],
    ['Delivery plan agreed', 'Milestones and dependencies agreed with Engineering.', 'Delivery plan'],
    ['Resourcing confirmed', 'Named teams and capacity committed.', 'Resourcing confirmation'],
    ['Go-to-market outline agreed', 'Channels, target accounts and launch shape.', 'Go-to-market outline'],
  ],
  Development: [
    ['MVP scope baselined', 'What is in the first release and what is not.', 'MVP scope document'],
    ['Security review passed', 'Security team sign-off.', 'Security review report'],
    ['Service operations readiness confirmed', 'Run books, monitoring and on-call in place.', 'Operations readiness checklist'],
    ['Pricing and packaging finalised', 'Rate card loaded and approved.', 'Final rate card'],
    ['Support model defined', 'Tiers, service levels and escalation routes.', 'Support model'],
  ],
  Launch: [
    ['Launch approved', 'Governance has approved go-live.', 'Launch approval record'],
    ['Sales enablement complete', 'Sales teams trained and collateral live.', 'Enablement pack'],
    ['Billing and provisioning live', 'Orders can be taken and customers billed.', 'Billing test report'],
    ['Launch communications ready', 'Internal and external announcements.', 'Communications plan'],
    ['Success metrics defined', 'What good looks like at 30, 90 and 365 days.', 'Success metrics sheet'],
  ],
};

function requirement(stage: DevStage, index: number, status: RequirementStatus, extra: Partial<Requirement> = {}): Requirement {
  const [title, description, evidence] = REQUIREMENT_TEMPLATES[stage][index];
  return {
    id: nextId('req-'),
    title,
    description,
    status,
    owner: OWNER,
    evidence:
      status === 'complete'
        ? [{ id: nextId('ev-'), title: evidence, addedBy: OWNER, addedAt: daysAgo(30 - index) }]
        : [],
    ...extra,
  };
}

/**
 * Requirements for every stage. Stages before `current` are complete, later stages are
 * not started, and `current` uses the given statuses (default: not started).
 */
function requirementsFor(
  current: DevStage | 'live',
  currentStatuses: RequirementStatus[] = [],
  overrides: Record<number, Partial<Requirement>> = {},
): Record<DevStage, Requirement[]> {
  const currentIndex = current === 'live' ? DEV_STAGES.length : DEV_STAGES.indexOf(current);
  const result = {} as Record<DevStage, Requirement[]>;
  DEV_STAGES.forEach((stage, stageIndex) => {
    result[stage] = REQUIREMENT_TEMPLATES[stage].map((_, i) => {
      if (stageIndex < currentIndex) return requirement(stage, i, 'complete');
      if (stageIndex === currentIndex) return requirement(stage, i, currentStatuses[i] ?? 'not-started', overrides[i]);
      return requirement(stage, i, 'not-started');
    });
  });
  return result;
}

// ---------------------------------------------------------------------------
// Metrics and history
// ---------------------------------------------------------------------------

/** A smooth twelve-point series from `from` to `to`, with a little deterministic wobble. */
function series(from: number, to: number, wobble: number, phase: number): number[] {
  const points = 12;
  return Array.from({ length: points }, (_, i) => {
    const base = from + ((to - from) * i) / (points - 1);
    const noise = Math.sin(i * 1.9 + phase) * wobble * Math.max(Math.abs(to - from), Math.abs(from) * 0.1);
    return Math.round((base + noise) * 100) / 100;
  });
}

type MetricsInput = Omit<Metrics, 'trend'> & {
  trendShape: { revenue: [number, number]; customers: [number, number]; margin: [number, number]; supportCost: [number, number] };
};

function metrics({ trendShape, ...rest }: MetricsInput): Metrics {
  return {
    ...rest,
    trend: {
      revenue: series(trendShape.revenue[0], trendShape.revenue[1], 0.05, 1),
      customers: series(trendShape.customers[0], trendShape.customers[1], 0.03, 2),
      margin: series(trendShape.margin[0], trendShape.margin[1], 0.08, 3),
      supportCost: series(trendShape.supportCost[0], trendShape.supportCost[1], 0.06, 4),
    },
  };
}

function entry(kind: ActivityEntry['kind'], title: string, ago: number, detail?: string): ActivityEntry {
  return { id: nextId('act-'), at: daysAgo(ago), actor: OWNER, kind, title, detail };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------

function products(): Product[] {
  return [
    {
      id: 'ai-inference',
      name: 'AI Inference Platform',
      summary: 'Managed GPU inference platform for enterprise AI workloads.',
      category: 'Cloud & AI',
      owner: OWNER,
      phase: 'development',
      devStage: 'Discovery',
      requirements: requirementsFor('Discovery', ['complete', 'complete', 'blocked', 'complete'], {
        2: {
          due: dateFromToday(2),
          blockerNote: 'GPU supply assumptions are unconfirmed. Waiting on vendor lead times from Procurement.',
        },
      }),
      activity: [
        entry('requirement', 'Regulatory assessment completed', 3),
        entry('stage', 'Advanced to Discovery', 24, 'Business Case gate passed with Finance sign-off.'),
        entry('created', 'Product created', 70),
      ],
      createdAt: daysAgo(70),
    },
    {
      id: 'cloud-connect',
      name: 'Cloud Connect',
      summary: 'Enterprise connectivity between customer environments and cloud platforms.',
      category: 'Connectivity',
      owner: OWNER,
      phase: 'live',
      devStage: 'Launch',
      maturity: 'Growth',
      maturityConfirmedAt: daysAgo(45),
      launchedAt: daysAgo(26 * 30),
      requirements: requirementsFor('live'),
      metrics: metrics({
        revenue: 18.4,
        revenueGrowth: 34,
        customers: 412,
        customerGrowth: 22,
        margin: 38,
        customerHealth: 82,
        supportCostChange: 4,
        incidentsPerMonth: 6,
        usageGrowth: 38,
        strategicRelevance: 'High',
        competitivePressure: 'Medium',
        monthsLive: 26,
        previous: { revenueGrowth: 30, customerGrowth: 20, margin: 41, customerHealth: 80, supportCostChange: 3, usageGrowth: 34 },
        facts: [],
        trendShape: { revenue: [1.1, 1.7], customers: [310, 412], margin: [42, 38], supportCost: [92, 100] },
      }),
      activity: [
        entry('maturity', 'Maturity confirmed as Growth', 45, 'Revenue +34%, customers +22%.'),
        entry('lifecycle', 'Lifecycle decision: Invest', 120, 'Funded the Frankfurt and Singapore on-ramps.'),
        entry('created', 'Product created', 800),
      ],
      createdAt: daysAgo(800),
    },
    {
      id: 'managed-firewall',
      name: 'Managed Firewall',
      summary: 'Managed enterprise network security service.',
      category: 'Security',
      owner: OWNER,
      phase: 'live',
      devStage: 'Launch',
      maturity: 'Maturity',
      maturityConfirmedAt: daysAgo(110),
      launchedAt: daysAgo(61 * 30),
      requirements: requirementsFor('live'),
      metrics: metrics({
        revenue: 31.2,
        revenueGrowth: 3,
        customers: 1280,
        customerGrowth: 1,
        margin: 31,
        customerHealth: 76,
        supportCostChange: 1,
        incidentsPerMonth: 14,
        usageGrowth: 2,
        strategicRelevance: 'High',
        competitivePressure: 'Medium',
        monthsLive: 61,
        previous: { revenueGrowth: 4, customerGrowth: 2, margin: 31, customerHealth: 77, supportCostChange: 1, usageGrowth: 2 },
        facts: [],
        trendShape: { revenue: [2.5, 2.65], customers: [1250, 1280], margin: [32, 31], supportCost: [100, 101] },
      }),
      activity: [
        entry('maturity', 'Maturity confirmed as Maturity', 110, 'Growth has slowed; margin stable.'),
        entry('created', 'Product created', 1900),
      ],
      createdAt: daysAgo(1900),
    },
    {
      id: 'legacy-mpls',
      name: 'Legacy MPLS',
      summary: 'Traditional enterprise private WAN product being displaced by newer connectivity models.',
      category: 'Connectivity',
      owner: OWNER,
      phase: 'live',
      devStage: 'Launch',
      maturity: 'Decline',
      maturityConfirmedAt: daysAgo(70),
      launchedAt: daysAgo(140 * 30),
      requirements: requirementsFor('live'),
      metrics: metrics({
        revenue: 42.5,
        revenueGrowth: -12,
        customers: 118,
        customerGrowth: -18,
        margin: 19,
        customerHealth: 54,
        supportCostChange: 26,
        incidentsPerMonth: 31,
        usageGrowth: -16,
        strategicRelevance: 'Low',
        competitivePressure: 'High',
        monthsLive: 140,
        previous: { revenueGrowth: -9, customerGrowth: -14, margin: 22, customerHealth: 58, supportCostChange: 19, usageGrowth: -12 },
        facts: ['23 customers have contracts beyond the proposed end-of-life date and still require migration'],
        trendShape: { revenue: [4.0, 3.5], customers: [144, 118], margin: [24, 19], supportCost: [100, 126] },
      }),
      activity: [
        entry('maturity', 'Maturity confirmed as Decline', 70, 'Revenue −12%, customers −18%, margin under 20%.'),
        entry('created', 'Product created', 4200),
      ],
      createdAt: daysAgo(4200),
    },
    {
      id: 'hosted-pbx',
      name: 'Hosted PBX Classic',
      summary: 'Legacy hosted voice product being replaced by newer collaboration and cloud telephony services.',
      category: 'Voice & Collaboration',
      owner: OWNER,
      phase: 'live',
      devStage: 'Launch',
      maturity: 'Retirement',
      maturityConfirmedAt: daysAgo(95),
      launchedAt: daysAgo(150 * 30),
      requirements: requirementsFor('live'),
      lifecycleDecision: {
        status: 'accepted',
        recommended: 'Retire',
        chosen: 'Retire',
        rationale: 'The successor product (Cloud Telephony) is generally available. Migrate remaining customers, then decommission.',
        decidedAt: daysAgo(30),
        stage: 'Retirement',
        reviewId: 'review-pbx-eol',
      },
      metrics: metrics({
        revenue: 6.1,
        revenueGrowth: -31,
        customers: 74,
        customerGrowth: -44,
        margin: 9,
        customerHealth: 41,
        supportCostChange: 18,
        incidentsPerMonth: 22,
        usageGrowth: -39,
        strategicRelevance: 'Low',
        competitivePressure: 'High',
        monthsLive: 150,
        previous: { revenueGrowth: -22, customerGrowth: -31, margin: 14, customerHealth: 47, supportCostChange: 12, usageGrowth: -28 },
        facts: ['12 customers have not yet confirmed a migration date'],
        trendShape: { revenue: [0.9, 0.5], customers: [132, 74], margin: [18, 9], supportCost: [100, 118] },
      }),
      activity: [
        entry('lifecycle', 'Lifecycle decision: Retire (accepted)', 30, 'Successor product is generally available.'),
        entry('maturity', 'Maturity confirmed as Retirement', 95),
        entry('created', 'Product created', 4500),
      ],
      createdAt: daysAgo(4500),
    },
    {
      id: 'managed-kubernetes-plus',
      name: 'Managed Kubernetes Plus',
      summary: 'Managed Kubernetes and OpenShift platform with enterprise support.',
      category: 'Cloud & AI',
      owner: OWNER,
      phase: 'development',
      devStage: 'Business Case',
      requirements: requirementsFor('Business Case', ['complete', 'complete', 'complete', 'complete', 'in-progress'], {
        4: { due: dateFromToday(4) },
      }),
      activity: [
        entry('requirement', 'Risks and dependencies logged', 2),
        entry('stage', 'Advanced to Business Case', 14, 'Idea gate passed.'),
        entry('created', 'Product created', 30),
      ],
      createdAt: daysAgo(30),
    },
    {
      id: 'sme-commerce-hub',
      name: 'SME Commerce Hub',
      summary: 'Mobile-first digital commerce platform for small businesses.',
      category: 'Digital Commerce',
      owner: OWNER,
      phase: 'development',
      devStage: 'Approval',
      requirements: requirementsFor('Approval', ['in-progress', 'complete', 'in-progress', 'complete'], {
        0: { owner: 'Product Investment Board', reviewId: 'review-sme-investment' },
      }),
      activity: [
        entry('requirement', 'Delivery plan agreed', 4),
        entry('stage', 'Advanced to Approval', 12, 'Discovery gate passed.'),
        entry('created', 'Product created', 110),
      ],
      createdAt: daysAgo(110),
    },
  ];
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function action(
  productId: string,
  title: string,
  priority: ActionItem['priority'],
  dueInDays: number,
  source: string,
  link: string,
): ActionItem {
  return {
    id: nextId('action-'),
    productId,
    title,
    priority,
    due: dateFromToday(dueInDays),
    source,
    status: 'open',
    link,
    createdAt: daysAgo(8),
  };
}

function actions(): ActionItem[] {
  return [
    action('ai-inference', 'Complete technical feasibility assessment', 'High', 2, 'Discovery requirement', '/products/ai-inference/development'),
    action('ai-inference', 'Book GPU capacity cost review with Finance', 'Medium', 6, 'Business case', '/products/ai-inference/development'),
    action('cloud-connect', 'Review Q4 growth investment options', 'Low', 14, 'Lifecycle review', '/products/cloud-connect/decision'),
    action('managed-firewall', 'Review premium SLA pricing', 'Medium', 7, 'Governance: Pricing review', '/governance/review-fw-pricing'),
    action('managed-firewall', 'Confirm support cost baseline with Service Operations', 'Low', 10, 'Lifecycle review', '/products/managed-firewall/lifecycle'),
    action('legacy-mpls', 'Prepare migration business case', 'High', -5, 'Governance: Retirement approval', '/governance/review-mpls-retirement'),
    action('legacy-mpls', 'Identify customers with contracts beyond end-of-life date', 'High', 1, 'Governance: Retirement approval', '/governance/review-mpls-retirement'),
    action('hosted-pbx', 'Confirm final decommission date with Network Operations', 'Medium', 3, 'Lifecycle decision', '/products/hosted-pbx/decision'),
    action('hosted-pbx', 'Chase 12 customers without a migration date', 'High', 8, 'Lifecycle decision', '/products/hosted-pbx'),
    action('managed-kubernetes-plus', 'Agree pricing hypothesis with Sales', 'Medium', 4, 'Business Case requirement', '/products/managed-kubernetes-plus/development'),
    action('sme-commerce-hub', 'Submit investment case to Product Investment Board', 'High', 3, 'Governance: Approve investment', '/governance/review-sme-investment'),
  ];
}

// ---------------------------------------------------------------------------
// Governance reviews
// ---------------------------------------------------------------------------

/** Each item is [title, file name if attached, otherwise null]. */
function evidence(...items: [title: string, attachedAs: string | null][]): ReviewEvidence[] {
  return items.map(([title, attachedAs]) => ({
    id: nextId('rev-ev-'),
    title,
    provided: attachedAs !== null,
    attachedAs: attachedAs ?? undefined,
  }));
}

function reviews(): Review[] {
  return [
    {
      id: 'review-mpls-retirement',
      productId: 'legacy-mpls',
      decision: 'Approve retirement',
      status: 'draft',
      forum: 'Product Portfolio Board',
      forumDate: dateFromToday(21),
      customerImplications:
        '118 customers are on the service. 23 have contracts running beyond the proposed end-of-life date and need individual migration plans.',
      risks: [
        'Revenue of £42.5m a year falls away before successor products absorb it',
        '23 contracted customers could escalate if migration slips',
        'Support cost is rising 26% while the customer base shrinks',
      ],
      recommendation: 'Approve retirement with an 18-month runway from end-of-sale to end-of-life, subject to an approved migration plan.',
      evidence: evidence(
        ['Retirement business case', null],
        ['Customer migration plan', null],
        ['Financial impact analysis', 'MPLS financial impact v3.xlsx'],
        ['Customer communications plan', 'Draft communications plan.docx'],
      ),
      notes: '',
      log: [],
    },
    {
      id: 'review-ai-scale-investment',
      productId: 'ai-inference',
      decision: 'Approve scale investment',
      status: 'draft',
      forum: 'Product Investment Board',
      forumDate: dateFromToday(28),
      requestedInvestment: '£4.2m over 24 months',
      customerImplications: 'Three design-partner customers are waiting for committed GPU capacity before signing multi-year contracts.',
      risks: ['GPU supply and pricing volatility', 'Technical feasibility assessment is still open', 'Competing hyperscaler offerings'],
      recommendation: 'Approve staged investment: £1.2m to complete discovery and build the MVP, with the remainder released at the launch gate.',
      evidence: evidence(
        ['Investment case', 'AI Inference investment case v1.pdf'],
        ['Financial model', 'GPU unit economics model.xlsx'],
        ['Delivery plan', null],
        ['Risk register', 'Risk register.xlsx'],
      ),
      notes: '',
      log: [],
    },
    {
      id: 'review-pbx-eol',
      productId: 'hosted-pbx',
      decision: 'Approve end-of-life',
      status: 'submitted',
      forum: 'Product Portfolio Board',
      forumDate: dateFromToday(5),
      customerImplications: '74 customers remain; 12 have not confirmed a migration date. The successor is Cloud Telephony.',
      risks: ['Voice outages during migration cutovers', '12 unconfirmed customers: reputational risk if migration is forced'],
      recommendation: 'Approve end-of-life in nine months, with end-of-sale effective immediately.',
      evidence: evidence(
        ['Retirement business case', 'PBX retirement case.pdf'],
        ['Customer migration plan', 'PBX migration plan v2.pdf'],
        ['Financial impact analysis', 'PBX financial impact.xlsx'],
        ['Customer communications plan', 'PBX communications plan.docx'],
      ),
      notes: 'Board pre-read circulated.',
      log: [
        { id: nextId('act-'), at: daysAgo(4), actor: OWNER, kind: 'governance', title: 'Submitted to Product Portfolio Board' },
        { id: nextId('act-'), at: daysAgo(12), actor: OWNER, kind: 'governance', title: 'Review created from lifecycle decision' },
      ],
    },
    {
      id: 'review-fw-pricing',
      productId: 'managed-firewall',
      decision: 'Approve pricing change',
      status: 'draft',
      forum: 'Pricing Council',
      forumDate: dateFromToday(16),
      customerImplications: 'A premium service-level tier would affect roughly 210 enterprise customers. There is no change for the standard tier.',
      risks: ['Churn among price-sensitive accounts', 'Competitors undercutting the premium service level'],
      recommendation: 'Introduce a premium service-level tier at +8% and hold standard-tier pricing.',
      evidence: evidence(
        ['Pricing impact assessment', 'Firewall pricing model.xlsx'],
        ['Competitor price benchmark', 'Benchmark Q3.pdf'],
        ['Customer impact assessment', 'Firewall customer impact.xlsx'],
      ),
      notes: '',
      log: [],
    },
    {
      id: 'review-sme-investment',
      productId: 'sme-commerce-hub',
      decision: 'Approve investment',
      status: 'draft',
      forum: 'Product Investment Board',
      forumDate: dateFromToday(12),
      requestedInvestment: '£2.8m over 18 months',
      customerImplications: 'A pilot with 40 small-business customers is complete; 31 expressed intent to purchase at the proposed price.',
      risks: ['Small-business acquisition cost is higher than modelled', 'Dependency on the payments partner'],
      recommendation: 'Approve £2.8m to build and launch the mobile-first MVP.',
      evidence: evidence(
        ['Investment case', 'SME Commerce investment case.pdf'],
        ['Financial model', 'SME Commerce model v4.xlsx'],
        ['Delivery plan', 'Delivery plan.pdf'],
        ['Risk register', null],
      ),
      notes: '',
      log: [],
    },
  ];
}

/** Builds a fresh copy of the dummy portfolio, with dates relative to today. */
export function createPortfolio(): Portfolio {
  counter = 0;
  seeding = true;
  const portfolio: Portfolio = { owner: OWNER, products: products(), actions: actions(), reviews: reviews() };
  seeding = false;
  return portfolio;
}

/** The standard stage-gate requirements for a brand new product: everything not started. */
export function newProductRequirements(): Record<DevStage, Requirement[]> {
  return requirementsFor('Idea');
}
