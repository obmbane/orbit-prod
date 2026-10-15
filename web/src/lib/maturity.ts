import { MATURITY_STAGES, MaturityStage, Metrics } from '../types';
import { pct } from './format';

export type Trend = 'improving' | 'deteriorating' | 'stable';

export interface Signal {
  key: string;
  group: 'Commercial' | 'Customer' | 'Operational' | 'Strategic';
  label: string;
  value: string;
  /** The maturity stage this signal is most consistent with, or null if it says nothing either way. */
  pointsTo: MaturityStage | null;
  weight: number;
  trend: Trend;
  explain: string;
}

export interface Assessment {
  suggested: MaturityStage;
  confidence: 'High' | 'Medium' | 'Low';
  scores: Record<MaturityStage, number>;
  signals: Signal[];
  /** Signals that point to a different stage than the suggested one. */
  dissent: Signal[];
  trajectory: { direction: Trend; improving: number; deteriorating: number; total: number };
  summary: string;
}

type Bands = [growth: number, maturity: number, decline: number];

const band = (value: number, [growth, maturity, decline]: Bands, young: boolean): MaturityStage =>
  young ? 'Introduction' : value >= growth ? 'Growth' : value >= maturity ? 'Maturity' : value > decline ? 'Decline' : 'Retirement';

const trendOf = (now: number, before: number, higherIsBetter = true): Trend => {
  const change = (now - before) * (higherIsBetter ? 1 : -1);
  return change > 1 ? 'improving' : change < -1 ? 'deteriorating' : 'stable';
};

/**
 * Looks at a live product's signals and suggests a maturity stage, with the reasoning.
 * It only recommends: the Product Manager confirms or changes the classification.
 */
export function assessMaturity(m: Metrics): Assessment {
  const young = m.monthsLive < 12;
  const signals: Signal[] = [];

  if (young)
    signals.push({
      key: 'age',
      group: 'Commercial',
      label: 'Time since launch',
      value: `${m.monthsLive} months`,
      pointsTo: 'Introduction',
      weight: 3,
      trend: 'stable',
      explain: 'Products in their first year are still establishing the market, whatever early growth looks like.',
    });

  signals.push(
    {
      key: 'revenueGrowth',
      group: 'Commercial',
      label: 'Revenue growth',
      value: pct(m.revenueGrowth),
      pointsTo: band(m.revenueGrowth, [8, -2, -25], young),
      weight: 3,
      trend: trendOf(m.revenueGrowth, m.previous.revenueGrowth),
      explain: young
        ? 'Growth from a small base is not yet a reliable maturity signal.'
        : 'Above +8% suggests Growth, roughly flat suggests Maturity, sustained contraction suggests Decline, and steep contraction Retirement.',
    },
    {
      key: 'margin',
      group: 'Commercial',
      label: 'Gross margin',
      value: `${m.margin}%`,
      pointsTo: young ? null : m.margin >= 40 ? 'Growth' : m.margin >= 25 ? 'Maturity' : m.margin >= 12 ? 'Decline' : 'Retirement',
      weight: 1,
      trend: trendOf(m.margin, m.previous.margin),
      explain: 'A margin of 25–40% is typical of a mature service. Below 25% suggests the product is losing pricing power or scale.',
    },
    {
      key: 'customerGrowth',
      group: 'Customer',
      label: 'Customer growth',
      value: pct(m.customerGrowth),
      pointsTo: band(m.customerGrowth, [10, -2, -30], young),
      weight: 2,
      trend: trendOf(m.customerGrowth, m.previous.customerGrowth),
      explain: 'Net new customers are the clearest sign of market momentum. A shrinking base points to Decline.',
    },
    {
      key: 'usageGrowth',
      group: 'Customer',
      label: 'Product usage',
      value: pct(m.usageGrowth),
      pointsTo: band(m.usageGrowth, [15, -3, -30], young),
      weight: 2,
      trend: trendOf(m.usageGrowth, m.previous.usageGrowth),
      explain: 'Usage shows whether existing customers still rely on the product, independent of contract renewals.',
    },
    {
      key: 'customerHealth',
      group: 'Customer',
      label: 'Customer health',
      value: `${m.customerHealth}/100`,
      pointsTo: m.customerHealth < 60 ? 'Decline' : null,
      weight: 1,
      trend: trendOf(m.customerHealth, m.previous.customerHealth),
      explain: 'Health scores under 60 indicate churn risk and are consistent with Decline.',
    },
    {
      key: 'support',
      group: 'Operational',
      label: 'Support cost',
      value: `${pct(m.supportCostChange)} YoY, ${m.incidentsPerMonth} incidents a month`,
      pointsTo: m.supportCostChange > 15 ? 'Decline' : null,
      weight: 1,
      trend: trendOf(m.supportCostChange, m.previous.supportCostChange, false),
      explain: 'Rising support cost on a shrinking or flat base is typical of legacy products.',
    },
    {
      key: 'strategic',
      group: 'Strategic',
      label: 'Strategic relevance',
      value: m.strategicRelevance,
      pointsTo: m.strategicRelevance === 'Low' ? 'Decline' : null,
      weight: 2,
      trend: 'stable',
      explain: 'Low strategic relevance means the portfolio would not choose to invest here today.',
    },
    {
      key: 'competition',
      group: 'Strategic',
      label: 'Competitive pressure',
      value: m.competitivePressure,
      pointsTo: m.competitivePressure === 'High' && m.revenueGrowth < 5 ? 'Decline' : null,
      weight: 1,
      trend: 'stable',
      explain: 'High competitive pressure only counts against the product when it is not also growing.',
    },
  );

  const scores = Object.fromEntries(MATURITY_STAGES.map((s) => [s, 0])) as Record<MaturityStage, number>;
  signals.forEach((s) => s.pointsTo && (scores[s.pointsTo] += s.weight));
  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1;
  const suggested = MATURITY_STAGES.reduce((best, s) => (scores[s] > scores[best] ? s : best), MATURITY_STAGES[0]);
  const share = scores[suggested] / total;
  const confidence = share >= 0.7 ? 'High' : share >= 0.5 ? 'Medium' : 'Low';
  const dissent = signals.filter((s) => s.pointsTo && s.pointsTo !== suggested);

  const directional = signals.filter((s) => s.trend !== 'stable' || s.key === 'revenueGrowth' || s.key === 'margin');
  const improving = directional.filter((s) => s.trend === 'improving').length;
  const deteriorating = directional.filter((s) => s.trend === 'deteriorating').length;
  const direction: Trend = improving > deteriorating ? 'improving' : deteriorating > improving ? 'deteriorating' : 'stable';

  const withAView = signals.filter((s) => s.pointsTo);
  const supporting = withAView.filter((s) => s.pointsTo === suggested).length;
  const neutral = signals.length - withAView.length;
  let summary = `${supporting} of the ${withAView.length} signals that take a view point to ${suggested}${neutral ? `; ${neutral} ${neutral === 1 ? 'is' : 'are'} neutral` : ''}.`;
  if (dissent.length) {
    const stages = [...new Set(dissent.map((d) => d.pointsTo))].join(', ');
    summary += ` ${dissent.map((d) => d.label.toLowerCase()).join(' and ')} point${dissent.length === 1 ? 's' : ''} elsewhere (${stages}).`;
  }

  return { suggested, confidence, scores, signals, dissent, trajectory: { direction, improving, deteriorating, total: directional.length }, summary };
}
