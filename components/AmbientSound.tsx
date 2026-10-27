'use client';
import { useEffect, useRef, useState, type RefObject } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

export default function AmbientSound({
  targetRef, src = '/sounds/ambient.mp3',
}: { targetRef: RefObject<HTMLElement | null>; src?: string }) {
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const syncRef = useRef<() => void>(() => {});

  useEffect(() => {
    const a = new Audio(src);
    a.loop = true;
    a.volume = 0.4;
    a.preload = 'auto';
    audioRef.current = a;

    let visible = false;

    // Play only while the scene is on screen and not muted.
    const sync = () => {
      if (visible && !mutedRef.current) {
        // Browsers block sound until the user interacts. This promise rejects until then.
        a.play().catch(() => {});
      } else {
        a.pause();
      }
    };
    syncRef.current = sync;

    const io = new IntersectionObserver(
      ([entry]) => { visible = entry.intersectionRatio >= 0.5; sync(); },
      { threshold: [0, 0.5] },
    );
    if (targetRef.current) io.observe(targetRef.current);

    // The first click or key press unlocks audio. Retry playback then.
    const onGesture = () => sync();
    window.addEventListener('pointerdown', onGesture);
    window.addEventListener('keydown', onGesture);

    return () => {
      io.disconnect();
      window.removeEventListener('pointerdown', onGesture);
      window.removeEventListener('keydown', onGesture);
      a.pause();
      audioRef.current = null;
    };
  }, [src, targetRef]);

  const toggle = () => {
    mutedRef.current = !mutedRef.current;
    setMuted(mutedRef.current);
    syncRef.current();
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={muted ? 'Turn sound on' : 'Turn sound off'}
      className="sound-btn"
    >
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
    </button>
  );
}