type Bidder = { name?: string; phone?: string; email?: string };
type BidInfo = {
  spot_id?: string; amount?: number; deposit?: number; display_name?: string;
  bidders?: Bidder | Bidder[] | null;   // o tipo inferido pode vir como lista
};

const bidderOf = (b: BidInfo): Bidder | undefined =>
  Array.isArray(b.bidders) ? b.bidders[0] : b.bidders ?? undefined;

async function ntfy(_url: string | undefined, title: string, body: string, _opts: { phone?: string; tags?: string; priority?: string } = {}) {
  const token = process.env.TELEGRAM_BOT_TOKEN, chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return;
  try {
    const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chat, text: `${title}\n\n${body}` }),
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) console.error('telegram failed', r.status, await r.text());
  } catch (e) {
    console.error('telegram failed', e);   // nunca derruba o webhook
  }

  if (!_url) return;
  try {
    await fetch(_url, {
      method: 'POST',
      headers: {
        Title: title,
        Priority: _opts.priority ?? 'default',
        ...(_opts.tags ? { Tags: _opts.tags } : {}),
        ...(_opts.phone ? { Click: `tel:${_opts.phone}` } : {}),
      },
      body, 
      signal: AbortSignal.timeout(8000),
    });
  } catch (e) {
    console.error('ntfy failed', e);   
  }
}

const who = (b: BidInfo) => bidderOf(b)?.name ?? b.display_name ?? 'Alguém';
const phoneOf = (b: BidInfo) => String(bidderOf(b)?.phone ?? '').replace(/[^\d+]/g, '');

/** Depósito pago: ligar para o cliente. */
export const notifyDeposit = (b: BidInfo) =>
  ntfy(process.env.DEPOSIT_HOOK_URL, 'Te depositãomin - ligar agora',
    `${who(b)} pagou o depósito de ${b.deposit} (lance ${b.amount}) no spot ${b.spot_id}. Tel: ${bidderOf(b)?.phone ?? '-'}`,
    { phone: phoneOf(b), tags: 'telephone_receiver', priority: 'high' });

/** Lance pago por completo: logo no ar. */
export const notifyPaid = (b: BidInfo) =>
  ntfy(process.env.PAYMENT_HOOK_URL ?? process.env.DEPOSIT_HOOK_URL, 'Te pagarãomin - logo no ar',
    `${who(b)} pagou ${b.amount} no spot ${b.spot_id}. A logo já foi publicadassim.`,
    { tags: 'moneybag' });

export const notifyAdmin = (title: string, body: string) => ntfy(undefined, title, body);

export const notifyLogoCheck = (b: BidInfo, paid: number, category: 'secure deposit' | 'full payment') =>
  ntfy(undefined, 'Logo approval needed', `${who(b)} paid $${paid}, ${category}, and needs logo approval. Spot ${b.spot_id}. ${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/admin`);