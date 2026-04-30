"use client";
import { useState, useEffect } from 'react';
import { hoy, calcularVencimientoPorDias, calcularBaseRenovacion, formatMoneda, formatFecha } from '@/lib/helpers';
import { METODOS_PAGO } from '@/lib/types';
import type { Cliente, Plan } from '@/lib/types';

export default function RenovarModal({ cliente, planes, moneda, onClose, onConfirm }: {
  cliente: Cliente | null; planes: Plan[]; moneda: string;
  onClose: () => void; onConfirm: (datos: { plan: string; metodo: string; notas: string }) => Promise<void>;
}) {
  const [plan, setPlan]       = useState('');
  const [metodo, setMetodo]   = useState('Efectivo');
  const [notas, setNotas]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente) { setPlan(cliente.plan || planes.find(p => p.activo)?.nombre || ''); setMetodo('Efectivo'); setNotas(''); }
  }, [cliente, planes]);

  if (!cliente) return null;
  const planData       = planes.find(p => p.nombre === plan);
  const base           = calcularBaseRenovacion(cliente.fecha_vencimiento);
  const estaVigente    = base !== hoy();
  const nuevaFechaVenc = planData ? calcularVencimientoPorDias(base, planData.duracion_dias) : null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm({ plan, metodo, notas });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="t-card rounded-2xl shadow-2xl w-full max-w-md" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-lg font-black t-text">🔄 Renovar Membresía</h2>
            <p className="text-sm t-muted mt-0.5">{cliente.nombre}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full t-hover t-subtle transition">✕</button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-2">Plan</label>
            <div className="grid grid-cols-2 gap-2">
              {planes.filter(p => p.activo).map(p => (
                <button key={p.id} onClick={() => setPlan(p.nombre)}
                  className="p-3 rounded-xl border-2 text-left transition"
                  style={{
                    borderColor: plan === p.nombre ? 'var(--primary)' : 'var(--border)',
                    backgroundColor: plan === p.nombre ? 'color-mix(in srgb, var(--primary) 18%, transparent)' : 'var(--bg-surface)',
                  }}>
                  <p className="font-bold text-sm" style={{ color: plan === p.nombre ? 'var(--primary)' : 'var(--fg)' }}>{p.nombre}</p>
                  <p className="text-xs t-subtle">{formatMoneda(p.precio, moneda)} · {p.duracion_dias}d</p>
                </button>
              ))}
            </div>
          </div>

          {nuevaFechaVenc && (
            <div className="rounded-xl p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
              <p className="text-xs t-primary font-bold uppercase tracking-widest">Nueva fecha de vencimiento</p>
              <p className="text-lg font-black t-primary mt-0.5">{formatFecha(nuevaFechaVenc)}</p>
              {estaVigente && <p className="text-xs t-muted mt-0.5">Se extiende desde el vencimiento actual</p>}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-2">Método de Pago</label>
            <div className="flex flex-wrap gap-2">
              {METODOS_PAGO.map(m => (
                <button key={m} onClick={() => setMetodo(m)}
                  className="px-3 py-1.5 rounded-lg text-sm font-bold transition border"
                  style={{
                    backgroundColor: metodo === m ? 'var(--primary)' : 'transparent',
                    color: metodo === m ? 'var(--primary-fg)' : 'var(--fg-muted)',
                    borderColor: metodo === m ? 'var(--primary)' : 'var(--border)',
                  }}>
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-2">Notas (opcional)</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
              placeholder="Ej: Pagó en efectivo, dio $500..."
              className="t-input resize-none" />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 t-cancel-btn py-2.5">Cancelar</button>
          <button onClick={handleConfirm} disabled={!plan || loading} className="flex-1 t-btn py-2.5">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '✅ Confirmar Renovación'}
          </button>
        </div>
      </div>
    </div>
  );
}
