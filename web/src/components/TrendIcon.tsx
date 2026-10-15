import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { Trend } from '../lib/maturity';

export default function TrendIcon({ trend, size = 14 }: { trend: Trend; size?: number }) {
  if (trend === 'improving') return <ArrowUp size={size} className="trend-good" aria-label="improving" />;
  if (trend === 'deteriorating') return <ArrowDown size={size} className="trend-bad" aria-label="deteriorating" />;
  return <Minus size={size} className="trend-flat" aria-label="stable" />;
}
