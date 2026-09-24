import { diasRestantes, formatFecha } from '@/lib/demo-utils';

export default function BadgeVencimiento({ fecha }: { fecha: string }) {
  if (!fecha) return <span className="t-subtle text-sm">—</span>;
  const dias = diasRestantes(fecha);
  let bgColor   = 'var(--green-bg)';
  let textColor = 'var(--green)';
  let label     = `${dias}d restantes`;

  if (dias < 0)       { bgColor = '#7f1d1d'; textColor = '#f87171'; label = `Venció hace ${Math.abs(dias)}d`; }
  else if (dias <= 5) { bgColor = '#7c2d12'; textColor = '#fb923c'; }

  return (
    <div>
      <p className="text-sm t-text">{formatFecha(fecha)}</p>
      <span
        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: bgColor + '40', color: textColor }}
      >
        {label}
      </span>
    </div>
  );
}
