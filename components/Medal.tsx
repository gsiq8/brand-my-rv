const STYLE = [
  'bg-[linear-gradient(145deg,#f8dd86_0%,#e0b64a_45%,#c1902a_100%)] text-[#5f4310] ring-1 ring-inset ring-[#b8862a]/40 font-medium',   // gold
  'bg-[linear-gradient(145deg,#f1f2f4_0%,#cdced2_45%,#a4a5aa_100%)] text-zinc-700 font-medium',             // silver (yours)
  'bg-[linear-gradient(145deg,#e8b887_0%,#c98c4e_45%,#a2672f_100%)] text-orange-950 ring-1 ring-inset ring-[#95602c] font-medium', // bronze
];

export default function Medal({ rank, size = 28, className = '' }: { rank: number; size?: number; className?: string }) {
  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full font-bold shadow-sm ring-1 ring-black/10 ${STYLE[rank - 1] ?? 'bg-zinc-200 text-zinc-600'} ${className}`}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >{rank}</span>
  );
}