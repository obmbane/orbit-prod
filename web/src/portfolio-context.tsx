import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { createPortfolio, newProductRequirements, OWNER } from './data/portfolio';
import { addDaysIso } from './lib/dates';
import { uid } from './lib/format';
import { ActionItem, ActivityEntry, Portfolio, Priority, Product } from './types';

const STORAGE_KEY = 'orbit.portfolio.v1';

function load(): Portfolio {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Portfolio;
      if (Array.isArray(saved.products) && Array.isArray(saved.actions) && Array.isArray(saved.reviews)) return saved;
    }
  } catch {
    // Storage unavailable or corrupt: fall back to the seed.
  }
  return createPortfolio();
}

export const entry = (kind: ActivityEntry['kind'], title: string, detail?: string): ActivityEntry => ({
  id: uid(),
  at: new Date().toISOString(),
  actor: OWNER,
  kind,
  title,
  detail,
});

export interface NewProductInput {
  name: string;
  summary: string;
  category: string;
}

export interface NewActionInput {
  productId: string;
  title: string;
  priority: Priority;
  due: string;
  source: string;
  link: string;
}

type Update = (portfolio: Portfolio) => Portfolio;

function makeActions(update: (fn: Update) => void, replace: (portfolio: Portfolio) => void) {
  const newAction = (input: NewActionInput): ActionItem => ({
    ...input,
    id: `action-${uid()}`,
    status: 'open',
    createdAt: new Date().toISOString(),
  });

  return {
    /** Throw the saved data away and go back to the seeded demo portfolio. */
    reset: () => replace(createPortfolio()),

    addProduct(input: NewProductInput): string {
      const slug = input.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'product';
      const id = `${slug}-${uid().slice(0, 3)}`;
      const product: Product = {
        id,
        name: input.name,
        summary: input.summary,
        category: input.category,
        owner: OWNER,
        phase: 'development',
        devStage: 'Idea',
        requirements: newProductRequirements(),
        activity: [entry('created', 'Product created')],
        createdAt: new Date().toISOString(),
      };
      const first = newAction({
        productId: id,
        title: 'Draft the problem statement',
        priority: 'Medium',
        due: addDaysIso(5),
        source: 'Idea requirement',
        link: `/products/${id}/development`,
      });
      update((p) => ({ ...p, products: [...p.products, product], actions: [...p.actions, first] }));
      return id;
    },
  };
}

export type PortfolioActions = ReturnType<typeof makeActions>;

interface Store {
  portfolio: Portfolio;
  actions: PortfolioActions;
}

const PortfolioContext = createContext<Store | null>(null);

/** Holds the one shared, editable copy of the portfolio. Changes are saved in the browser. */
export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [portfolio, setPortfolio] = useState<Portfolio>(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch {
      // Not being able to save is fine for a prototype.
    }
  }, [portfolio]);

  const actions = useMemo(() => makeActions((fn) => setPortfolio(fn), setPortfolio), []);
  const value = useMemo(() => ({ portfolio, actions }), [portfolio, actions]);
  return <PortfolioContext.Provider value={value}>{children}</PortfolioContext.Provider>;
}

function useStore(): Store {
  const store = useContext(PortfolioContext);
  if (!store) throw new Error('Portfolio hooks must be used inside PortfolioProvider');
  return store;
}

export const usePortfolio = (): Portfolio => useStore().portfolio;
export const usePortfolioActions = (): PortfolioActions => useStore().actions;
