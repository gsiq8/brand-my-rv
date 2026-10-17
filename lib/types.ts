export type BoardEntry = {
  spotId: string;
  min: number;      // minimum acceptable bid right now
  bids: number;     // bids placed on this spot (paid + pending offers)
  pending: number;  // pending offers
  leader: { name: string; amount: number; logoUrl: string | null; website: string | null } | null;
};
export type HistoryItem = { id: string; spotId: string; name: string; amount: number; status: string; at: string; logoUrl: string | null; website: string | null };
export type BoardResponse = {
  board: BoardEntry[];
  stats: { raised: number; bids: number; taken: number; total: number };
  history: HistoryItem[];
};

