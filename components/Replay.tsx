'use client';
import Motorhome3D, { type ViewName } from './Motorhome3D';
import { rvSpot } from '@/lib/replay';
import type { ReplayEvent } from '@/lib/replay';

type Props = {
  logos: Record<string, string | null>;
  amounts: Record<string, number | null>;
  current: ReplayEvent | null;   // event under the slider
  step: number;                  // changes on each event, re-triggers the camera
};

export default function ReplayScene({ logos, amounts, current, step }: Props) {
  const spot = current ? rvSpot(current.spotId) : undefined;
  const view: { name: ViewName; n: number } | null = spot ? { name: spot.view, n: step } : null;
  return (
    <Motorhome3D
      logos={logos}
      mins={{}}
      amounts={amounts}
      selected={current?.spotId ?? null}
      draft={null}
      view={view}
      mode="final"
      readOnly
      onSelect={() => {}}
    />
  );
}