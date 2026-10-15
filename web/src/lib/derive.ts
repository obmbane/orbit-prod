import { ActionItem, DEV_STAGES, Portfolio, Priority, Product, Review } from '../types';
import { daysUntil, dueLabel } from './dates';
import { plural } from './format';

export type Health = 'Healthy' | 'Watch' | 'At risk';

/** The stage gate for a pre-launch product: what is done, what is outstanding, what blocks it. */
export function gateOf(product: Product) {
  const requirements = product.requirements[product.devStage];
  const index = DEV_STAGES.indexOf(product.devStage);
  const next = index < DEV_STAGES.length - 1 ? DEV_STAGES[index + 1] : null;
  return {
    stage: product.devStage,
    next,
    nextLabel: next ?? 'Live',
    requirements,
    complete: requirements.filter((r) => r.status === 'complete').length,
    total: requirements.length,
    blockers: requirements.filter((r) => r.status === 'blocked'),
    ready: requirements.every((r) => r.status === 'complete'),
  };
}

export const openActions = (portfolio: Portfolio, productId?: string): ActionItem[] =>
  portfolio.actions
    .filter((a) => a.status === 'open' && (!productId || a.productId === productId))
    .sort((a, b) => a.due.localeCompare(b.due));

export const missingEvidence = (review: Review) => review.evidence.filter((e) => !e.provided);

export function healthOf(product: Product, portfolio: Portfolio): Health {
  if (product.phase === 'development') {
    const overdue = openActions(portfolio, product.id).some((a) => daysUntil(a.due) < 0);
    if (overdue) return 'At risk';
    return gateOf(product).blockers.length ? 'Watch' : 'Healthy';
  }
  const m = product.metrics;
  if (!m) return 'Watch';
  if (m.customerHealth < 55 || m.margin < 20 || m.revenueGrowth < -10) return 'At risk';
  if (m.customerHealth < 70 || m.margin < 28 || m.revenueGrowth < 0) return 'Watch';
  return 'Healthy';
}

export type AttentionKind = 'overdue' | 'action' | 'decision' | 'gate' | 'blocker' | 'evidence' | 'confirm';

export interface AttentionItem {
  id: string;
  productId: string;
  kind: AttentionKind;
  title: string;
  tag: string;
  tone: 'red' | 'amber' | 'blue' | 'green' | 'violet';
  score: number;
  to: string;
}

const PRIORITY_BONUS: Record<Priority, number> = { High: 10, Medium: 5, Low: 0 };

/** Everything that needs the Product Manager's attention for one product, most urgent first. */
export function attentionFor(portfolio: Portfolio, product: Product): AttentionItem[] {
  const items: AttentionItem[] = [];
  const push = (item: Omit<AttentionItem, 'id' | 'productId'>) =>
    items.push({ ...item, id: `${product.id}-${item.kind}-${items.length}`, productId: product.id });

  for (const action of openActions(portfolio, product.id)) {
    const days = daysUntil(action.due);
    const bonus = PRIORITY_BONUS[action.priority];
    if (days < 0) push({ kind: 'overdue', title: action.title, tag: dueLabel(action.due), tone: 'red', score: 85 + bonus, to: action.link });
    else if (days <= 5)
      push({ kind: 'action', title: action.title, tag: dueLabel(action.due), tone: days <= 2 ? 'amber' : 'blue', score: 60 + bonus - days, to: action.link });
    else push({ kind: 'action', title: action.title, tag: dueLabel(action.due), tone: 'blue', score: 25 + bonus - Math.min(days, 15), to: action.link });
  }

  if (product.phase === 'development') {
    const gate = gateOf(product);
    if (gate.ready)
      push({ kind: 'gate', title: `Ready to advance to ${gate.nextLabel}`, tag: 'Stage gate', tone: 'green', score: 75, to: `/products/${product.id}/development` });
    else if (gate.blockers.length)
      push({ kind: 'blocker', title: `${plural(gate.blockers.length, 'blocker')} before ${gate.nextLabel}`, tag: 'Blocked', tone: 'amber', score: 62, to: `/products/${product.id}/development?focus=${gate.blockers[0].id}` });
  } else {
    if (!product.maturityConfirmedAt)
      push({ kind: 'confirm', title: 'Confirm maturity stage', tag: 'Your call', tone: 'blue', score: 70, to: `/products/${product.id}/lifecycle` });
    const needsDecision = !product.lifecycleDecision || product.lifecycleDecision.status === 'investigating';
    if (needsDecision && (product.maturity === 'Decline' || product.maturity === 'Retirement'))
      push({ kind: 'decision', title: 'Lifecycle decision required', tag: 'Decision', tone: 'red', score: 90, to: `/products/${product.id}/decision` });
  }

  for (const review of portfolio.reviews.filter((r) => r.productId === product.id && r.status === 'draft')) {
    const missing = missingEvidence(review);
    if (missing.length)
      push({
        kind: 'evidence',
        title: `${review.decision}: ${plural(missing.length, 'item')} of evidence missing`,
        tag: 'Governance',
        tone: 'violet',
        score: 55 + (daysUntil(review.forumDate) < 14 ? 5 : 0),
        to: `/governance/${review.id}`,
      });
  }

  return items.sort((a, b) => b.score - a.score);
}

export const allAttention = (portfolio: Portfolio): AttentionItem[] =>
  portfolio.products.flatMap((p) => attentionFor(portfolio, p)).sort((a, b) => b.score - a.score);

export function priorityOf(items: AttentionItem[]): Priority {
  const top = items[0];
  if (!top) return 'Low';
  return top.score >= 80 ? 'High' : top.score >= 50 ? 'Medium' : 'Low';
}

export function stageProgress(product: Product, stage: (typeof DEV_STAGES)[number]) {
  const requirements = product.requirements[stage];
  return { complete: requirements.filter((r) => r.status === 'complete').length, total: requirements.length };
}
