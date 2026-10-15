import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { Badge } from '../components/Badges';
import NewProductButton from '../components/NewProductButton';
import ProductList from '../components/ProductList';
import { allAttention, attentionFor } from '../lib/derive';
import { plural } from '../lib/format';
import { usePortfolio } from '../portfolio-context';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const today = () => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export default function Home() {
  const portfolio = usePortfolio();
  const { owner, products } = portfolio;
  const firstName = owner.split(' ')[0];

  const attention = allAttention(portfolio);
  const topItems = attention.slice(0, 6);
  const productsNeedingAttention = new Set(attention.map((a) => a.productId)).size;
  const byUrgency = [...products].sort(
    (a, b) => (attentionFor(portfolio, b)[0]?.score ?? 0) - (attentionFor(portfolio, a)[0]?.score ?? 0),
  );

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">{today()}</div>
          <h1>
            {greeting()}, {firstName}
          </h1>
          <p className="subtitle">
            {attention.length
              ? `${plural(attention.length, 'thing')} need${attention.length === 1 ? 's' : ''} your attention across ${plural(productsNeedingAttention, 'product')}.`
              : 'Nothing needs your attention right now.'}
          </p>
        </div>
        <NewProductButton />
      </div>

      <div className="stack">
        <section className="card flush" aria-labelledby="attention">
          <div className="card-head">
            <h2 id="attention">What needs my attention today?</h2>
            <span className="muted small">Most urgent first</span>
          </div>
          <div className="items">
            {topItems.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              return (
                <Link key={item.id} to={item.to} className="item">
                  <Badge tone={item.tone}>{item.tag}</Badge>
                  <span>
                    <span className="item-title">{item.title}</span>
                    <span className="muted small block">{product?.name}</span>
                  </span>
                  <ChevronRight size={16} className="chev" aria-hidden />
                </Link>
              );
            })}
            {topItems.length === 0 && <div className="empty">You're all caught up.</div>}
          </div>
        </section>

        <section className="card flush" aria-labelledby="my-products">
          <div className="card-head">
            <h2 id="my-products">My Products</h2>
            <span className="muted small">{products.length} products, most urgent first</span>
          </div>
          <ProductList products={byUrgency} />
        </section>
      </div>
    </>
  );
}
