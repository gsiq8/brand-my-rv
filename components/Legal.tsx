
export const CONTACT = 'contact@siquieroli.com';
// export const H = ({ children }: { children: React.ReactNode }) => <h3 style={{ margin: '28px 0 8px' }}>{children}</h3>;

export default function Legal({ title, short, children }: { title: string; short: string; children: React.ReactNode }) {

  
  return (
    <main className="wrap sec" style={{ maxWidth: 760 }}>
      <p className="small muted">Legal</p>
      <h2 className="mt-2 text-4xl font-semibold tracking-[-0.025em">{title}</h2>
      <p className="muted small mt-2">Last updated: 17 October 2026</p>
      <p className="mt-10 mb-10 p-4 bg-[#6b748019] rounded-xl text-[12px]"><b>The short version:</b> {short}</p>
      <div className= "p">{children}</div>
    </main>
  );
}