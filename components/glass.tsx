'use client';
import dynamic from 'next/dynamic';
import { useSyncExternalStore, type CSSProperties, type ReactNode } from 'react';

const Lib = dynamic(() => import('liquid-glass-react'), { ssr: false });
const MQ = '(max-width: 760px)';
const subscribe = (cb: () => void) => {
  const m = matchMedia(MQ); m.addEventListener('change', cb);
  return () => m.removeEventListener('change', cb);
};
const isMobile = () => matchMedia(MQ).matches;

type Props = { children?: ReactNode; style?: CSSProperties; className?: string; cornerRadius?: number; [k: string]: any };

export default function Glass({ children, style, className, cornerRadius = 24, ...rest }: Props) {
  const mobile = useSyncExternalStore(subscribe, isMobile, () => false);
  if (!mobile) {
    return <Lib style={style} className={className} cornerRadius={cornerRadius} {...rest}>{children}</Lib>;
  }
  const translate = style?.top === '50%' ? 'translate(-50%, -50%)'
    : style?.left === '50%' ? 'translateX(-50%)' : undefined;
  return (
    <div className={className} style={{
      ...style, transform: translate, borderRadius: cornerRadius,
      background: 'rgba(255,255,255,.72)',
      backdropFilter: 'blur(14px) saturate(160%)', WebkitBackdropFilter: 'blur(14px) saturate(160%)',
      border: '1px solid rgba(255,255,255,.6)',
    }}>
      {children}
    </div>
  );
}