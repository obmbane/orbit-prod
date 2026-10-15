import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App';
import { PortfolioProvider } from './portfolio-context';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PortfolioProvider>
      <HashRouter>
        <App />
      </HashRouter>
    </PortfolioProvider>
  </React.StrictMode>,
);
