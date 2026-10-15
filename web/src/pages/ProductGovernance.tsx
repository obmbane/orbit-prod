import { Link, useOutletContext } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Badge } from '../components/Badges';
import { fmtDate } from '../lib/dates';
import { missingEvidence } from '../lib/derive';
import { usePortfolio } from '../portfolio-context';
import { ProductContext } from './ProductLayout';

export default function ProductGovernance() {
  const { product } = useOutletContext<ProductContext>();
  const reviews = usePortfolio().reviews.filter((r) => r.productId === product.id);
  return (
    <section className="card flush" aria-labelledby="reviews">
      <div className="card-head">
        <h2 id="reviews">Governance reviews</h2>
      </div>
      {reviews.length === 0 && <div className="empty">No organisational decisions are needed for {product.name} right now.</div>}
      {reviews.map((r) => {
        const miss = missingEvidence(r).length;
        return (
          <Link key={r.id} to={`/governance/${r.id}`} className="item wide">
            <span>
              <span className="item-title">{r.decision}</span>
              <span className="muted small block">
                {r.forum} · {fmtDate(r.forumDate)}
                {r.status !== 'decided' && miss > 0 ? ` · ${miss} evidence missing` : ''}
              </span>
            </span>
            <Badge tone={r.status === 'decided' ? 'green' : r.status === 'submitted' ? 'blue' : 'violet'}>
              {r.status === 'decided' ? (r.outcome?.result ?? 'Decided') : r.status === 'submitted' ? 'Submitted' : 'Draft'}
            </Badge>
            <span />
            <ChevronRight size={16} className="chev" aria-hidden />
          </Link>
        );
      })}
    </section>
  );
}
