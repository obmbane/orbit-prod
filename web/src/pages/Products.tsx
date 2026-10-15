import NewProductButton from '../components/NewProductButton';
import ProductList from '../components/ProductList';
import { usePortfolio } from '../portfolio-context';

export default function Products() {
  const { products } = usePortfolio();
  const preLaunch = products.filter((p) => p.phase === 'development');
  const live = products.filter((p) => p.phase === 'live');

  return (
    <>
      <div className="page-header">
        <div>
          <h1>My Products</h1>
          <p className="subtitle">What products am I responsible for, and what stage is each in?</p>
        </div>
        <NewProductButton />
      </div>

      <div className="stack">
        <section className="card flush" aria-labelledby="pre-launch">
          <div className="card-head">
            <h2 id="pre-launch">Pre-launch</h2>
            <span className="muted small">{preLaunch.length} products being developed</span>
          </div>
          <ProductList products={preLaunch} />
        </section>

        <section className="card flush" aria-labelledby="live">
          <div className="card-head">
            <h2 id="live">Live</h2>
            <span className="muted small">{live.length} products in market</span>
          </div>
          <ProductList products={live} />
        </section>
      </div>
    </>
  );
}
