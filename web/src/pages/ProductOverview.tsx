import { Link, useOutletContext } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Badge, PriorityTag } from '../components/Badges';
import { attentionFor, gateOf, openActions } from '../lib/derive';
import { dueLabel, daysUntil, timeAgo } from '../lib/dates';
import { money, num, pct, plural } from '../lib/format';
import { usePortfolio } from '../portfolio-context';
import { ProductContext } from './ProductLayout';

export default function ProductOverview() {
  const { product } = useOutletContext<ProductContext>();
  const portfolio = usePortfolio();
  const next = attentionFor(portfolio, product)[0];
  const actions = openActions(portfolio, product.id);
  const reviews = portfolio.reviews.filter((r) => r.productId === product.id);
  const m = product.metrics;
  const gate = gateOf(product);

  return (
    <div className="two-col">
      <div className="stack">
        <section className="card" aria-labelledby="where">
          <h2 id="where" className="card-title">
            Where this product is
          </h2>
          {product.phase === 'development' ? (
            <>
              <p>
                <strong>{gate.stage}</strong> · {gate.complete} of {gate.total} requirements complete
              </p>
              <div className="progress" aria-hidden>
                <i style={{ width: `${(gate.complete / gate.total) * 100}%` }} />
              </div>
              <p className="muted small gap">
                {gate.ready
                  ? `Every requirement is complete. This product is ready to advance to ${gate.nextLabel}.`
                  : gate.blockers.length
                    ? `${plural(gate.blockers.length, 'blocker')} before ${gate.nextLabel}.`
                    : `${plural(gate.total - gate.complete, 'requirement')} to complete before ${gate.nextLabel}.`}
              </p>
              <Link to="development" className="arrow-link">
                Open stage requirements <ChevronRight size={14} />
              </Link>
            </>
          ) : m ? (
            <>
              <div className="kpis">
                <div className="kpi">
                  <span className="muted small">Revenue</span>
                  <span className="kpi-v">{money(m.revenue)}</span>
                  <span className={`small ${m.revenueGrowth < 0 ? 'neg' : 'pos'}`}>{pct(m.revenueGrowth)} YoY</span>
                </div>
                <div className="kpi">
                  <span className="muted small">Customers</span>
                  <span className="kpi-v">{num(m.customers)}</span>
                  <span className={`small ${m.customerGrowth < 0 ? 'neg' : 'pos'}`}>{pct(m.customerGrowth)} YoY</span>
                </div>
                <div className="kpi">
                  <span className="muted small">Gross margin</span>
                  <span className="kpi-v">{m.margin}%</span>
                  <span className="small muted">{m.margin >= m.previous.margin ? 'steady or up' : 'down'} on last quarter</span>
                </div>
                <div className="kpi">
                  <span className="muted small">Customer health</span>
                  <span className="kpi-v">{m.customerHealth}</span>
                  <span className="small muted">out of 100</span>
                </div>
              </div>
              <p className="muted small gap">
                {product.lifecycleDecision
                  ? `Lifecycle decision: ${product.lifecycleDecision.chosen ?? 'none'} (${product.lifecycleDecision.status}).`
                  : 'No lifecycle decision recorded yet.'}
              </p>
              <Link to="lifecycle" className="arrow-link">
                View lifecycle & maturity <ChevronRight size={14} />
              </Link>
            </>
          ) : (
            <p className="muted">Commercial data will appear after the first billing cycle.</p>
          )}
        </section>

        <section className="card flush" aria-labelledby="open-actions">
          <div className="card-head">
            <h2 id="open-actions">Open actions</h2>
            <span className="muted small">{actions.length} open</span>
          </div>
          {actions.length === 0 && <div className="empty">No open actions.</div>}
          {actions.map((action) => (
            <Link key={action.id} to={action.link} className="item wide">
              <span>
                <span className="item-title">{action.title}</span>
                <span className="muted small block">{action.source}</span>
              </span>
              <Badge tone={daysUntil(action.due) < 0 ? 'red' : 'grey'}>{dueLabel(action.due)}</Badge>
              <PriorityTag priority={action.priority} />
              <ChevronRight size={16} className="chev" aria-hidden />
            </Link>
          ))}
        </section>
      </div>

      <div className="stack">
        <section className="card accent" aria-labelledby="next">
          <h2 id="next" className="card-title">
            Next best action
          </h2>
          {next ? (
            <>
              <Badge tone={next.tone}>{next.tag}</Badge>
              <p className="next-title">{next.title}</p>
              <Link to={next.to} className="btn primary">
                Take me there
              </Link>
            </>
          ) : (
            <p className="muted">Nothing outstanding. This product is on track.</p>
          )}
        </section>

        <section className="card flush" aria-labelledby="reviews">
          <div className="card-head">
            <h2 id="reviews">Governance reviews</h2>
          </div>
          {reviews.length === 0 && <div className="empty">No decisions needed.</div>}
          {reviews.map((review) => (
            <Link key={review.id} to={`/governance/${review.id}`} className="item wide small-item">
              <span>
                <span className="item-title">{review.decision}</span>
                <span className="muted small block">{review.forum}</span>
              </span>
              <Badge tone={review.status === 'decided' ? 'green' : review.status === 'submitted' ? 'blue' : 'violet'}>
                {review.status === 'draft' ? 'Draft' : review.status === 'submitted' ? 'Submitted' : 'Decided'}
              </Badge>
              <ChevronRight size={16} className="chev" aria-hidden />
            </Link>
          ))}
        </section>

        <section className="card" aria-labelledby="recent">
          <h2 id="recent" className="card-title">
            Recent activity
          </h2>
          <div className="timeline">
            {product.activity.slice(0, 4).map((entry) => (
              <div key={entry.id} className="tl">
                <i />
                <div>
                  <div>{entry.title}</div>
                  <div className="muted small">
                    {entry.actor} · {timeAgo(entry.at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link to="activity" className="arrow-link">
            Full history <ChevronRight size={14} />
          </Link>
        </section>
      </div>
    </div>
  );
}
