'use client';
export default function BrandLink({ href, children }: { href?: string | null; children: React.ReactNode }) {
  if (!href) return <>{children}</>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer sponsored" className="brand-link"
       onClick={(e) => e.stopPropagation()}>{children}</a>
  );
}