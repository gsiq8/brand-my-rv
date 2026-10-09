'use client';
import BidWizard from './BidWizard';
import type { BoardEntry } from '@/lib/types';

type Props = {
  board: Record<string, BoardEntry>; selected: string | null;
  onSelect: (id: string) => void; onDraft: (spotId: string, dataUrl: string | null) => void; onClose: () => void;
};

export default function BidDrawer({ onClose, ...p }: Props) {
  return (
    <aside className="drawer" role="dialog" aria-label="Place a bid">
      <div className="drawer-head"><b>Place a bid</b><button className="x" onClick={onClose} aria-label="Close">✕</button></div>
      <BidWizard {...p} />
    </aside>
  );
}
