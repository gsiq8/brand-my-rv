export const CONFIG = {
  currency: 'usd',          // Stripe currency. NOTE: Pix only works with 'brl'.
  periodLabel: 'month',     // prices are per this period (a spot can override it with `period`)
  bidStep: 10,              // a new bid must beat the current top PAID bid by at least this much
  depositFixed: 10,         // deposit to reserve a spot with an offer (you collect the rest yourself)
  depositPercent: 0,        // e.g. 10 => deposit is max(depositFixed, 10% of the bid). Recommended for big amounts.
  invoiceHintFrom: 5000,    // from this bid amount the form recommends "deposit + invoice"
  goal: 440000,                  // fundraising / revenue goal shown under the headline (0 = hide the goal bar)
  rvLengthCm: 750,          // real length of the motorhome – used to show approximate ad sizes
  latitude: -51,            // sun path of the painted sky (-51 = Torres del Paine)
  panorama: '' as string,   // e.g. '/panorama.jpg' (2:1 equirectangular, ideally 8192x4096). '' = painted sky.
  panoramaSun: { u: 0.594, el: 50 }, // photo only: where the sun is in the photo (u 0–1 across, el degrees)
  auctionEnd: '' as string,  // ISO date, e.g. '2026-12-01T23:59:00Z'. '' = no end date (always live)
};
