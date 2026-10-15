import { MaturityStage, Product } from '../types';

export interface StageInfo {
  label: string;
  /** `development` while pre-launch; otherwise the maturity stage, used to colour it. */
  kind: 'development' | MaturityStage;
}

/** The stage a product is in now: its development stage before launch, its maturity stage once live. */
export function stageOf(product: Product): StageInfo {
  if (product.phase === 'development') return { label: product.devStage, kind: 'development' };
  const maturity = product.maturity ?? 'Introduction';
  return { label: maturity, kind: maturity };
}
