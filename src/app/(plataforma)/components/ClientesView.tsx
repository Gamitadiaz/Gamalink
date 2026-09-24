"use client";
import { Cliente } from '@/types/demo';
import { formatMoneda } from '@/lib/demo-utils';
import BadgeVencimiento from './BadgeVencimiento';

interface Props {
  clientes: Cliente[];
  totalActivos: number;
  totalVencidos: number;
  ingresosMes: number;
  moneda: string;
  busqueda: string;
  filtroEstado: string;
  onBusquedaChange: (v: string) => void;
  onFiltroChange: (v: string) => void;
  onVerHistorial: (c: Cliente) => void;
  onRenovar: (c: Cliente) => void;
  onEditar: (c: Cliente) => void;
  onEliminar: (c: Cliente) => void;
}

const FILTROS = ['Todos', 'Activo', 'Vencido', 'Suspendido'];

export default function ClientesView({
  clientes, totalActivos, totalVencidos, ingresosMes, moneda,
  busqueda, filtroEstado,
  onBusquedaChange, onFiltroChange,
  onVerHistorial, onRenovar, onEditar, onEliminar,
}: Props) {
  const stats = [
    { label: 'Total Clientes', value: clientes.length,                          fgColor: 'var(--primary)', bgColor: 'color-mix(in srgb, var(--primary) 15%, transparent)' },
    { label: 'Activos',        value: totalActivos,                              fgColor: 'var(--green)',   bgColor: 'var(--green-bg)' },
    { label: 'Vencidos',       value: totalVencidos,                             fgColor: '#f87171',        bgColor: 'color-mix(in srgb, #f87171 15%, transparent)' },
    { label: 'Ingresos Mes',   value: formatMoneda(ingresosMes, moneda),         fgColor: 'var(--accent)',  bgColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' },
  ];

  return (
    <div className="animate-fade-in space-y-4">

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <div key={s.label} className="rounded-xl p-3 lg:p-4" style={{ backgroundColor: s.bgColor, border: '1px solid var(--border)' }}>
            <p className="text-xs font-bold t-subtle uppercase tracking-widest">{s.label}</p>
            <p className="text-xl lg:text-2xl font-black mt-1" style={{ color: s.fgColor }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Buscador y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none t-subtle" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input type="text" placeholder="Buscar por nombre, teléfono o correo..." value={busqueda}
            onChange={e => onBusquedaChange(e.target.value)} className="t-input pl-9" />
        </div>
        <div className="flex gap-2">
          {FILTROS.map(f => (
            <button key={f} onClick={() => onFiltroChange(f)}
              className="px-3 py-2 rounded-xl text-xs font-bold transition border whitespace-nowrap"
              style={{
                backgroundColor: filtroEstado === f ? 'var(--primary)' : 'transparent',
                color: filtroEstado === f ? 'var(--primary-fg)' : 'var(--fg-muted)',
                borderColor: filtroEstado === f ? 'var(--primary)' : 'var(--border)',
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla */}
      <div className="t-card rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {clientes.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">🔍</p>
            <p className="t-muted font-medium">No se encontraron clientes</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="t-header" style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Cliente', 'Plan', 'Vencimiento', 'Estado', 'Acciones'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-black t-subtle uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {clientes.map((c, i) => (
                  <tr key={c.id} className="t-hover transition"
                    style={{ borderBottom: i < clientes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <td className="px-4 py-3">
                      <p className="font-bold t-text text-sm">{c.nombre}</p>
                      <p className="text-xs t-subtle">{c.telefono || '—'}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="t-badge">{c.plan || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <BadgeVencimiento fecha={c.fecha_vencimiento} />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[10px] font-black px-2 py-1 rounded-full"
                        style={{
                          backgroundColor: c.estado_pago === 'Activo' ? 'var(--green-bg)' : 'var(--bg-surface)',
                          color: c.estado_pago === 'Activo' ? 'var(--green)' : 'var(--fg-muted)',
                        }}>
                        {c.estado_pago}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => onVerHistorial(c)} title="Historial"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition"
                          style={{ color: 'var(--primary)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--primary) 15%, transparent)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          📋 <span>Ver</span>
                        </button>
                        <button onClick={() => onRenovar(c)} title="Renovar"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition"
                          style={{ color: 'var(--green)' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--green-bg)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          🔄 <span>Renovar</span>
                        </button>
                        <button onClick={() => onEditar(c)} title="Editar"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg t-hover t-muted transition text-xs font-bold">
                          ✏️ <span>Editar</span>
                        </button>
                        <button onClick={() => onEliminar(c)} title="Eliminar"
                          className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition"
                          style={{ color: '#f87171' }}
                          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, #f87171 15%, transparent)')}
                          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                          🗑️ <span>Eliminar</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
