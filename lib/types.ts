export type BoardEntry = {
  spotId: string;
  min: number;
  pending: number;
  leader: { name: string; amount: number; logoUrl: string | null } | null;
};
