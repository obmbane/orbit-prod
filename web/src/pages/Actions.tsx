import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ChevronRight } from 'lucide-react';
import { Badge, PriorityTag } from '../components/Badges';
import NewActionButton from '../components/NewActionButton';
import { daysUntil, dueLabel } from '../lib/dates';
import { usePortfolio, usePortfolioActions } from '../portfolio-context';

type Filter = 'open' | 'overdue' | 'week' | 'done' | 'all';

export default function Actions() {
  const { actions, products } = usePortfolio();
  const { setActionStatus } = usePortfolioActions();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<Filter>('open');

  const isOpen = (a: (typeof actions)[number]) => a.status === 'open';
  const matches: Record<Filter, (a: (typeof actions)[number]) => boolean> = {
    open: isOpen,
    overdue: (a) => isOpen(a) && daysUntil(a.due) < 0,
    week: (a) => isOpen(a) && daysUntil(a.due) >= 0 && daysUntil(a.due) <= 7,
    done: (a) => a.status === 'done',
    all: () => true,
  };
  const labels: Record<Filter, string> = { open: 'Open', overdue: 'Overdue', week: 'Due this week', done: 'Done', all: 'All' };
  const sorted = [...actions].sort((a, b) => a.due.localeCompare(b.due));
  const visible = sorted.filter(matches[filter]);

  return (
    <>
      <div className="page-header">
        <div>
          <h1>My Actions</h1>
          <p className="subtitle">What am I personally responsible for doing?</p>
        </div>
        <NewActionButton />
      </div>

      <section className="card flush">
        <div className="card-head">
          <div className="filters" role="group" aria-label="Filter actions">
            {(Object.keys(labels) as Filter[]).map((f) => (
              <button key={f} className={`filter${filter === f ? ' on' : ''}`} onClick={() => setFilter(f)} aria-pressed={filter === f}>
                {labels[f]} <span className="muted">{actions.filter(matches[f]).length}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="alist">
          <div className="arow head" aria-hidden>
            <span />
            <span>Action</span>
            <span>Product</span>
            <span>Priority</span>
            <span>Due</span>
            <span />
          </div>
          {visible.map((a) => {
            const product = products.find((p) => p.id === a.productId);
            const done = a.status === 'done';
            return (
              <div key={a.id} className="arow" onClick={() => navigate(a.link)}>
                <button
                  className={`check${done ? ' on' : ''}`}
                  aria-label={done ? `Reopen: ${a.title}` : `Mark done: ${a.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setActionStatus(a.id, done ? 'open' : 'done');
                  }}
                >
                  {done && <Check size={13} strokeWidth={3} />}
                </button>
                <span>
                  <Link to={a.link} className={`item-title${done ? ' muted strike' : ''}`} onClick={(e) => e.stopPropagation()}>
                    {a.title}
                  </Link>
                  <span className="muted small block">{a.source}</span>
                </span>
                <span>{product?.name}</span>
                <span>
                  <PriorityTag priority={a.priority} />
                </span>
                <span>{done ? <Badge tone="green">Done</Badge> : <Badge tone={daysUntil(a.due) < 0 ? 'red' : daysUntil(a.due) <= 2 ? 'amber' : 'grey'}>{dueLabel(a.due)}</Badge>}</span>
                <ChevronRight size={16} className="chev" aria-hidden />
              </div>
            );
          })}
          {visible.length === 0 && <div className="empty">Nothing here.</div>}
        </div>
      </section>
    </>
  );
}
