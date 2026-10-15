import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { createPortfolio, newProductRequirements, OWNER } from './data/portfolio';
import { addDaysIso } from './lib/dates';
import { uid } from './lib/format';
import { gateOf } from './lib/derive';
import { ActionItem, ActivityEntry, DEV_STAGES, DevStage, MaturityStage, Portfolio, Priority, Product, RequirementStatus } from './types';

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

const withLog = (product: Product, e: ActivityEntry): Product => ({ ...product, activity: [e, ...product.activity] });

const mapProduct = (portfolio: Portfolio, id: string, fn: (p: Product) => Product): Portfolio => ({
  ...portfolio,
  products: portfolio.products.map((p) => (p.id === id ? fn(p) : p)),
});

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

    setRequirementStatus(productId: string, stage: DevStage, requirementId: string, status: RequirementStatus, blockerNote?: string) {
      update((portfolio) =>
        mapProduct(portfolio, productId, (product) => {
          const requirement = product.requirements[stage].find((r) => r.id === requirementId);
          if (!requirement) return product;
          const title =
            status === 'complete'
              ? `Completed: ${requirement.title}`
              : status === 'blocked'
                ? `Blocked: ${requirement.title}`
                : `${requirement.title} is ${status === 'in-progress' ? 'in progress' : 'not started'}`;
          return withLog(
            {
              ...product,
              requirements: {
                ...product.requirements,
                [stage]: product.requirements[stage].map((r) =>
                  r.id === requirementId ? { ...r, status, blockerNote: status === 'blocked' ? blockerNote : undefined } : r,
                ),
              },
            },
            entry('requirement', title, status === 'blocked' ? blockerNote : undefined),
          );
        }),
      );
    },

    addEvidence(productId: string, stage: DevStage, requirementId: string, title: string) {
      update((portfolio) =>
        mapProduct(portfolio, productId, (product) =>
          withLog(
            {
              ...product,
              requirements: {
                ...product.requirements,
                [stage]: product.requirements[stage].map((r) =>
                  r.id === requirementId
                    ? { ...r, evidence: [...r.evidence, { id: uid(), title, addedBy: OWNER, addedAt: new Date().toISOString() }] }
                    : r,
                ),
              },
            },
            entry('evidence', `Evidence added: ${title}`),
          ),
        ),
      );
    },

    /** Moves a pre-launch product to its next stage, or launches it. Only works when every requirement is complete. */
    advanceStage(productId: string) {
      update((portfolio) =>
        mapProduct(portfolio, productId, (product) => {
          if (product.phase !== 'development' || !gateOf(product).ready) return product;
          const index = DEV_STAGES.indexOf(product.devStage);
          if (index === DEV_STAGES.length - 1) {
            const now = new Date().toISOString();
            return withLog(
              { ...product, phase: 'live', maturity: 'Introduction', maturityConfirmedAt: now, launchedAt: now },
              entry('stage', 'Launched', 'All launch requirements met. The product is now live, in Introduction.'),
            );
          }
          const next = DEV_STAGES[index + 1];
          return withLog({ ...product, devStage: next }, entry('stage', `Advanced to ${next}`, `${product.devStage} gate passed: every requirement complete.`));
        }),
      );
    },

    /** The Product Manager confirms (or overrides) the maturity stage. A changed stage reopens any lifecycle decision. */
    confirmMaturity(productId: string, stage: MaturityStage, note?: string) {
      update((portfolio) =>
        mapProduct(portfolio, productId, (product) => {
          const changed = product.maturity !== stage;
          return withLog(
            {
              ...product,
              maturity: stage,
              maturityConfirmedAt: new Date().toISOString(),
              lifecycleDecision: changed ? undefined : product.lifecycleDecision,
            },
            entry('maturity', `Maturity ${changed ? 'set to' : 'confirmed as'} ${stage}`, note),
          );
        }),
      );
    },

    createAction(input: NewActionInput): string {
      const action = newAction(input);
      update((p) => ({ ...p, actions: [...p.actions, action] }));
      return action.id;
    },

    setActionStatus(id: string, status: ActionItem['status']) {
      update((p) => ({ ...p, actions: p.actions.map((a) => (a.id === id ? { ...a, status } : a)) }));
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
