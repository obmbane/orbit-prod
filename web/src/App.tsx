import { NavLink, Route, Routes } from 'react-router-dom';
import { CheckSquare, Home, Layers, LucideIcon, Package, ShieldCheck } from 'lucide-react';
import { daysUntil } from './lib/dates';
import { openActions } from './lib/derive';
import { usePortfolio, usePortfolioActions } from './portfolio-context';
import HomePage from './pages/Home';
import Placeholder from './pages/Placeholder';
import Actions from './pages/Actions';
import ComingSoon from './pages/ComingSoon';
import ProductActivity from './pages/ProductActivity';
import ProductDevelopment from './pages/ProductDevelopment';
import ProductLayout from './pages/ProductLayout';
import ProductOverview from './pages/ProductOverview';
import Products from './pages/Products';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  title: string;
  question: string;
}

const NAV: NavItem[] = [
  { to: '/', label: 'Home', icon: Home, title: 'Home', question: 'What needs my attention today?' },
  { to: '/products', label: 'My Products', icon: Package, title: 'My Products', question: 'What products am I responsible for, and what stage is each in?' },
  { to: '/lifecycle', label: 'Lifecycle', icon: Layers, title: 'Lifecycle', question: 'Is each live product growing, mature or declining, and what should we do with it?' },
  { to: '/governance', label: 'Governance', icon: ShieldCheck, title: 'Governance', question: 'What organisational decision do I need, and what evidence supports it?' },
  { to: '/actions', label: 'My Actions', icon: CheckSquare, title: 'My Actions', question: 'What am I personally responsible for doing?' },
];

export default function App() {
  const portfolio = usePortfolio();
  const { owner } = portfolio;
  const overdue = openActions(portfolio).filter((a) => daysUntil(a.due) < 0).length;
  const { reset } = usePortfolioActions();
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
            {to === '/actions' && overdue > 0 && <span className="nav-count hot" title="Overdue actions">{overdue}</span>}
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
            <Route path="/actions" element={<Actions />} />
            {NAV.filter(({ to }) => to !== '/' && to !== '/products' && to !== '/actions').map(({ to, title, question }) => (
              <Route key={to} path={to} element={<Placeholder title={title} question={question} />} />
            ))}
            <Route path="/products/:productId" element={<ProductLayout />}>
              <Route index element={<ProductOverview />} />
              <Route path="overview" element={<ProductOverview />} />
              <Route path="development" element={<ProductDevelopment />} />
              <Route path="lifecycle" element={<ComingSoon title="Lifecycle & Maturity" />} />
              <Route path="decision" element={<ComingSoon title="Lifecycle Decision" />} />
              <Route path="governance" element={<ComingSoon title="Governance" />} />
              <Route path="activity" element={<ProductActivity />} />
            </Route>
            <Route path="*" element={<Placeholder title="Not found" question="That page doesn't exist." />} />
          </Routes>
        </div>
      </main>
    </div>
  );
}
