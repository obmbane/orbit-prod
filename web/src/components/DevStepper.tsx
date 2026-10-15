import { Check } from 'lucide-react';
import { stageProgress } from '../lib/derive';
import { DEV_STAGES, DevStage, Product } from '../types';

/** The six development stages as cards. Click one to see its requirements. */
export default function DevStepper({ product, selected, onSelect }: { product: Product; selected: DevStage; onSelect: (stage: DevStage) => void }) {
  const current = DEV_STAGES.indexOf(product.devStage);
  return (
    <div className="stepper">
      {DEV_STAGES.map((stage, i) => {
        const done = product.phase === 'live' || i < current;
        const state = done ? 'done' : i === current ? 'current' : 'todo';
        const progress = stageProgress(product, stage);
        return (
          <button key={stage} className={`step ${state}${selected === stage ? ' selected' : ''}`} onClick={() => onSelect(stage)} aria-pressed={selected === stage}>
            <span className="step-dot">{done ? <Check size={14} strokeWidth={3} /> : i + 1}</span>
            <span className="step-name">{stage}</span>
            <span className="step-meta">{done ? 'Complete' : i === current ? `${progress.complete} of ${progress.total} done` : 'Not started'}</span>
          </button>
        );
      })}
    </div>
  );
}
