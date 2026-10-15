import { NavLink, Route, Routes } from 'react-router-dom';
import { CheckSquare, Home, Layers, LucideIcon, Package, ShieldCheck } from 'lucide-react';
import HomePage from './pages/Home';
import Placeholder from './pages/Placeholder';
import ComingSoon from './pages/ComingSoon';
import ProductActivity from './pages/ProductActivity';
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
          </NavLink>
        ))}
      </nav>
      <main className="main">
        <div className="page">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<Products />} />
            {NAV.filter(({ to }) => to !== '/' && to !== '/products').map(({ to, title, question }) => (
              <Route key={to} path={to} element={<Placeholder title={title} question={question} />} />
            ))}
            <Route path="/products/:productId" element={<ProductLayout />}>
              <Route index element={<ProductOverview />} />
              <Route path="overview" element={<ProductOverview />} />
              <Route path="development" element={<ComingSoon title="Development" />} />
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
