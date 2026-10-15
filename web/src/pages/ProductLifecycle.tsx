import { FormEvent, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { AlertTriangle, Check, ChevronRight } from 'lucide-react';
import { Badge, Tone } from '../components/Badges';
import Modal from '../components/Modal';
import Sparkline from '../components/Sparkline';
import { MaturityPill } from '../components/StagePill';
import TrendIcon from '../components/TrendIcon';
import { fmtDate } from '../lib/dates';
import { money, num, pct } from '../lib/format';
import { assessMaturity } from '../lib/maturity';
import { usePortfolioActions } from '../portfolio-context';
import { MATURITY_STAGES, MaturityStage } from '../types';
import { ProductContext } from './ProductLayout';

/** Colour a sparkline by whether its direction is good or bad for the business. */
function toneFor(values: number[], higherIsBetter = true): Tone {
  const change = (values[values.length - 1] - values[0]) / (Math.abs(values[0]) || 1);
  if (Math.abs(change) < 0.03) return 'grey';
  return change > 0 === higherIsBetter ? 'green' : 'red';
}

const points = (now: number, before: number) => {
  const d = now - before;
  return d === 0 ? 'no change' : `${d > 0 ? '+' : '−'}${Math.abs(d)} pts`;
};

export default function ProductLifecycle() {
  const { product } = useOutletContext<ProductContext>();
  const { confirmMaturity } = usePortfolioActions();
  const [showAll, setShowAll] = useState(false);
  const [changing, setChanging] = useState(false);
  const [stage, setStage] = useState<MaturityStage>('Maturity');
  const [reason, setReason] = useState('');

  if (product.phase !== 'live')
    return (
      <div className="card empty">
        <strong>Not launched yet</strong>
        <p>
          Maturity is assessed once a product is live.{' '}
          <Link to="../development" className="arrow-link">
            See its development stage
          </Link>
        </p>
      </div>
    );

  const m = product.metrics;
  if (!m)
    return (
      <div className="card empty">
        <strong>Waiting for the first commercial data</strong>
        <p>{product.name} has just launched, so it is in Introduction. Revenue, customer and usage signals appear after the first billing cycle.</p>
      </div>
    );

  const a = assessMaturity(m);
  const confirmed = product.maturity;
  const agrees = confirmed === a.suggested;
  const rankedSignals = [...a.signals].sort((x, y) => y.weight - x.weight);
  const visibleSignals = showAll ? rankedSignals : rankedSignals.slice(0, 5);
  const total = Object.values(a.scores).reduce((x, y) => x + y, 0) || 1;
  const traj = a.trajectory;

  const openChange = () => {
    setStage(a.suggested);
    setReason('');
    setChanging(true);
  };
  const submitChange = (e: FormEvent) => {
    e.preventDefault();
    confirmMaturity(product.id, stage, reason.trim() || undefined);
    setChanging(false);
  };

  const kpis = [
    { label: 'Revenue', value: money(m.revenue), sub: `${pct(m.revenueGrowth)} YoY`, series: m.trend.revenue, tone: toneFor(m.trend.revenue) },
    { label: 'Customers', value: num(m.customers), sub: `${pct(m.customerGrowth)} YoY`, series: m.trend.customers, tone: toneFor(m.trend.customers) },
    { label: 'Gross margin', value: `${m.margin}%`, sub: `${points(m.margin, m.previous.margin)} vs last quarter`, series: m.trend.margin, tone: toneFor(m.trend.margin) },
    { label: 'Support cost', value: pct(m.supportCostChange), sub: `${m.incidentsPerMonth} incidents a month`, series: m.trend.supportCost, tone: toneFor(m.trend.supportCost, false) },
  ];

  return (
    <div className="stack">
      <section className="card accent" aria-labelledby="assessment">
        <div className="eyebrow">Orbit's assessment</div>
        <h2 id="assessment" className="assess-title">
          This product appears to be in <MaturityPill stage={a.suggested} />
        </h2>
        <p className="muted">
          <Badge tone={a.confidence === 'High' ? 'green' : a.confidence === 'Medium' ? 'amber' : 'grey'}>{a.confidence} confidence</Badge> {a.summary}
        </p>

        <div className="bar-stack gap" aria-hidden>
          {MATURITY_STAGES.filter((s) => a.scores[s] > 0).map((s) => (
            <i key={s} className={`m-${s}`} style={{ width: `${(a.scores[s] / total) * 100}%` }} title={`${s}: ${a.scores[s]}`} />
          ))}
        </div>
        <div className="bar-legend small muted">
          {MATURITY_STAGES.filter((s) => a.scores[s] > 0).map((s) => (
            <span key={s} className={`m-${s}`}>
              <i /> {s}
            </span>
          ))}
        </div>

        <hr className="divider" />

        {!product.maturityConfirmedAt ? (
          <div className="row">
            <div className="grow">
              <strong>Awaiting your confirmation.</strong>
              <div className="muted small">You are accountable for the final classification.</div>
            </div>
            <button className="btn" onClick={openChange}>
              Change classification
            </button>
            <button className="btn primary" onClick={() => confirmMaturity(product.id, a.suggested)}>
              Confirm {a.suggested}
            </button>
          </div>
        ) : agrees ? (
          <div className="row">
            <Check size={18} className="pos" />
            <div className="grow">
              <strong>You confirmed {confirmed} on {fmtDate(product.maturityConfirmedAt)}.</strong>
              <div className="muted small">The signals still agree.</div>
            </div>
            <button className="btn" onClick={openChange}>
              Change classification
            </button>
          </div>
        ) : (
          <div className="callout amber">
            <AlertTriangle size={16} />
            <div className="grow">
              <strong>
                The signals now point to {a.suggested}, but you classified this as {confirmed} on {fmtDate(product.maturityConfirmedAt)}.
              </strong>
              <div className="row gap">
                <button className="btn primary" onClick={() => confirmMaturity(product.id, a.suggested, 'Reclassified after reviewing the signals')}>
                  Reclassify as {a.suggested}
                </button>
                <button className="btn" onClick={() => confirmMaturity(product.id, confirmed!, 'Kept the existing classification after review')}>
                  Keep {confirmed}
                </button>
                <button className="btn" onClick={openChange}>
                  Choose another
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className={`callout ${traj.direction === 'deteriorating' ? 'red' : traj.direction === 'improving' ? 'green' : 'blue'}`}>
        <TrendIcon trend={traj.direction} size={16} />
        <span>
          <strong>
            {traj.direction === 'deteriorating' ? 'Deteriorating' : traj.direction === 'improving' ? 'Improving' : 'Stable'}.
          </strong>{' '}
          {traj.improving} of {traj.total} tracked indicators improved and {traj.deteriorating} got worse compared with last quarter.
        </span>
      </div>

      <div className="grid-4">
        {kpis.map((k) => (
          <div key={k.label} className="kpi tall">
            <span className="muted small">{k.label}</span>
            <span className="kpi-v">{k.value}</span>
            <span className="muted small">{k.sub}</span>
            <Sparkline values={k.series} tone={k.tone} width={150} height={34} />
          </div>
        ))}
      </div>

      <section className="card flush" aria-labelledby="signals">
        <div className="card-head">
          <h2 id="signals">Why this stage? The evidence</h2>
          <span className="muted small">Each signal says where it points and why</span>
        </div>
        {visibleSignals.map((s) => (
          <div key={s.key} className="signal">
            <span>
              <span className="item-title">{s.label}</span>
              <span className="block muted small">{s.value}</span>
            </span>
            <span className="muted small">{s.explain}</span>
            <span>{s.pointsTo ? <MaturityPill stage={s.pointsTo} /> : <Badge>Neutral</Badge>}</span>
            <TrendIcon trend={s.trend} />
          </div>
        ))}
        <div className="more">
          <button className="link-btn" onClick={() => setShowAll(!showAll)}>
            {showAll ? 'Show fewer signals' : `Show all ${rankedSignals.length} signals`}
          </button>
        </div>
      </section>

      <section className="card row" aria-label="Next step">
        <div className="grow">
          <strong>Next: decide what to do with {product.name}.</strong>
          <div className="muted small">Orbit recommends a lifecycle action based on this evidence. You decide.</div>
        </div>
        <Link to="../decision" className="btn primary">
          Review the recommendation <ChevronRight size={14} />
        </Link>
      </section>

      <Modal open={changing} onClose={() => setChanging(false)} title="Change classification">
        <form onSubmit={submitChange} className="form">
          <label className="field">
            Maturity stage
            <select value={stage} onChange={(e) => setStage(e.target.value as MaturityStage)}>
              {MATURITY_STAGES.map((s) => (
                <option key={s} value={s}>
                  {s}
                  {s === a.suggested ? ' (suggested)' : ''}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            Your reasoning {stage !== a.suggested && '(required, because it differs from the suggestion)'}
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} />
          </label>
          {confirmed !== stage && product.lifecycleDecision && (
            <p className="muted small">Changing the stage reopens the lifecycle decision you recorded earlier.</p>
          )}
          <div className="foot">
            <button type="button" className="btn" onClick={() => setChanging(false)}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={stage !== a.suggested && reason.trim().length === 0}>
              Save classification
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
