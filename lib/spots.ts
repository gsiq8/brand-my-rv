import { CONFIG } from './config';

/**
 * AD SPOTS – edit this file to move, resize, add or remove spots, or change starting prices.
 * RV spots are placed on the 3D model (positions in model units; the motorhome is ~2 long):
 *   side 'x+' = left side, 'x-' = right (door) side, 'z-' = rear, 'y+' = roof
 *   a = position along the surface:  sides -> along the body (+ = toward the front), rear/roof -> across (x)
 *   b = sides/rear -> height (y),  roof -> front/back position (z)
 *   w, h = size of the ad.  price = starting price.  view = camera view that faces it.
 * A 'web' spot is a place on the website itself (not on the model), e.g. "the corner".
 */
export type Side = 'x+' | 'x-' | 'z-' | 'z+' | 'y+';
export type ViewKey = 'front' | 'back' | 'left' | 'right' | 'top';
type Base = { id: string; name: string; price: number; period?: string; noDeposit?: boolean; truckOnly?: boolean };
export type RvSpot = Base & { kind?: 'rv'; side: Side; a: number; b: number; w: number; h: number; view: ViewKey };
export type WebSpot = Base & { kind: 'web' };
export type SpotDef = RvSpot | WebSpot;
export const isRv = (s: SpotDef): s is RvSpot => s.kind !== 'web';

export const SPOTS: SpotDef[] = [
  { id: 'L1', name: 'Left side – large panel', side: 'x+', a: -0.275, b: 0.085, w: 0.43, h: 0.33, price: 400, view: 'left' },
  { id: 'L2', name: 'Left side – under window', side: 'x+', a: 0.19, b: -0.07, w: 0.36, h: 0.15, price: 250, view: 'left' },
  { id: 'R1', name: 'Right side – long band', side: 'x-', a: -0.17, b: -0.03, w: 0.68, h: 0.14, price: 350, view: 'right' },
  { id: 'R2', name: 'Right side – rear quarter', side: 'x-', a: -0.829, b: -0.096, w: 0.2, h: 0.3, price: 200, view: 'right' },
  { id: 'B1', name: 'Rear panel', side: 'z-', a: -0.05, b: -0.166, w: 0.38, h: 0.16, price: 350, view: 'back' },
  { id: 'T1', name: 'Roof', side: 'y+', a: 0, b: 0.1, w: 0.46, h: 0.4, price: 300, view: 'top' },
  { id: 'F1', name: 'Chassis brand – truck makers only', side: 'z+', a: 0, b: -0.15, w: 0.14, h: 0.1, price: 150, view: 'front', truckOnly: true },
  { id: 'F2', name: 'Chassis brand', side: 'z+', a: 0, b: 0.21, w: 0.24, h: 0.05, price: 150, view: 'front' },

  { kind: 'web', id: 'corner', name: 'The corner – top of this website', price: 50, period: 'one-time', noDeposit: true },
];
export const RV_SPOTS = SPOTS.filter(isRv);

export const groupOf = (s: RvSpot): string => {
  switch (s.side) {
    case 'y+':
      return 'Roof';
    case 'z-':
      return 'Rear';
    case 'z+':
      return 'Front';
    default:
      return 'Sides';
  }
};
/** Approximate real size, from the model size and CONFIG.rvLengthCm. */
export function sizeInfo(s: RvSpot) {
  const k = CONFIG.rvLengthCm / 2, area = s.w * s.h;
  return { label: area > 0.12 ? 'Large' : area > 0.05 ? 'Medium' : 'Small', cm: `≈ ${Math.round(s.w * k)} × ${Math.round(s.h * k)} cm` };
}

/** Brands allowed on truck-only spots. Lowercase, no punctuation – edit freely. */
export const TRUCK_BRANDS = [
  'iveco', 'mercedes', 'mercedes benz', 'ford', 'toyota', 'volvo', 'scania', 'daf', 'renault', 'renault trucks',
  'freightliner', 'kenworth', 'peterbilt', 'mack trucks', 'international trucks', 'navistar', 'western star',
  'isuzu', 'hino', 'fuso', 'mitsubishi fuso', 'nissan', 'ram trucks', 'chevrolet', 'gmc', 'dodge',
  'volkswagen', 'vw', 'man trucks', 'tata', 'mahindra', 'hyundai', 'kia', 'jac motors', 'foton', 'sinotruk', 'shacman', 'dongfeng',
];
export const TRUCK_ONLY_MSG = 'This spot is reserved for truck brands (Iveco, Mercedes-Benz, Ford, Toyota, Volvo…).';

const norm = (v: string) => ' ' + v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
export const brandAllowed = (s: SpotDef, name: string) =>
  !s.truckOnly || TRUCK_BRANDS.some((b) => norm(name).includes(norm(b)));