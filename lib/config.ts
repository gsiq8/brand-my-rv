export const CONFIG = {
  currency: 'usd',
  periodLabel: 'year',
  bidStep: 100,          // a new live bid must beat the live bid by at least this
  closeDays: 5,          // a spot closes this many days after its first card hold is confirmed
  wireHours: 48,         // winner's window to sign and wire, from the close notice
  defaultPercent: 10,    // media exposure fee charged to the held card if the wire is late
  goal: 440000,
  rvLengthCm: 750,
  latitude: -51,
  panorama: '' as string,
  panoramaSun: { u: 0.594, el: 50 },
  auctionEnd: '' as string,
};