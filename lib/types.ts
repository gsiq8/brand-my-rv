export type SpotState = 'open' | 'closed' | 'settled' | 'defaulted';
export type BoardEntry = {
  spotId: string;
  min: number;            // minimum acceptable bid right now
  bids: number;           // all bids on this spot
  pending: number;        // bids waiting for logo review
  state: SpotState;
  closesAt: string | null;
  leader: { name: string; amount: number; logoUrl: string | null; website: string | null; logoFullUrl: string | null } | null;
};
export type HistoryItem = {
  id: string; spotId: string; name: string; amount: number; status: string; at: string;
  logoUrl: string | null; website: string | null;
  charged: number | null;   // whole units actually collected; null if nothing was collected
};
export type BoardResponse = {
  board: BoardEntry[];
  stats: { raised: number; bids: number; taken: number; total: number };
  history: HistoryItem[];
};