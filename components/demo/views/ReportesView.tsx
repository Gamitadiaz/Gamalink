"use client";
import { formatMoneda, formatFecha, diasRestantes } from '@/lib/helpers';
import BadgeVencimiento from '@/components/demo/BadgeVencimiento';
import StatsGrid from '@/components/demo/StatsGrid';
import type { Cliente, Pago, Config } from '@/lib/types';

type Props = {
  clientes: Cliente[];
  pagos: Pago[];
  config: Config;
  totalActivos: number;
  totalVencidos: number;
  ingresosMes: number;
  enviandoAvisos: boolean;
  setEnviandoAvisos: (v: boolean) => void;
  setClienteARenovar: (c: Cliente) => void;
};

export default function ReportesView({
  clientes, pagos, config, totalActivos, totalVencidos, ingresosMes,
  enviandoAvisos, setEnviandoAvisos, setClienteARenovar,
}: Props) {
  const stats = [
    { label: 'Total Clientes', value: clientes.length,                         fgColor: 'var(--primary)', bgColor: 'color-mix(in srgb, var(--primary) 15%, transparent)' },
    { label: 'Activos',        value: totalActivos,                             fgColor: 'var(--green)',   bgColor: 'var(--green-bg)' },
    { label: 'Vencidos',       value: totalVencidos,                            fgColor: '#f87171',        bgColor: 'color-mix(in srgb, #f87171 15%, transparent)' },
    { label: 'Ingresos Mes',   value: formatMoneda(ingresosMes, config.moneda), fgColor: 'var(--accent)',  bgColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' },
  ];

  const proximosAVencer = clientes.filter(c => {
    if (!c.fecha_vencimiento || c.estado_pago !== 'Activo') return false;
    const d = diasRestantes(c.fecha_vencimiento);
    return d >= 0 && d <= 5;
  });

  return (
    <div className="animate-fade-in space-y-6">
      <StatsGrid stats={stats} bgOverride="color-mix(in srgb, var(--primary) 12%, transparent)" />

      <div className="t-card rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="p-4 lg:p-5 flex items-center justify-between t-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-black t-text">💳 Últimos Pagos</h3>
          {config.correo_vencimiento_activo && (
            <button
              onClick={async () => { setEnviandoAvisos(true); await new Promise(r => setTimeout(r, 1500)); setEnviandoAvisos(false); }}
              disabled={enviandoAvisos}
              className="t-btn text-xs px-3 py-2">
              {enviandoAvisos
                ? <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-1" />Enviando...</>
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
              <p className="font-black t-primary text-sm shrink-0">{formatMoneda(p.monto, config.moneda)}</p>
            </div>
          );
        })}
      </div>

      <div className="t-card rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="p-4 lg:p-5 t-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <h3 className="font-black t-text">⚠️ Próximos a Vencer (5 días)</h3>
        </div>
        {proximosAVencer.length === 0
          ? <p className="text-sm t-subtle p-5">Ningún cliente vence en los próximos 5 días. 🎉</p>
          : (
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
                    <button onClick={() => setClienteARenovar(c)}
                      className="t-badge cursor-pointer hover:opacity-80 transition shrink-0">
                      Renovar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )
        }
      </div>
    </div>
  );
}
