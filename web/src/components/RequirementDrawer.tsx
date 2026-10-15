import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import { daysUntil, dueLabel, fmtDate } from '../lib/dates';
import { addDaysIso } from '../lib/dates';
import { usePortfolio, usePortfolioActions } from '../portfolio-context';
import { DevStage, Priority, Product, RequirementStatus } from '../types';
import { Badge, PriorityTag } from './Badges';
import Drawer from './Drawer';

const STATUSES: { value: RequirementStatus; label: string }[] = [
  { value: 'not-started', label: 'Not started' },
  { value: 'in-progress', label: 'In progress' },
  { value: 'blocked', label: 'Blocked' },
  { value: 'complete', label: 'Complete' },
];

interface Props {
  product: Product;
  stage: DevStage;
  requirementId: string | null;
  editable: boolean;
  onClose: () => void;
}

/** Everything about one stage-gate requirement: its status, evidence, blocker and actions. */
export default function RequirementDrawer({ product, stage, requirementId, editable, onClose }: Props) {
  const portfolio = usePortfolio();
  const { setRequirementStatus, addEvidence, createAction } = usePortfolioActions();
  const requirement = product.requirements[stage].find((r) => r.id === requirementId);

  const [blockerNote, setBlockerNote] = useState('');
  const [choosingBlocked, setChoosingBlocked] = useState(false);
  const [evidenceTitle, setEvidenceTitle] = useState('');
  const [actionTitle, setActionTitle] = useState('');
  const [actionDue, setActionDue] = useState(addDaysIso(7));
  const [actionPriority, setActionPriority] = useState<Priority>('Medium');

  if (!requirement) return <Drawer open={false} onClose={onClose} title="" children={null} />;

  const review = requirement.reviewId ? portfolio.reviews.find((r) => r.id === requirement.reviewId) : undefined;
  const approved = review?.outcome && review.outcome.result !== 'Rejected' && review.outcome.result !== 'Deferred';
  const link = `/products/${product.id}/development?focus=${requirement.id}`;
  const linkedActions = portfolio.actions.filter((a) => a.productId === product.id && a.link === link);

  const choose = (status: RequirementStatus) => {
    if (status === 'blocked') {
      setBlockerNote(requirement.blockerNote ?? '');
      setChoosingBlocked(true);
      return;
    }
    setChoosingBlocked(false);
    setRequirementStatus(product.id, stage, requirement.id, status);
  };

  const confirmBlocked = () => {
    setRequirementStatus(product.id, stage, requirement.id, 'blocked', blockerNote.trim() || 'No reason given');
    setChoosingBlocked(false);
  };

  const submitEvidence = (e: FormEvent) => {
    e.preventDefault();
    if (!evidenceTitle.trim()) return;
    addEvidence(product.id, stage, requirement.id, evidenceTitle.trim());
    setEvidenceTitle('');
  };

  const submitAction = (e: FormEvent) => {
    e.preventDefault();
    createAction({
      productId: product.id,
      title: actionTitle.trim() || `Complete: ${requirement.title}`,
      priority: actionPriority,
      due: actionDue,
      source: `${stage} requirement`,
      link,
    });
    setActionTitle('');
  };

  return (
    <Drawer open={requirementId !== null} onClose={onClose} title={requirement.title} subtitle={`${stage} requirement`}>
      <p className="muted">{requirement.description}</p>

      {review && (
        <div className="callout violet">
          <span>
            This requirement is met by an organisational decision: <strong>{review.decision}</strong> ({review.forum}).{' '}
            <Link to={`/governance/${review.id}`} className="arrow-link">
              Open the review
            </Link>
          </span>
        </div>
      )}

      <section>
        <h3 className="label">Status</h3>
        <div className="segmented" role="group" aria-label="Status">
          {STATUSES.map((s) => {
            const locked = !editable || (s.value === 'complete' && !!review && !approved);
            return (
              <button
                key={s.value}
                className={`seg ${requirement.status === s.value ? `on ${s.value}` : ''}`}
                disabled={locked}
                onClick={() => choose(s.value)}
                aria-pressed={requirement.status === s.value}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        {!editable && <p className="muted small gap">Status can only be changed for the product's current stage.</p>}
        {requirement.status === 'blocked' && requirement.blockerNote && !choosingBlocked && (
          <div className="callout amber gap">
            <span>
              <strong>Blocker:</strong> {requirement.blockerNote}
            </span>
          </div>
        )}
        {choosingBlocked && (
          <div className="gap form">
            <label className="field">
              What is blocking this?
              <textarea value={blockerNote} onChange={(e) => setBlockerNote(e.target.value)} rows={3} autoFocus />
            </label>
            <div className="foot">
              <button className="btn" onClick={() => setChoosingBlocked(false)}>
                Cancel
              </button>
              <button className="btn primary" onClick={confirmBlocked}>
                Mark as blocked
              </button>
            </div>
          </div>
        )}
      </section>

      <section>
        <h3 className="label">Evidence</h3>
        {requirement.evidence.length === 0 && <p className="muted small">No evidence attached yet.</p>}
        <ul className="clean">
          {requirement.evidence.map((e) => (
            <li key={e.id}>
              <span>{e.title}</span>
              <span className="muted small">
                {e.addedBy}, {fmtDate(e.addedAt)}
              </span>
            </li>
          ))}
        </ul>
        {editable && (
          <form onSubmit={submitEvidence} className="inline-form">
            <input value={evidenceTitle} onChange={(e) => setEvidenceTitle(e.target.value)} placeholder="Name of document or link" aria-label="Evidence name" />
            <button className="btn" type="submit" disabled={!evidenceTitle.trim()}>
              Add evidence
            </button>
          </form>
        )}
      </section>

      <section>
        <h3 className="label">Actions</h3>
        {linkedActions.map((a) => (
          <div key={a.id} className="row-line">
            <span className={a.status === 'done' ? 'muted strike' : ''}>{a.title}</span>
            <span className="row-gap">
              {a.status === 'open' && <Badge tone={daysUntil(a.due) < 0 ? 'red' : 'grey'}>{dueLabel(a.due)}</Badge>}
              <PriorityTag priority={a.priority} />
            </span>
          </div>
        ))}
        {linkedActions.length === 0 && <p className="muted small">No actions assigned.</p>}
        {editable && (
          <form onSubmit={submitAction} className="form gap">
            <label className="field">
              Assign an action
              <input value={actionTitle} onChange={(e) => setActionTitle(e.target.value)} placeholder={`Complete: ${requirement.title}`} />
            </label>
            <div className="two-fields">
              <label className="field">
                Due
                <input type="date" value={actionDue} onChange={(e) => setActionDue(e.target.value)} />
              </label>
              <label className="field">
                Priority
                <select value={actionPriority} onChange={(e) => setActionPriority(e.target.value as Priority)}>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                </select>
              </label>
            </div>
            <div className="foot">
              <button className="btn" type="submit">
                Assign action
              </button>
            </div>
          </form>
        )}
      </section>
    </Drawer>
  );
}
