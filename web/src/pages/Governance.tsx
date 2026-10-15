import { FormEvent, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { AlertTriangle, Check, ChevronRight, FileText } from 'lucide-react';
import { Badge, Tone } from '../components/Badges';
import { daysUntil, fmtDate, timeAgo } from '../lib/dates';
import { missingEvidence, gateOf } from '../lib/derive';
import { money, num, pct, plural } from '../lib/format';
import { usePortfolio, usePortfolioActions } from '../portfolio-context';
import { Product, Review, ReviewResult } from '../types';

const STATUS_LABEL: Record<Review['status'], string> = { draft: 'Draft', submitted: 'Submitted', decided: 'Decided' };
const STATUS_TONE: Record<Review['status'], Tone> = { draft: 'violet', submitted: 'blue', decided: 'green' };
const RESULTS: ReviewResult[] = ['Approved', 'Approved with conditions', 'Deferred', 'Rejected'];
const DEFAULT_FOLLOW_UP: Record<ReviewResult, string> = {
  Approved: 'Communicate the decision to stakeholders',
  'Approved with conditions': "Plan how to meet the board's conditions",
  Deferred: "Address the board's questions and resubmit",
  Rejected: "Review the board's feedback and revisit the lifecycle decision",
};

function Snapshot({ product, review }: { product: Product; review: Review }) {
  const m = product.metrics;
  const gate = gateOf(product);
  const cells: { label: string; value: string; sub?: string }[] =
    product.phase === 'live' && m
      ? [
          { label: 'Revenue', value: money(m.revenue), sub: `${pct(m.revenueGrowth)} YoY` },
          { label: 'Gross margin', value: `${m.margin}%` },
          { label: 'Customers', value: num(m.customers), sub: `${pct(m.customerGrowth)} YoY` },
          { label: 'Support cost', value: pct(m.supportCostChange), sub: `${m.incidentsPerMonth} incidents a month` },
          { label: 'Strategic relevance', value: m.strategicRelevance },
          { label: 'Competitive pressure', value: m.competitivePressure },
        ]
      : [
          { label: 'Stage', value: product.devStage },
          { label: 'Requirements', value: `${gate.complete} of ${gate.total} complete` },
          { label: 'Blockers', value: String(gate.blockers.length) },
          ...(review.requestedInvestment ? [{ label: 'Requested investment', value: review.requestedInvestment }] : []),
        ];
  return (
    <div className="kpis wide">
      {cells.map((c) => (
        <div key={c.label} className="kpi">
          <span className="muted small">{c.label}</span>
          <span className="kpi-v sm">{c.value}</span>
          {c.sub && <span className="muted small">{c.sub}</span>}
        </div>
      ))}
    </div>
  );
}

function EvidenceRow({ review, evidenceId, editable }: { review: Review; evidenceId: string; editable: boolean }) {
  const { attachEvidence } = usePortfolioActions();
  const item = review.evidence.find((e) => e.id === evidenceId)!;
  const [name, setName] = useState('');
  const [open, setOpen] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    attachEvidence(review.id, item.id, name.trim());
    setName('');
    setOpen(false);
  };

  return (
    <div className="evi">
      <span className={`status-ic ${item.provided ? 'complete' : 'blocked'}`}>
        {item.provided ? <Check size={14} strokeWidth={3} /> : <AlertTriangle size={13} />}
      </span>
      <span className="grow">
        <span className="item-title">{item.title}</span>
        {item.provided ? (
          <span className="muted small block">
            <FileText size={12} /> {item.attachedAs}
          </span>
        ) : (
          <span className="amber-text small block">Missing</span>
        )}
        {open && (
          <form onSubmit={submit} className="inline-form">
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="File name or link" aria-label={`Evidence for ${item.title}`} autoFocus />
            <button className="btn primary" type="submit" disabled={!name.trim()}>
              Attach
            </button>
            <button className="btn" type="button" onClick={() => setOpen(false)}>
              Cancel
            </button>
          </form>
        )}
      </span>
      {!item.provided && editable && !open && (
        <button className="btn" onClick={() => setOpen(true)}>
          Attach evidence
        </button>
      )}
    </div>
  );
}

function Detail({ review, product }: { review: Review; product: Product }) {
  const { submitReview, recordDecision, updateReviewNotes } = usePortfolioActions();
  const missing = missingEvidence(review);
  const provided = review.evidence.length - missing.length;
  const days = daysUntil(review.forumDate);
  const [notes, setNotes] = useState(review.notes);
  const [result, setResult] = useState<ReviewResult>('Approved');
  const [rationale, setRationale] = useState('');
  const [followUps, setFollowUps] = useState(DEFAULT_FOLLOW_UP.Approved);

  const pick = (r: ReviewResult) => {
    setResult(r);
    setFollowUps(DEFAULT_FOLLOW_UP[r]);
  };
  const record = (e: FormEvent) => {
    e.preventDefault();
    recordDecision(
      review.id,
      result,
      rationale.trim(),
      followUps.split('\n').map((l) => l.trim()).filter(Boolean),
    );
  };

  const step = review.status === 'draft' ? 0 : review.status === 'submitted' ? 1 : 2;

  return (
    <div className="stack">
      <section className="card" aria-labelledby="req">
        <div className="eyebrow">
          <Link to={`/products/${product.id}`} className="plain-link">
            {product.name}
          </Link>
        </div>
        <h2 id="req" className="assess-title">
          Decision requested: {review.decision}
        </h2>
        <p className="muted small">
          {review.forum} · {fmtDate(review.forumDate)} ({days < 0 ? `${-days} days ago` : days === 0 ? 'today' : `in ${plural(days, 'day')}`})
        </p>
        <div className="flow gap">
          {['Prepare', 'Submit', 'Decision'].map((label, i) => (
            <span key={label} className={i < step ? 'done' : i === step ? 'on' : ''}>
              {i < step && <Check size={12} strokeWidth={3} />} {label}
              {i < 2 && <span className="faint"> →</span>}
            </span>
          ))}
        </div>
      </section>

      <section className="card" aria-labelledby="rec-text">
        <h2 id="rec-text" className="card-title">
          Recommendation
        </h2>
        <p>{review.recommendation}</p>
      </section>

      <section className="card" aria-labelledby="snapshot">
        <h2 id="snapshot" className="card-title">
          Product snapshot
        </h2>
        <Snapshot product={product} review={review} />
        {review.requestedInvestment && product.phase === 'live' && (
          <p className="gap">
            <strong>Requested investment:</strong> {review.requestedInvestment}
          </p>
        )}
      </section>

      <div className="grid-2">
        <section className="card" aria-labelledby="customers">
          <h2 id="customers" className="card-title">
            Customer implications
          </h2>
          <p className="muted">{review.customerImplications}</p>
        </section>
        <section className="card" aria-labelledby="risks">
          <h2 id="risks" className="card-title">
            Risks
          </h2>
          <ul className="clean bullets">
            {review.risks.map((r) => (
              <li key={r}>
                <AlertTriangle size={14} className="amber-text" />
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card" aria-labelledby="evidence">
        <div className="row">
          <h2 id="evidence" className="grow">
            Evidence
          </h2>
          <Badge tone={missing.length ? 'amber' : 'green'}>
            {provided} of {review.evidence.length} provided
          </Badge>
        </div>
        {missing.length > 0 && review.status === 'draft' && (
          <div className="callout amber gap">
            <AlertTriangle size={16} />
            <span>
              <strong>Missing before this review:</strong> {missing.map((m) => m.title).join(', ')}.
            </span>
          </div>
        )}
        <div className="gap">
          {review.evidence.map((e) => (
            <EvidenceRow key={e.id} review={review} evidenceId={e.id} editable={review.status !== 'decided'} />
          ))}
        </div>
      </section>

      {review.status !== 'decided' && (
        <section className="card" aria-labelledby="notes">
          <h2 id="notes" className="card-title">
            Your notes for the board
          </h2>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => updateReviewNotes(review.id, notes)} rows={3} placeholder="Anything the board should know" />
        </section>
      )}

      {review.status === 'draft' && (
        <section className="card accent row">
          <div className="grow">
            <strong>{missing.length ? `${plural(missing.length, 'piece')} of evidence still missing.` : 'The pack is complete.'}</strong>
            <div className="muted small">
              {missing.length ? 'Attach the missing evidence to submit.' : `Submit it to the ${review.forum}.`}
            </div>
          </div>
          <button className="btn primary" disabled={missing.length > 0} onClick={() => submitReview(review.id)}>
            Submit to {review.forum}
          </button>
        </section>
      )}

      {review.status === 'submitted' && (
        <section className="card" aria-labelledby="record">
          <h2 id="record" className="card-title">
            Record the decision
          </h2>
          <form onSubmit={record} className="form">
            <div>
              <h3 className="label">Outcome</h3>
              <div className="actions-strip">
                {RESULTS.map((r) => (
                  <button type="button" key={r} className={`act-chip pick${result === r ? ' picked' : ''}`} onClick={() => pick(r)}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <label className="field">
              Rationale given by the board (required)
              <textarea value={rationale} onChange={(e) => setRationale(e.target.value)} rows={3} />
            </label>
            <label className="field">
              Follow-up actions, one per line
              <textarea value={followUps} onChange={(e) => setFollowUps(e.target.value)} rows={3} />
            </label>
            <div className="foot">
              <button className="btn primary" type="submit" disabled={!rationale.trim()}>
                Record decision
              </button>
            </div>
          </form>
        </section>
      )}

      {review.status === 'decided' && review.outcome && (
        <section className="card accent" aria-labelledby="outcome">
          <div className="row">
            <h2 id="outcome" className="grow">
              Decision
            </h2>
            <Badge tone={review.outcome.result === 'Rejected' ? 'red' : review.outcome.result === 'Deferred' ? 'amber' : 'green'}>{review.outcome.result}</Badge>
          </div>
          <p className="muted">{review.outcome.rationale}</p>
          <p className="faint small">Recorded {fmtDate(review.outcome.at)}</p>
        </section>
      )}

      <section className="card" aria-labelledby="audit">
        <h2 id="audit" className="card-title">
          Audit trail
        </h2>
        {review.log.length === 0 && <p className="muted small">No history yet.</p>}
        <div className="timeline">
          {review.log.map((l) => (
            <div key={l.id} className="tl">
              <i />
              <div>
                <div>{l.title}</div>
                {l.detail && <div className="muted small">{l.detail}</div>}
                <div className="faint small">
                  {l.actor} · {timeAgo(l.at)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default function Governance() {
  const { reviews, products } = usePortfolio();
  const { reviewId } = useParams();

  // Open reviews first, soonest board date first; decided reviews at the end.
  const closed = (r: Review) => (r.status === 'decided' ? 1 : 0);
  const sorted = [...reviews].sort((a, b) => closed(a) - closed(b) || a.forumDate.localeCompare(b.forumDate));
  const selected = reviews.find((r) => r.id === reviewId);

  if (!reviewId && sorted[0]) return <Navigate to={`/governance/${sorted[0].id}`} replace />;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Governance</h1>
          <p className="subtitle">What organisational decision do I need, and what evidence supports it?</p>
        </div>
      </div>

      <div className="gov">
        <section className="card flush" aria-label="Review queue">
          <div className="card-head">
            <h2>Review queue</h2>
            <span className="muted small">{reviews.filter((r) => r.status !== 'decided').length} open</span>
          </div>
          {sorted.map((r) => {
            const product = products.find((p) => p.id === r.productId);
            const miss = missingEvidence(r).length;
            return (
              <Link key={r.id} to={`/governance/${r.id}`} className={`qitem${r.id === reviewId ? ' sel' : ''}`}>
                <span className="row">
                  <span className="item-title grow">{product?.name}</span>
                  <Badge tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status]}</Badge>
                </span>
                <span>{r.decision}</span>
                <span className="muted small">
                  {r.status === 'decided' && r.outcome ? r.outcome.result : miss > 0 ? <span className="amber-text">{miss} evidence missing</span> : 'Evidence complete'} · {fmtDate(r.forumDate)}
                </span>
              </Link>
            );
          })}
          {reviews.length === 0 && <div className="empty">No decisions needed.</div>}
        </section>

        <div>
          {selected ? (
            <Detail key={selected.id} review={selected} product={products.find((p) => p.id === selected.productId)!} />
          ) : (
            <div className="card empty">
              <strong>Review not found</strong>
              <p>
                <Link to="/governance" className="arrow-link">
                  Back to the queue <ChevronRight size={14} />
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
