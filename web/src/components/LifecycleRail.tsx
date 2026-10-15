import { Check } from 'lucide-react';
import { DEV_STAGES, MATURITY_STAGES, Product } from '../types';

/** The whole lifecycle in one line: Build (development) then Run (maturity). Always shows where a product is. */
export default function LifecycleRail({ product }: { product: Product }) {
  const live = product.phase === 'live';
  const devIndex = DEV_STAGES.indexOf(product.devStage);
  const maturityIndex = product.maturity ? MATURITY_STAGES.indexOf(product.maturity) : -1;

  return (
    <div className="rail" role="list" aria-label="Product lifecycle">
      <div className="rail-group">
        <span className="rail-caption">Build</span>
        <div className="rail-steps">
          {DEV_STAGES.map((stage, i) => {
            const state = live || i < devIndex ? 'done' : i === devIndex ? 'current' : 'todo';
            return (
              <div key={stage} role="listitem" className={`rail-step ${state}`} aria-current={state === 'current' ? 'step' : undefined}>
                <span className="rail-dot">{state === 'done' && <Check size={11} strokeWidth={3} />}</span>
                <span className="rail-label">{stage}</span>
              </div>
            );
          })}
        </div>
      </div>
      <div className="rail-sep" />
      <div className="rail-group">
        <span className="rail-caption">Run</span>
        <div className="rail-steps">
          {MATURITY_STAGES.map((stage, i) => {
            const state = !live ? 'todo' : i < maturityIndex ? 'past' : i === maturityIndex ? 'current' : 'todo';
            return (
              <div key={stage} role="listitem" className={`rail-step m-${stage} ${state}`} aria-current={state === 'current' ? 'step' : undefined}>
                <span className="rail-dot" />
                <span className="rail-label">{stage}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
