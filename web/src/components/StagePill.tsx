import { stageOf } from '../lib/stage';
import { MaturityStage, Product } from '../types';

export default function StagePill({ product }: { product: Product }) {
  const { label, kind } = stageOf(product);
  return <span className={`stage-pill ${kind === 'development' ? 'dev' : `m-${kind}`}`}>{label}</span>;
}

export function MaturityPill({ stage }: { stage: MaturityStage }) {
  return <span className={`stage-pill m-${stage}`}>{stage}</span>;
}
