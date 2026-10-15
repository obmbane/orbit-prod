import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useOutletContext, useSearchParams } from 'react-router-dom';
import { AlertTriangle, Check, ChevronRight, Paperclip } from 'lucide-react';
import { Badge } from '../components/Badges';
import DevStepper from '../components/DevStepper';
import Modal from '../components/Modal';
import RequirementDrawer from '../components/RequirementDrawer';
import { gateOf } from '../lib/derive';
import { daysUntil, dueLabel } from '../lib/dates';
import { plural } from '../lib/format';
import { usePortfolioActions } from '../portfolio-context';
import { DEV_STAGES, DevStage, Requirement } from '../types';
import { ProductContext } from './ProductLayout';

function StatusIcon({ status }: { status: Requirement['status'] }) {
  return (
    <span className={`status-ic ${status}`} aria-label={status}>
      {status === 'complete' && <Check size={14} strokeWidth={3} />}
      {status === 'blocked' && <AlertTriangle size={13} />}
    </span>
  );
}

export default function ProductDevelopment() {
  const { product } = useOutletContext<ProductContext>();
  const { advanceStage } = usePortfolioActions();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();

  const gate = gateOf(product);
  const [stage, setStage] = useState<DevStage>(product.devStage);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  const live = product.phase === 'live';
  const editable = !live && stage === product.devStage;
  const requirements = product.requirements[stage];

  // Follow a deep link such as ?focus=<requirement id> from Home or My Actions.
  const focus = params.get('focus');
  useEffect(() => {
    if (!focus) return;
    const owner = DEV_STAGES.find((s) => product.requirements[s].some((r) => r.id === focus));
    if (owner) {
      setStage(owner);
      setOpenId(focus);
    }
  }, [focus, product]);

  // After advancing, show the new current stage (but not on first render, which may be a deep link).
  const firstRender = useRef(true);
  useEffect(() => {
    if (firstRender.current) firstRender.current = false;
    else setStage(product.devStage);
  }, [product.devStage]);

  const closeDrawer = () => {
    setOpenId(null);
    if (focus) setParams({}, { replace: true });
  };

  const advance = () => {
    const launching = gate.next === null;
    advanceStage(product.id);
    setConfirming(false);
    if (launching) navigate(`/products/${product.id}/lifecycle`);
  };

  const stageIndex = DEV_STAGES.indexOf(stage);
  const evidenceCount = gate.requirements.reduce((n, r) => n + r.evidence.length, 0);

  return (
    <div className="stack">
      <DevStepper product={product} selected={stage} onSelect={setStage} />

      <div className="two-col">
        <section className="card flush" aria-labelledby="reqs">
          <div className="card-head">
            <h2 id="reqs">{stage} requirements</h2>
            <span className="muted small">
              {live || stageIndex < DEV_STAGES.indexOf(product.devStage)
                ? 'Completed stage'
                : stage === product.devStage
                  ? 'Current stage'
                  : 'Starts when the product reaches this stage'}
            </span>
          </div>
          {requirements.map((r) => (
            <button key={r.id} className={`req${openId === r.id ? ' focus' : ''}`} onClick={() => setOpenId(r.id)}>
              <StatusIcon status={r.status} />
              <span>
                <span className="item-title">{r.title}</span>
                {r.status === 'blocked' && r.blockerNote && <span className="amber-text small block">{r.blockerNote}</span>}
                {r.status !== 'blocked' && <span className="muted small block">{r.description}</span>}
              </span>
              <span className="req-meta">
                {r.due && r.status !== 'complete' && <Badge tone={daysUntil(r.due) < 0 ? 'red' : 'grey'}>{dueLabel(r.due)}</Badge>}
                <span className="muted small" title="Evidence attached">
                  <Paperclip size={12} /> {r.evidence.length}
                </span>
              </span>
              <ChevronRight size={16} className="chev" aria-hidden />
            </button>
          ))}
        </section>

        <aside className="stack">
          {live ? (
            <section className="card">
              <h2 className="card-title">Launched</h2>
              <p className="muted">All development gates were passed. This product is live.</p>
              <Link to="../lifecycle" className="arrow-link">
                See lifecycle & maturity <ChevronRight size={14} />
              </Link>
            </section>
          ) : (
            <section className={`card ${gate.ready ? 'accent' : ''}`} aria-labelledby="gate">
              <h2 id="gate" className="card-title">
                Gate: {gate.stage} → {gate.nextLabel}
              </h2>
              <p>
                <strong>{gate.complete}</strong> of {gate.total} requirements complete
              </p>
              <div className="progress" aria-hidden>
                <i style={{ width: `${(gate.complete / gate.total) * 100}%` }} />
              </div>

              {gate.blockers.length > 0 && (
                <div className="callout amber gap">
                  <AlertTriangle size={16} />
                  <span>
                    <strong>
                      {plural(gate.blockers.length, 'blocker')} before {gate.nextLabel}
                    </strong>
                    <ul className="clean small">
                      {gate.blockers.map((b) => (
                        <li key={b.id}>
                          <button className="link-btn" onClick={() => { setStage(product.devStage); setOpenId(b.id); }}>
                            {b.title}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </span>
                </div>
              )}
              {gate.ready && (
                <div className="callout green gap">
                  <Check size={16} />
                  <span>Every requirement is complete. You can advance this product.</span>
                </div>
              )}
              {!gate.ready && gate.blockers.length === 0 && (
                <p className="muted small gap">{plural(gate.total - gate.complete, 'requirement')} left to complete.</p>
              )}

              <button className="btn primary full" disabled={!gate.ready} onClick={() => setConfirming(true)}>
                {gate.next ? `Advance to ${gate.next}` : 'Launch product'}
              </button>
              {!gate.ready && <p className="muted small gap">Complete every requirement to advance.</p>}
            </section>
          )}
        </aside>
      </div>

      <RequirementDrawer product={product} stage={stage} requirementId={openId} editable={editable} onClose={closeDrawer} />

      <Modal open={confirming} onClose={() => setConfirming(false)} title={gate.next ? `Advance to ${gate.next}?` : 'Launch this product?'}>
        <p>
          All {gate.total} {gate.stage} requirements are complete, with {plural(evidenceCount, 'piece')} of evidence attached.
        </p>
        <p className="muted small">
          {gate.next
            ? `This records the ${gate.stage} gate decision in the product's history.`
            : 'The product becomes live in Introduction, and this decision is recorded in its history.'}
        </p>
        <div className="foot">
          <button className="btn" onClick={() => setConfirming(false)}>
            Cancel
          </button>
          <button className="btn primary" onClick={advance}>
            {gate.next ? `Advance to ${gate.next}` : 'Launch product'}
          </button>
        </div>
      </Modal>
    </div>
  );
}
