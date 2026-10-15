export const money = (millions: number) => `£${millions.toFixed(1)}m`;
export const pct = (value: number, signed = true) => `${value < 0 ? '−' : signed && value > 0 ? '+' : ''}${Math.abs(value)}%`;
export const num = (n: number) => n.toLocaleString('en-GB');
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
export const uid = () => Math.random().toString(36).slice(2, 9);
