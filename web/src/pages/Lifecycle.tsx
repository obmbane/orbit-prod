import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Badge } from '../components/Badges';
import { MaturityPill } from '../components/StagePill';
import TrendIcon from '../components/TrendIcon';
import { assessMaturity } from '../lib/maturity';
import { recommend } from '../lib/recommend';
import { money, pct } from '../lib/format';
import { usePortfolio } from '../portfolio-context';
import { MATURITY_STAGES, Product } from '../types';

function decisionStatus(product: Product) {
  const d = product.lifecycleDecision;
  if (d && d.status !== 'investigating') return <Badge tone="green">{d.chosen ?? 'No action'} ({d.status})</Badge>;
  if (d) return <Badge tone="blue">Investigating</Badge>;
  if (product.maturity === 'Decline' || product.maturity === 'Retirement') return <Badge tone="red">Decision required</Badge>;
  return <Badge>Recommended: {recommend(product, product.maturity ?? 'Introduction').action}</Badge>;
}

export default function Lifecycle() {
  const { products } = usePortfolio();
  const live = products.filter((p) => p.phase === 'live');
  const preLaunch = products.filter((p) => p.phase === 'development');

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Lifecycle</h1>
          <p className="subtitle">Is each live product growing, mature or declining, and what should we do with it?</p>
        </div>
      </div>

      <div className="stack">
        <section className="card flush" aria-labelledby="live-products">
          <div className="card-head">
            <h2 id="live-products">Live products</h2>
            <span className="muted small">{live.length} in market</span>
          </div>
          <div className="lrow head" aria-hidden>
            <span>Product</span>
            <span>Maturity stage</span>
            <span>Direction</span>
            <span>Revenue</span>
            <span>Margin</span>
            <span>Lifecycle decision</span>
            <span />
          </div>
          {live.map((p) => {
            const m = p.metrics;
            const a = m ? assessMaturity(m) : undefined;
            const stage = p.maturity ?? 'Introduction';
            return (
              <Link key={p.id} to={`/products/${p.id}/lifecycle`} className="lrow">
                <span>
                  <span className="pname">{p.name}</span>
                  <span className="muted small block">{p.category}</span>
                </span>
                <span>
                  <span className="mini-rail" aria-hidden>
                    {MATURITY_STAGES.map((s, i) => (
                      <i key={s} className={`m-${s} ${s === stage ? 'on' : i < MATURITY_STAGES.indexOf(stage) ? 'past' : ''}`} />
                    ))}
                  </span>
                  <span className="mini-label">
                    <MaturityPill stage={stage} />
                    {a && p.maturityConfirmedAt && a.suggested !== stage && <span className="amber-text small"> signals say {a.suggested}</span>}
                    {!p.maturityConfirmedAt && <span className="muted small"> unconfirmed</span>}
                  </span>
                </span>
                <span className="direction">
                  {a ? (
                    <>
                      <TrendIcon trend={a.trajectory.direction} /> <span className="small">{a.trajectory.direction}</span>
                    </>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </span>
                <span>
                  {m ? (
                    <>
                      <span className="block">{money(m.revenue)}</span>
                      <span className={`small ${m.revenueGrowth < 0 ? 'neg' : 'pos'}`}>{pct(m.revenueGrowth)}</span>
                    </>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </span>
                <span>{m ? `${m.margin}%` : <span className="muted">—</span>}</span>
                <span>{decisionStatus(p)}</span>
                <ChevronRight size={16} className="chev" aria-hidden />
              </Link>
            );
          })}
        </section>

        <section className="card" aria-labelledby="pipeline">
          <h2 id="pipeline" className="card-title">
            Not yet launched
          </h2>
          <p className="muted small">These products are still in development. Maturity is assessed once they are live.</p>
          <div className="chips">
            {preLaunch.map((p) => (
              <Link key={p.id} to={`/products/${p.id}/development`} className="chip">
                {p.name} <span className="stage-pill dev">{p.devStage}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
