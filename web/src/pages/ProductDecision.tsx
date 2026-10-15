import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AlertTriangle, Check, ChevronRight } from 'lucide-react';
import { Badge } from '../components/Badges';
import { fmtDate } from '../lib/dates';
import { ACTION_BLURB, FOLLOW_UPS, GOVERNANCE_FOR_ACTION, recommend } from '../lib/recommend';
import { usePortfolio, usePortfolioActions } from '../portfolio-context';
import { LIFECYCLE_ACTIONS, LifecycleAction } from '../types';
import { ProductContext } from './ProductLayout';

type Mode = 'accept' | 'modify' | 'reject' | 'investigate' | null;

const MODES: { mode: Exclude<Mode, null>; label: string; hint: string }[] = [
  { mode: 'accept', label: 'Accept', hint: 'Agree with the recommendation' },
  { mode: 'modify', label: 'Modify', hint: 'Choose a different action' },
  { mode: 'reject', label: 'Reject', hint: 'Take no lifecycle action' },
  { mode: 'investigate', label: 'Investigate further', hint: 'I need more information' },
];

export default function ProductDecision() {
  const { product } = useOutletContext<ProductContext>();
  const portfolio = usePortfolio();
  const { decideLifecycle, reopenDecision } = usePortfolioActions();

  const [mode, setMode] = useState<Mode>(null);
  const [rationale, setRationale] = useState('');
  const [chosen, setChosen] = useState<LifecycleAction>('Optimise');
  const [skipped, setSkipped] = useState<Set<string>>(new Set());

  if (product.phase !== 'live' || !product.maturity)
    return (
      <div className="card empty">
        <strong>Not launched yet</strong>
        <p>Lifecycle decisions are made once a product is live.</p>
      </div>
    );

  const stage = product.maturity;
  const rec = recommend(product, stage);
  const decision = product.lifecycleDecision;
  const decided = decision && decision.status !== 'investigating';
  const review = decision?.reviewId ? portfolio.reviews.find((r) => r.id === decision.reviewId) : undefined;
  const followUps = decision?.chosen ? portfolio.actions.filter((a) => a.productId === product.id && a.source === `Lifecycle decision: ${decision.chosen}`) : [];

  const action = mode === 'modify' ? chosen : rec.action;
  const suggestedFollowUps = FOLLOW_UPS[action];
  const governance = GOVERNANCE_FOR_ACTION[action];
  const needsReason = mode === 'modify' || mode === 'reject' || mode === 'investigate';
  const canConfirm = !needsReason || rationale.trim().length > 0;

  const start = (m: Exclude<Mode, null>) => {
    setMode(m);
    setRationale('');
    setSkipped(new Set());
    if (m === 'modify') setChosen(rec.alternatives[0]);
  };

  const confirm = () => {
    if (mode === 'accept' || mode === 'modify') {
      decideLifecycle(product.id, {
        kind: mode,
        chosen: action,
        recommended: rec.action,
        rationale: rationale.trim() || `Accepted Orbit's recommendation: ${rec.headline}.`,
        followUps: suggestedFollowUps.filter((f) => !skipped.has(f)),
      });
    } else if (mode === 'reject' || mode === 'investigate') {
      decideLifecycle(product.id, { kind: mode, recommended: rec.action, rationale: rationale.trim() });
    }
    setMode(null);
  };

  const toggle = (item: string) => {
    const next = new Set(skipped);
    if (next.has(item)) next.delete(item);
    else next.add(item);
    setSkipped(next);
  };

  return (
    <div className="stack">
      {!product.maturityConfirmedAt && (
        <div className="callout blue">
          <AlertTriangle size={16} />
          <span>
            This recommendation is based on the suggested stage. You haven't confirmed it yet.{' '}
            <Link to="../lifecycle" className="arrow-link">
              Confirm the maturity stage first
            </Link>
          </span>
        </div>
      )}

      <section className="card accent" aria-labelledby="rec">
        <div className="eyebrow">Recommended lifecycle action · {product.name} is in {stage}</div>
        <div className="actions-strip" aria-label="Lifecycle actions">
          {LIFECYCLE_ACTIONS.map((a) => (
            <span key={a} className={`act-chip${a === rec.action ? ' rec' : ''}${decided && decision?.chosen === a ? ' chosen' : ''}`} title={ACTION_BLURB[a]}>
              {a}
            </span>
          ))}
        </div>
        <h2 id="rec" className="assess-title">
          {rec.headline}
        </h2>
        <p>{rec.reason}</p>

        <div className="grid-2 gap">
          <div>
            <h3 className="label">Evidence</h3>
            {rec.evidence.map((e) => (
              <div key={e.label} className="ev-row">
                <span className="muted">{e.label}</span>
                <span className={`val ${e.tone}`}>{e.value}</span>
              </div>
            ))}
          </div>
          <div>
            <h3 className="label">Risks and considerations</h3>
            <ul className="clean bullets">
              {rec.risks.map((r) => (
                <li key={r}>
                  <AlertTriangle size={14} className="amber-text" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
            {rec.governanceDecision && !decided && (
              <div className="callout violet gap">
                <span>
                  Needs an organisational decision: <strong>{rec.governanceDecision}</strong>.
                </span>
              </div>
            )}
          </div>
        </div>
      </section>

      {decision?.status === 'investigating' && (
        <div className="callout blue">
          <span className="grow">
            <strong>Investigating further.</strong> {decision.rationale}
          </span>
          <button className="btn" onClick={() => reopenDecision(product.id)}>
            Decide now
          </button>
        </div>
      )}

      {decided && decision ? (
        <section className="card" aria-labelledby="decision">
          <div className="row">
            <h2 id="decision" className="grow">
              Your decision
            </h2>
            <Badge tone={decision.status === 'rejected' ? 'grey' : 'green'}>
              {decision.status === 'accepted' ? 'Accepted' : decision.status === 'modified' ? 'Modified' : 'Rejected'}
            </Badge>
          </div>
          <p className="decision-line">
            {decision.chosen ? (
              <>
                <strong>{decision.chosen}</strong>
                {decision.chosen !== decision.recommended && <span className="muted"> (Orbit recommended {decision.recommended})</span>}
              </>
            ) : (
              <strong>No lifecycle action taken</strong>
            )}
          </p>
          <p className="muted">{decision.rationale}</p>
          <p className="faint small">
            Recorded {fmtDate(decision.decidedAt)} while the product was in {decision.stage}.
          </p>

          {followUps.length > 0 && (
            <>
              <h3 className="label gap">Follow-up actions</h3>
              <ul className="clean">
                {followUps.map((a) => (
                  <li key={a.id}>
                    <span className={a.status === 'done' ? 'muted strike' : ''}>{a.title}</span>
                    <span className="muted small">{a.status === 'done' ? 'Done' : `Due ${fmtDate(a.due)}`}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          {review && (
            <div className="callout violet gap">
              <Check size={16} />
              <span>
                Governance review: <strong>{review.decision}</strong> ({review.status}).{' '}
                <Link to={`/governance/${review.id}`} className="arrow-link">
                  Open the review <ChevronRight size={14} />
                </Link>
              </span>
            </div>
          )}
          <div className="foot gap">
            <button className="btn" onClick={() => reopenDecision(product.id)}>
              Reopen decision
            </button>
          </div>
        </section>
      ) : (
        <section className="card" aria-labelledby="your-call">
          <h2 id="your-call" className="card-title">
            Your call
          </h2>
          <p className="muted small">Orbit recommends. You decide, and your reasoning is recorded.</p>
          <div className="mode-grid gap">
            {MODES.map((m) => (
              <button key={m.mode} className={`mode${mode === m.mode ? ' on' : ''}`} onClick={() => start(m.mode)} aria-pressed={mode === m.mode}>
                <strong>{m.label}</strong>
                <span className="muted small">{m.hint}</span>
              </button>
            ))}
          </div>

          {mode && (
            <div className="form gap">
              {mode === 'modify' && (
                <div>
                  <h3 className="label">Choose a different action</h3>
                  <div className="actions-strip">
                    {LIFECYCLE_ACTIONS.filter((a) => a !== rec.action).map((a) => (
                      <button key={a} className={`act-chip pick${chosen === a ? ' picked' : ''}`} onClick={() => setChosen(a)} title={ACTION_BLURB[a]}>
                        {a}
                      </button>
                    ))}
                  </div>
                  <p className="muted small gap">{ACTION_BLURB[chosen]}</p>
                </div>
              )}

              <label className="field">
                {mode === 'investigate'
                  ? 'What do you need to find out?'
                  : mode === 'reject'
                    ? 'Why are you rejecting the recommendation?'
                    : mode === 'modify'
                      ? 'Why a different action? (required)'
                      : 'Your reasoning (optional)'}
                <textarea value={rationale} onChange={(e) => setRationale(e.target.value)} rows={3} autoFocus />
              </label>

              {(mode === 'accept' || mode === 'modify') && (
                <div>
                  <h3 className="label">Follow-up actions to create</h3>
                  <div className="checks">
                    {suggestedFollowUps.map((f) => (
                      <label key={f} className="check-row">
                        <input type="checkbox" checked={!skipped.has(f)} onChange={() => toggle(f)} /> {f}
                      </label>
                    ))}
                  </div>
                  {governance && (
                    <p className="muted small gap">
                      This also creates (or links) a governance review: <strong>{governance}</strong>.
                    </p>
                  )}
                </div>
              )}

              <div className="foot">
                <button className="btn" onClick={() => setMode(null)}>
                  Cancel
                </button>
                <button className="btn primary" disabled={!canConfirm} onClick={confirm}>
                  {mode === 'accept' ? `Accept: ${rec.action}` : mode === 'modify' ? `Decide: ${chosen}` : mode === 'reject' ? 'Reject recommendation' : 'Investigate further'}
                </button>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
