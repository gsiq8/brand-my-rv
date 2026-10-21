'use client';
import { COPY } from '@/lib/site';
import type { BoardResponse } from '@/lib/types';

const n = (v: number) => v.toLocaleString('en-US');

/** Social-proof counter line: views · visitors · spots sold. */
export default function Counters({ data, visitors }: { data: BoardResponse | null; visitors: number | null }) {
  const items: { v: string; l: string }[] = [];
  if (COPY.counters.viewsValue) items.push({ v: COPY.counters.viewsValue, l: COPY.counters.viewsLabel });
  if (visitors != null) items.push({ v: n(visitors), l: 'visitors' });
  if (data) items.push({ v: `${data.stats.taken}/${data.stats.total}`, l: 'spots sold' });
  if (!items.length) return null;
  return (
    <div className="counters text-[12px] mb-8 md:mb-5 muted ">
      {items.map((it, i) => (
        <span key={it.l}>{i > 0 && <i className="dot text-(--mm)"> • </i>}<b> {it.v}</b> {it.l}</span>
      ))}
    </div>
  );
}
