import { ReactNode } from 'react';
import { Health } from '../lib/derive';
import { Priority } from '../types';

export type Tone = 'green' | 'amber' | 'red' | 'blue' | 'violet' | 'grey';

export function Badge({ tone = 'grey', dot, children }: { tone?: Tone; dot?: boolean; children: ReactNode }) {
  return (
    <span className={`badge tone-${tone}`}>
      {dot && <i className="dot" />}
      {children}
    </span>
  );
}

const HEALTH_TONE: Record<Health, Tone> = { Healthy: 'green', Watch: 'amber', 'At risk': 'red' };

export const HealthBadge = ({ health }: { health: Health }) => (
  <Badge tone={HEALTH_TONE[health]} dot>
    {health}
  </Badge>
);

const PRIORITY_TONE: Record<Priority, Tone> = { High: 'red', Medium: 'amber', Low: 'grey' };

export const PriorityTag = ({ priority }: { priority: Priority }) => <Badge tone={PRIORITY_TONE[priority]}>{priority}</Badge>;
