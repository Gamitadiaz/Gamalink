"use client";
import { useState, useEffect } from 'react';
import type { Plan, PlanModalMode } from '@/lib/types';

export default function PlanModal({ mode, plan, onClose, onSave }: {
  mode: PlanModalMode; plan: Partial<Plan> | null;
  onClose: () => void; onSave: (data: Partial<Plan>) => Promise<void>;
}) {
  const [form, setForm]       = useState<Partial<Plan>>({ duracion_dias: 30, precio: 0 });
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (plan) setForm(plan); }, [plan]);
  if (!mode) return null;

  const handleSave = async () => { setLoading(true); await onSave(form); setLoading(false); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="t-card rounded-2xl shadow-2xl w-full max-w-sm" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-lg font-black t-text">{mode === 'crear' ? '➕ Nuevo Plan' : '✏️ Editar Plan'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full t-hover t-subtle transition">✕</button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1.5">Nombre del plan</label>
            <input type="text" placeholder="Ej: Mensual, Trimestral..." value={form.nombre || ''}
              onChange={e => setForm({ ...form, nombre: e.target.value })} className="t-input" />
          </div>
          <div>
            <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1.5">Precio</label>
            <input type="number" min="0" value={form.precio || 0}
              onChange={e => setForm({ ...form, precio: parseFloat(e.target.value) })} className="t-input" />
          </div>
          <div>
            <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1.5">Duración (días)</label>
            <input type="number" min="1" value={form.duracion_dias || 30}
              onChange={e => setForm({ ...form, duracion_dias: parseInt(e.target.value) })} className="t-input" />
          </div>
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 t-cancel-btn py-2.5">Cancelar</button>
          <button onClick={handleSave} disabled={loading || !form.nombre} className="flex-1 t-btn py-2.5">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : mode === 'crear' ? 'Crear Plan' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}
