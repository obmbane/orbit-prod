import { Link, NavLink, Outlet, useParams } from 'react-router-dom';
import { HealthBadge } from '../components/Badges';
import LifecycleRail from '../components/LifecycleRail';
import StagePill from '../components/StagePill';
import { healthOf } from '../lib/derive';
import { usePortfolio } from '../portfolio-context';
import { Product } from '../types';

export interface ProductContext {
  product: Product;
}

/** Frame shown around every product screen: who it is, where it is in the lifecycle, and the tabs. */
export default function ProductLayout() {
  const { productId } = useParams();
  const portfolio = usePortfolio();
  const product = portfolio.products.find((p) => p.id === productId);

  if (!product) {
    return (
      <div className="card empty">
        <strong>Product not found</strong>
        <p>
          <Link to="/products" className="arrow-link">
            Back to My Products
          </Link>
        </p>
      </div>
    );
  }

  const live = product.phase === 'live';
  const reviews = portfolio.reviews.filter((r) => r.productId === product.id && r.status !== 'decided');
  const tabs = [
    { to: '', label: 'Overview', end: true },
    ...(live
      ? [
          { to: 'lifecycle', label: 'Lifecycle & Maturity' },
          { to: 'decision', label: 'Lifecycle Decision' },
        ]
      : [{ to: 'development', label: 'Development' }]),
    { to: 'governance', label: reviews.length ? `Governance (${reviews.length})` : 'Governance' },
    { to: 'activity', label: 'Activity' },
  ];

  return (
    <>
      <div className="crumbs">
        <Link to="/products">My Products</Link>
        <span aria-hidden>/</span>
        <span>{product.name}</span>
      </div>

      <header className="product-head">
        <div className="product-title">
          <h1>{product.name}</h1>
          <StagePill product={product} />
          <HealthBadge health={healthOf(product, portfolio)} />
        </div>
        <p className="subtitle">{product.summary}</p>
        <LifecycleRail product={product} />
      </header>

      <nav className="tabs" aria-label="Product sections">
        {tabs.map((tab) => (
          <NavLink key={tab.to} to={tab.to} end={tab.end} className={({ isActive }) => `tab${isActive ? ' active' : ''}`}>
            {tab.label}
          </NavLink>
        ))}
      </nav>

      <Outlet context={{ product } satisfies ProductContext} />
    </>
  );
}
