"use client";
import { Cliente, Pago } from '@/types/demo';
import { formatMoneda, formatFecha, diasRestantes, hoy } from '@/lib/demo-utils';
import BadgeVencimiento from './BadgeVencimiento';

interface Props {
  clientes: Cliente[];
  pagos: Pago[];
  totalActivos: number;
  totalVencidos: number;
  ingresosMes: number;
  moneda: string;
  correoVencimientoActivo: boolean;
  enviandoAvisos: boolean;
  onEnviarAvisos: () => void;
  onRenovar: (c: Cliente) => void;
}

export default function ReportesView({
  clientes, pagos, totalActivos, totalVencidos, ingresosMes, moneda,
  correoVencimientoActivo, enviandoAvisos, onEnviarAvisos, onRenovar,
}: Props) {
  const stats = [
    { label: 'Total Clientes', value: clientes.length,                          fgColor: 'var(--primary)', bgColor: 'color-mix(in srgb, var(--primary) 15%, transparent)' },
    { label: 'Activos',        value: totalActivos,                              fgColor: 'var(--green)',   bgColor: 'var(--green-bg)' },
    { label: 'Vencidos',       value: totalVencidos,                             fgColor: '#f87171',        bgColor: 'color-mix(in srgb, #f87171 15%, transparent)' },
    { label: 'Ingresos Mes',   value: formatMoneda(ingresosMes, moneda),         fgColor: 'var(--accent)',  bgColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' },
  ];

  const proximosAVencer = clientes.filter(c => {
    if (!c.fecha_vencimiento || c.estado_pago !== 'Activo') return false;
    const d = diasRestantes(c.fecha_vencimiento);
    return d >= 0 && d <= 5;
  });

  return (
    <div className="animate-fade-in space-y-6">

      {/* Resumen */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl p-3 lg:p-4"
            style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 12%, transparent)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold t-subtle uppercase tracking-widest">{s.label}</p>
            <p className="text-xl lg:text-2xl font-black mt-1" style={{ color: s.fgColor }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Últimos pagos */}
      <div className="t-card rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="p-4 lg:p-5 flex items-center justify-between t-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-black t-text">💳 Últimos Pagos</h3>
          {correoVencimientoActivo && (
            <button onClick={onEnviarAvisos} disabled={enviandoAvisos} className="t-btn text-xs px-3 py-2">
              {enviandoAvisos
                ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" /> Enviando...</>
                : '📧 Enviar Avisos'}
            </button>
          )}
        </div>
        {pagos.slice(0, 20).length === 0 ? (
          <p className="p-6 text-sm t-subtle text-center">Sin pagos registrados.</p>
        ) : pagos.slice(0, 20).map((p, i) => {
          const cliente = clientes.find(c => c.id === p.cliente_id);
          return (
            <div key={p.id} className="px-4 lg:px-5 py-3 flex items-center justify-between gap-4 t-hover transition"
              style={{ borderBottom: i < Math.min(pagos.length, 20) - 1 ? '1px solid var(--border)' : 'none' }}>
              <div>
                <p className="font-bold t-text text-sm">{cliente?.nombre || 'Cliente eliminado'}</p>
                <p className="text-xs t-subtle">{formatFecha(p.fecha_pago)} · {p.metodo_pago} · {p.plan}</p>
              </div>
              <p className="font-black t-primary text-sm shrink-0">{formatMoneda(p.monto, moneda)}</p>
            </div>
          );
        })}
      </div>

      {/* Próximos a vencer */}
      <div className="t-card rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="p-4 lg:p-5 t-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-black t-text">⚠️ Próximos a Vencer (5 días)</h3>
        </div>
        {proximosAVencer.length === 0 ? (
          <p className="text-sm t-subtle p-5">Ningún cliente vence en los próximos 5 días. 🎉</p>
        ) : (
          <ul>
            {proximosAVencer.map((c, i) => (
              <li key={c.id} className="px-4 lg:px-5 py-3 flex justify-between items-center gap-4 t-hover transition"
                style={{ borderBottom: i < proximosAVencer.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <p className="font-bold t-text text-sm">{c.nombre}</p>
                  <p className="text-xs t-muted">{c.plan}{c.correo ? ` · ${c.correo}` : ' · sin correo'}</p>
                </div>
                <div className="flex items-center gap-3">
                  <BadgeVencimiento fecha={c.fecha_vencimiento} />
                  <button onClick={() => onRenovar(c)} className="t-badge cursor-pointer hover:opacity-80 transition shrink-0">
                    Renovar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
