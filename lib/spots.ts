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
type Base = { id: string; name: string; price: number; period?: string; noDeposit?: boolean; truckOnly?: boolean; builderOnly?: boolean; };
export type RvSpot = Base & { kind?: 'rv'; side: Side; a: number; b: number; w: number; h: number; view: ViewKey };
export type WebSpot = Base & { kind: 'web' };
export type SpotDef = RvSpot | WebSpot;
export const isRv = (s: SpotDef): s is RvSpot => s.kind !== 'web';

export const SPOTS: SpotDef[] = [
  { id: 'L1', name: 'Left side – large panel', side: 'x+', a: -0.275, b: 0.078, w: 0.5, h: 0.42, price: 47000, view: 'left' },
  { id: 'L2', name: 'Left side – medium under window', side: 'x+', a: 0.2, b: -0.05, w: 0.4, h: 0.15, price: 16000, view: 'left' },
  { id: 'L3', name: 'Left side – medium long band', side: 'x+', a: 0.08, b: -0.22, w: 0.65, h: 0.14, price: 17000, view: 'right' },
  { id: 'L4', name: 'Left side – large panel under second window', side: 'x+', a: -0.75, b: -0.1, w: 0.4, h: 0.32, price: 37000, view: 'left' },
  { id: 'L5', name: 'Left side – small panel besides second window', side: 'x+', a: -0.87, b: 0.14, w: 0.16, h: 0.12, price: 6400, view: 'left' },
  { id: 'L6', name: 'Left side – above second window', side: 'x+', a: -0.75, b: 0.28, w: 0.4, h: 0.12, price: 7400, view: 'left' },

  { id: 'R1', name: 'Right side – top fullside band', side: 'x-', a: -0.28, b: 0.27, w: 1.35, h: 0.12, price: 32000, view: 'right' },
  { id: 'R2', name: 'Right side – middle fullside band', side: 'x-', a: -0.4, b: 0, w: 1.15, h: 0.14, price: 32000, view: 'right' },
  { id: 'R3', name: 'Right side – bottom fullside band', side: 'x-', a: -0.4, b: -0.18, w: 1.15, h: 0.18, price: 37000, view: 'right' },
  { id: 'R4', name: 'Right side – last window', side: 'x-', a: -0.88, b: 0.14, w: 0.19, h: 0.13, price: 6400, view: 'right' },
  { id: 'R5', name: 'Right side – between windows', side: 'x-', a: -0.41, b: 0.14, w: 0.28, h: 0.13, price: 7400, view: 'right' },
  { id: 'R6', name: 'Right side – first window', side: 'x-', a: 0.13, b: 0.14, w: 0.1, h: 0.13, price: 4400, view: 'right' },

  { id: 'B1', name: 'Rear panel', side: 'z-', a: 0.0, b: -0.09, w: 0.5, h: 0.27, price: 49000, view: 'back' },
  
  { id: 'T1', name: 'Roof', side: 'y+', a: 0, b: 0.1, w: 0.46, h: 0.4, price: 49000, view: 'top' },
 
  { id: 'F1', name: 'Chassis brand', side: 'z+', a: 0, b: -0.15, w: 0.14, h: 0.1, price: 52000, view: 'front', truckOnly: true },
  { id: 'F2', name: 'Builders brand', side: 'z+', a: 0, b: 0.21, w: 0.24, h: 0.05, price: 40000, view: 'front', builderOnly: true },

  { kind: 'web', id: 'corner', name: 'The corner – top of this website', price: 50, period: 'one-time', noDeposit: true },
];
export const RV_SPOTS = SPOTS.filter(isRv);

export const TOTAL_START = RV_SPOTS.reduce((n, s) => n + s.price, 0);

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

/** Brands allowed on truck-only spots. Lowercase, no punctuation – edit freely. */
export const BUILDER_BRANDS = [
  'newmar', 'expeditionromer', 'santo inácio', 'neway', 'vegini', 'entegra', 'joyco', 
];
export const BUILDER_ONLY_MSG = 'This spot is reserved for builder brands (Newmar, Entegra, Santo Inácio, etc.';

const norm = (v: string) => ' ' + v.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, ' ').trim() + ' ';
export const brandAllowed = (s: SpotDef, name: string) =>
  (!s.truckOnly || TRUCK_BRANDS.some((b) => norm(name).includes(norm(b)))) &&
  (!s.builderOnly || BUILDER_BRANDS.some((b) => norm(name).includes(norm(b))));
