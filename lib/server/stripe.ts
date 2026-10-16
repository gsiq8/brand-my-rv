import Stripe from 'stripe';

let s: Stripe | null = null;
export const stripe = () => (s ??= new Stripe(process.env.STRIPE_RV_STRIPE_SECRET_KEY!));
export const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
