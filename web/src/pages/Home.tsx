import ProductList from '../components/ProductList';
import { usePortfolio } from '../portfolio-context';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

const today = () => new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' });

export default function Home() {
  const { owner, products } = usePortfolio();
  const firstName = owner.split(' ')[0];

  return (
    <>
      <div className="page-header">
        <div>
          <div className="eyebrow">{today()}</div>
          <h1>
            {greeting()}, {firstName}
          </h1>
          <p className="subtitle">These are the products you are responsible for.</p>
        </div>
      </div>

      <section className="card flush" aria-labelledby="my-products">
        <div className="card-head">
          <h2 id="my-products">My Products</h2>
          <span className="muted small">{products.length} products</span>
        </div>
        <ProductList products={products} />
      </section>
    </>
  );
}
