import { NavLink, Route, Routes } from 'react-router-dom';
import { CheckSquare, Home, Layers, LucideIcon, Package, ShieldCheck } from 'lucide-react';
import { daysUntil } from './lib/dates';
import { openActions } from './lib/derive';
import Actions from './pages/Actions';
import Governance from './pages/Governance';
import HomePage from './pages/Home';
import Lifecycle from './pages/Lifecycle';
import Placeholder from './pages/Placeholder';
import ProductActivity from './pages/ProductActivity';
import ProductDecision from './pages/ProductDecision';
import ProductDevelopment from './pages/ProductDevelopment';
import ProductGovernance from './pages/ProductGovernance';
import ProductLayout from './pages/ProductLayout';
import ProductLifecycle from './pages/ProductLifecycle';
import ProductOverview from './pages/ProductOverview';
import Products from './pages/Products';
import { usePortfolio, usePortfolioActions } from './portfolio-context';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/products', label: 'My Products', icon: Package },
  { to: '/lifecycle', label: 'Lifecycle', icon: Layers },
  { to: '/governance', label: 'Governance', icon: ShieldCheck },
  { to: '/actions', label: 'My Actions', icon: CheckSquare },
];

export default function App() {
  const portfolio = usePortfolio();
  const { reset } = usePortfolioActions();
  const { owner } = portfolio;
  const overdue = openActions(portfolio).filter((a) => daysUntil(a.due) < 0).length;
  const openReviews = portfolio.reviews.filter((r) => r.status !== 'decided').length;

  const resetDemo = () => {
    if (window.confirm('Reset all demo data? Your changes in this browser will be lost.')) reset();
  };

  return (
    <div className="app">
      <nav className="sidebar" aria-label="Main">
        <div className="brand">
          <span className="brand-mark">
            <Layers size={16} />
          </span>
          <span>Orbit</span>
        </div>
        {NAV.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Icon size={18} />
            <span>{label}</span>
            {to === '/governance' && openReviews > 0 && (
              <span className="nav-count" title="Open reviews">
                {openReviews}
              </span>
            )}
            {to === '/actions' && overdue > 0 && (
              <span className="nav-count hot" title="Overdue actions">
                {overdue}
              </span>
            )}
          </NavLink>
        ))}
        <div className="side-foot">
          <div className="persona">
            <span className="avatar">{owner.split(' ').map((w) => w[0]).join('')}</span>
            <span>
              <span className="block">{owner}</span>
              <span className="muted small">Product Manager</span>
            </span>
          </div>
          <button className="link-btn" onClick={resetDemo}>
            Reset demo data
          </button>
        </div>
      </nav>
      <main className="main">
        <div className="page">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<Products />} />
            <Route path="/lifecycle" element={<Lifecycle />} />
            <Route path="/governance" element={<Governance />} />
            <Route path="/governance/:reviewId" element={<Governance />} />
            <Route path="/actions" element={<Actions />} />
            <Route path="/products/:productId" element={<ProductLayout />}>
              <Route index element={<ProductOverview />} />
              <Route path="overview" element={<ProductOverview />} />
              <Route path="development" element={<ProductDevelopment />} />
              <Route path="lifecycle" element={<ProductLifecycle />} />
              <Route path="decision" element={<ProductDecision />} />
              <Route path="governance" element={<ProductGovernance />} />
              <Route path="activity" element={<ProductActivity />} />
            </Route>
            <Route path="*" element={<Placeholder title="Not found" question="That page doesn't exist." />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
