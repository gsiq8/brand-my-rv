/**
 * AD SPOTS – edit this file to move, resize, add or remove spots, or change starting prices.
 * Positions are in model units (the motorhome is ~2 long). The spot is placed by firing a ray at the model.
 *   side 'x+' = left side, 'x-' = right (door) side, 'z-' = rear, 'y+' = roof
 *   a = position along the surface:  sides -> along the body (+ = toward the front), rear/roof -> across (x)
 *   b = sides/rear -> height (y),  roof -> front/back position (z)
 *   w, h = size of the ad.  price = starting price (per CONFIG.periodLabel).  view = camera view that faces it.
 */
export type Side = 'x+' | 'x-' | 'z-' | 'y+';
export type ViewKey = 'front' | 'back' | 'left' | 'right' | 'top';
export type SpotDef = { id: string; name: string; side: Side; a: number; b: number; w: number; h: number; price: number; view: ViewKey };

export const SPOTS: SpotDef[] = [
  { id: 'L1', name: 'Left side – large panel', side: 'x+', a: -0.275, b: 0.085, w: 0.43, h: 0.33, price: 400, view: 'left' },
  { id: 'L2', name: 'Left side – under window', side: 'x+', a: 0.19, b: -0.07, w: 0.36, h: 0.15, price: 250, view: 'left' },
  { id: 'R1', name: 'Right side – long band', side: 'x-', a: -0.17, b: -0.03, w: 0.68, h: 0.14, price: 350, view: 'right' },
  { id: 'R2', name: 'Right side – rear quarter', side: 'x-', a: -0.829, b: -0.096, w: 0.2, h: 0.3, price: 200, view: 'right' },
  { id: 'B1', name: 'Rear panel', side: 'z-', a: -0.05, b: -0.166, w: 0.38, h: 0.16, price: 350, view: 'back' },
  { id: 'T1', name: 'Roof', side: 'y+', a: 0, b: 0.12, w: 0.46, h: 0.4, price: 300, view: 'top' },
];
