// components/Glass.tsx
'use client'
import dynamic from 'next/dynamic';

const Glass = dynamic(() => import('liquid-glass-react'), { ssr: false });

export default Glass;