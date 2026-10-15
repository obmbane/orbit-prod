import { Product, Review } from '../types';
import { addDaysIso } from './dates';
import { money, num, pct, uid } from './format';
import { REVIEW_EVIDENCE } from './recommend';

const FORUM: Record<string, string> = {
  'Approve pricing change': 'Pricing Council',
  'Approve retirement': 'Product Portfolio Board',
  'Approve end-of-life': 'Product Portfolio Board',
};

/** Treat "end-of-life" and "retirement" approvals as the same decision when looking for an existing review. */
export const normaliseDecision = (decision: string) => decision.toLowerCase().replace('end-of-life', 'retirement');

/** A draft governance review for a decision, with the standard evidence checklist and facts from the product. */
export function newReview(product: Product, decision: string, recommendation: string, risks: string[]): Review {
  const m = product.metrics;
  const facts = m?.facts.length ? ` ${m.facts.join('. ')}.` : '';
  return {
    id: `review-${uid()}`,
    productId: product.id,
    decision,
    status: 'draft',
    forum: FORUM[decision] ?? 'Product Investment Board',
    forumDate: addDaysIso(21),
    customerImplications: m
      ? `${num(m.customers)} customers are on the service (${pct(m.customerGrowth)} YoY).${facts} Revenue at stake: ${money(m.revenue)} a year.`
      : 'Customer implications to be confirmed.',
    risks,
    recommendation,
    evidence: (REVIEW_EVIDENCE[decision] ?? ['Supporting case', 'Financial model']).map((title) => ({ id: uid(), title, provided: false })),
    notes: '',
    log: [],
  };
}
