type Stat = { label: string; value: string | number; fgColor: string; bgColor: string };

export default function StatsGrid({ stats, bgOverride }: { stats: Stat[]; bgOverride?: string }) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="rounded-xl p-3 lg:p-4"
          style={{ backgroundColor: bgOverride ?? s.bgColor, border: '1px solid var(--border)' }}>
          <p className="text-xs font-bold t-subtle uppercase tracking-widest">{s.label}</p>
          <p className="text-xl lg:text-2xl font-black mt-1" style={{ color: s.fgColor }}>{s.value}</p>
        </div>
      ))}
    </div>
  );
}
