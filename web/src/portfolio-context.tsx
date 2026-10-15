import { createContext, ReactNode, useContext, useState } from 'react';
import { createPortfolio } from './data/portfolio';
import { Portfolio } from './types';

const PortfolioContext = createContext<Portfolio | null>(null);

/** Holds the one shared copy of the portfolio that every screen reads from. */
export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [portfolio] = useState<Portfolio>(createPortfolio);
  return <PortfolioContext.Provider value={portfolio}>{children}</PortfolioContext.Provider>;
}

export function usePortfolio(): Portfolio {
  const portfolio = useContext(PortfolioContext);
  if (!portfolio) throw new Error('usePortfolio must be used inside PortfolioProvider');
  return portfolio;
}
