import { stageOf } from '../lib/stage';
import { Product } from '../types';

export default function StagePill({ product }: { product: Product }) {
  const { label, kind } = stageOf(product);
  return <span className={`stage-pill ${kind === 'development' ? 'dev' : `m-${kind}`}`}>{label}</span>;
}
