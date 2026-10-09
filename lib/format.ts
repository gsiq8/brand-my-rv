import { CONFIG } from './config';

export const money = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: CONFIG.currency.toUpperCase(), maximumFractionDigits: 0 }).format(n);
