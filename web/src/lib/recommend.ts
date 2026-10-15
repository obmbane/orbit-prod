import { LifecycleAction, MaturityStage, Metrics, Product } from '../types';
import { money, num, pct } from './format';

export interface EvidenceItem {
  label: string;
  value: string;
  tone: 'good' | 'neutral' | 'bad';
}

export interface Recommendation {
  action: LifecycleAction;
  headline: string;
  reason: string;
  evidence: EvidenceItem[];
  risks: string[];
  alternatives: LifecycleAction[];
  /** The organisational decision this action needs, if any. */
  governanceDecision?: string;
}

export const GOVERNANCE_FOR_ACTION: Partial<Record<LifecycleAction, string>> = {
  Invest: 'Approve investment',
  Accelerate: 'Approve additional funding',
  Reposition: 'Approve repositioning',
  Consolidate: 'Approve consolidation',
  Harvest: 'Approve harvest plan',
  Retire: 'Approve retirement',
};

export const FOLLOW_UPS: Record<LifecycleAction, string[]> = {
  Invest: ['Draft investment case', 'Define success metrics for the investment period'],
  Accelerate: ['Draft additional funding request', 'Agree growth targets with Sales and Marketing'],
  Maintain: ['Set margin and support-cost guardrails', 'Schedule the next lifecycle review (six months)'],
  Optimise: ['Identify the top three cost-to-serve reductions', 'Review pricing and packaging'],
  Reposition: ['Define target segment and positioning', 'Build the repositioning business case'],
  Consolidate: ['Map overlap with successor products', 'Draft the consolidation plan'],
  Harvest: ['Freeze roadmap investment', 'Set price and support policy for the harvest period'],
  Retire: ['Prepare the customer migration plan', 'Draft the retirement business case', 'Agree end-of-sale and end-of-life dates'],
};

export const REVIEW_EVIDENCE: Record<string, string[]> = {
  'Approve retirement': ['Retirement business case', 'Customer migration plan', 'Financial impact analysis', 'Customer communications plan'],
  'Approve investment': ['Investment case', 'Financial model', 'Delivery plan', 'Risk register'],
  'Approve additional funding': ['Funding request', 'Growth plan and targets', 'Financial model'],
  'Approve repositioning': ['Positioning options paper', 'Market analysis', 'Pricing impact assessment'],
  'Approve consolidation': ['Overlap analysis', 'Consolidation plan', 'Customer impact assessment'],
  'Approve harvest plan': ['Harvest financial plan', 'Support policy for the harvest period', 'Customer communications plan'],
};

export const ACTION_BLURB: Record<LifecycleAction, string> = {
  Invest: 'Put money behind establishing or extending the product.',
  Accelerate: 'Grow faster than the market while momentum is strong.',
  Maintain: 'Protect the existing base and keep running costs steady.',
  Optimise: 'Improve margin and cost-to-serve without new feature investment.',
  Reposition: 'Change segment, packaging or proposition to regain relevance.',
  Consolidate: 'Merge into, or migrate toward, a successor product.',
  Harvest: 'Stop investing and take the remaining value from the base.',
  Retire: 'Plan end-of-sale and end-of-life, and migrate customers.',
};

const low = (level: string) => level.toLowerCase();

function evidenceFor(m: Metrics): EvidenceItem[] {
  const tone = (value: number, goodAtOrAbove: number, badAtOrBelow: number): EvidenceItem['tone'] =>
    value >= goodAtOrAbove ? 'good' : value <= badAtOrBelow ? 'bad' : 'neutral';
  return [
    { label: 'Revenue', value: `${money(m.revenue)} (${pct(m.revenueGrowth)})`, tone: tone(m.revenueGrowth, 8, -2) },
    { label: 'Customers', value: `${num(m.customers)} (${pct(m.customerGrowth)})`, tone: tone(m.customerGrowth, 8, -2) },
    { label: 'Gross margin', value: `${m.margin}%`, tone: tone(m.margin, 35, 24) },
    { label: 'Customer health', value: `${m.customerHealth}/100`, tone: tone(m.customerHealth, 75, 59) },
    { label: 'Support cost', value: `${pct(m.supportCostChange)} YoY`, tone: m.supportCostChange > 15 ? 'bad' : m.supportCostChange <= 5 ? 'good' : 'neutral' },
    { label: 'Strategic relevance', value: m.strategicRelevance, tone: m.strategicRelevance === 'High' ? 'good' : m.strategicRelevance === 'Low' ? 'bad' : 'neutral' },
    { label: 'Competitive pressure', value: m.competitivePressure, tone: m.competitivePressure === 'High' ? 'bad' : m.competitivePressure === 'Low' ? 'good' : 'neutral' },
  ];
}

/** Recommends a lifecycle action for a live product, from its confirmed maturity stage and signals. */
export function recommend(product: Product, stage: MaturityStage): Recommendation {
  const m = product.metrics;
  if (!m) {
    return {
      action: 'Invest',
      headline: 'Invest to establish the product',
      reason: 'The product has only just launched and has no commercial data yet. The priority is to establish a baseline and win early customers.',
      evidence: [{ label: 'Commercial data', value: 'Not yet available', tone: 'neutral' }],
      risks: ['There is no baseline yet. The recommendation will sharpen after the first billing cycle.'],
      alternatives: ['Maintain'],
      governanceDecision: GOVERNANCE_FOR_ACTION.Invest,
    };
  }

  let action: LifecycleAction;
  let headline: string;
  let reason: string;
  let risks: string[];
  let alternatives: LifecycleAction[];

  switch (stage) {
    case 'Introduction':
      action = 'Invest';
      headline = 'Invest to establish the product';
      reason = `The product is ${m.monthsLive} months old with ${num(m.customers)} customers. Strategic relevance is ${low(m.strategicRelevance)}, so funding adoption now is likely to pay back more than waiting for the data to mature.`;
      risks = ['Adoption may not follow investment if the proposition is unproven.', 'Margin is not yet representative of steady state.'];
      alternatives = ['Accelerate', 'Maintain'];
      break;
    case 'Growth':
      if (m.revenueGrowth >= 25 && m.strategicRelevance !== 'Low') {
        action = 'Accelerate';
        headline = 'Accelerate growth';
        reason = `Revenue is growing ${pct(m.revenueGrowth)} and customers ${pct(m.customerGrowth)}, with usage up ${pct(m.usageGrowth)}. Strategic relevance is ${low(m.strategicRelevance)}. The market is rewarding the product, so additional funding is likely to compound.`;
        risks = [
          `Margin of ${m.margin}% could compress if growth is bought with discounting.`,
          `Support cost is ${pct(m.supportCostChange)}: scale operations before adding load.`,
          `Competitive pressure is ${low(m.competitivePressure)}.`,
        ];
        alternatives = ['Invest', 'Optimise'];
      } else {
        action = 'Invest';
        headline = 'Invest selectively';
        reason = `Growth is positive (${pct(m.revenueGrowth)}) but not exceptional. Focus investment where customer growth and usage are strongest.`;
        risks = ['Growth may plateau earlier than expected.'];
        alternatives = ['Accelerate', 'Maintain'];
      }
      break;
    case 'Maturity':
      if (m.competitivePressure === 'High' && m.revenueGrowth < 2) {
        action = 'Reposition';
        headline = 'Reposition against competitive pressure';
        reason = `Revenue is flat (${pct(m.revenueGrowth)}) while competitive pressure is high. Holding position is unlikely to be enough.`;
        risks = ['Repositioning can unsettle the existing base.'];
        alternatives = ['Optimise', 'Maintain'];
      } else if (m.margin < 25) {
        action = 'Optimise';
        headline = 'Optimise margin';
        reason = `Revenue is steady (${pct(m.revenueGrowth)}) but gross margin of ${m.margin}% is below the 25% a mature service should earn. Cost-to-serve and pricing are the levers.`;
        risks = ['Price increases may accelerate churn.'];
        alternatives = ['Reposition', 'Harvest'];
      } else {
        action = 'Maintain';
        headline = 'Maintain and optimise';
        reason = `Revenue remains stable (${pct(m.revenueGrowth)}) and margins are healthy at ${m.margin}%, but market growth has slowed (customers ${pct(m.customerGrowth)}). Strategic relevance is ${low(m.strategicRelevance)}, so protecting the base and tightening cost-to-serve beats new growth investment.`;
        risks = [
          'Under-investment could let competitors erode the base over time.',
          `Competitive pressure is ${low(m.competitivePressure)}: watch renewal rates.`,
          'Price rises on a flat base need care.',
        ];
        alternatives = ['Optimise', 'Reposition'];
      }
      break;
    case 'Decline':
      if (m.strategicRelevance === 'Low' && m.margin < 25) {
        action = 'Retire';
        headline = 'Plan retirement';
        reason = `Revenue is down ${Math.abs(m.revenueGrowth)}% and the customer base is down ${Math.abs(m.customerGrowth)}%. A margin of ${m.margin}% leaves little room to absorb support cost rising ${pct(m.supportCostChange)}. Strategic relevance is low, so continued operation is hard to justify.`;
        risks = [...m.facts, 'Retirement affects contracted customers, so a migration path must exist first.', 'Revenue will fall sharply before replacement products absorb it.'];
        alternatives = ['Harvest', 'Consolidate'];
      } else if (m.strategicRelevance === 'Low') {
        action = 'Harvest';
        headline = 'Harvest the base';
        reason = `The product is declining (${pct(m.revenueGrowth)}) but still earns a ${m.margin}% margin. With low strategic relevance, stop investing and take the value while it lasts.`;
        risks = ['Customer experience will decline as investment stops.'];
        alternatives = ['Retire', 'Consolidate'];
      } else {
        action = 'Reposition';
        headline = 'Reposition or consolidate';
        reason = `The product is declining but remains strategically ${low(m.strategicRelevance)}. A new proposition, or migration toward a successor, may recover value.`;
        risks = ['Repositioning may not reverse the decline.'];
        alternatives = ['Consolidate', 'Harvest'];
      }
      break;
    default:
      action = 'Retire';
      headline = 'Complete retirement';
      reason = `Revenue is down ${Math.abs(m.revenueGrowth)}% and the customer base is down ${Math.abs(m.customerGrowth)}% at a ${m.margin}% margin. The product is being replaced, so the remaining job is orderly migration and decommissioning.`;
      risks = [...m.facts, 'Remaining customers on long contracts need individual migration plans.'];
      alternatives = ['Consolidate'];
  }

  return { action, headline, reason, evidence: evidenceFor(m), risks, alternatives, governanceDecision: GOVERNANCE_FOR_ACTION[action] };
}
