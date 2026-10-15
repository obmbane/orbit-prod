import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { attentionFor, healthOf, priorityOf } from '../lib/derive';
import { usePortfolio } from '../portfolio-context';
import { Product } from '../types';
import { Badge, HealthBadge, PriorityTag } from './Badges';
import StagePill from './StagePill';

/** Rows of products, shared by Home and My Products so they cannot drift apart. */
export default function ProductList({ products }: { products: Product[] }) {
  const portfolio = usePortfolio();
  return (
    <div className="plist">
      <div className="prow head" aria-hidden>
        <span>Product</span>
        <span>Stage</span>
        <span>Health</span>
        <span>Outstanding action</span>
        <span>Priority</span>
        <span />
      </div>
      {products.map((product) => {
        const items = attentionFor(portfolio, product);
        const top = items[0];
        return (
          <Link key={product.id} to={`/products/${product.id}`} className="prow">
            <span>
              <span className="pname">{product.name}</span>
              <span className="muted small block">{product.category}</span>
            </span>
            <span>
              <StagePill product={product} />
            </span>
            <span>
              <HealthBadge health={healthOf(product, portfolio)} />
            </span>
            <span className="attn">
              {top ? (
                <>
                  <Badge tone={top.tone}>{top.tag}</Badge>
                  <span className="t">{top.title}</span>
                </>
              ) : (
                <span className="muted">Nothing outstanding</span>
              )}
            </span>
            <span>
              <PriorityTag priority={priorityOf(items)} />
            </span>
            <ChevronRight size={16} className="chev" aria-hidden />
          </Link>
        );
      })}
    </div>
  );
}
