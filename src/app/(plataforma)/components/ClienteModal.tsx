"use client";
import { useState, useEffect } from 'react';
import { Cliente, Plan, ModalMode } from '@/types/demo';
import { hoy, calcularVencimientoPorDias, formatFecha } from '@/lib/demo-utils';

interface Props {
  mode: ModalMode;
  cliente: Partial<Cliente> | null;
  planes: Plan[];
  onClose: () => void;
  onSave: (data: Partial<Cliente>) => Promise<void>;
}

export default function ClienteModal({ mode, cliente, planes, onClose, onSave }: Props) {
  const [form, setForm]       = useState<Partial<Cliente>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (mode === 'crear') setForm({ fecha_inicio: hoy(), estado_pago: 'Activo', plan: planes.find(p => p.activo)?.nombre || '' });
    else if (cliente) setForm(cliente);
  }, [mode, cliente, planes]);

  if (!mode) return null;

  const planData = planes.find(p => p.nombre === form.plan);

  const handleSave = async () => {
    setLoading(true);
    const data = { ...form };
    if (mode === 'crear' && planData && form.fecha_inicio)
      data.fecha_vencimiento = calcularVencimientoPorDias(form.fecha_inicio, planData.duracion_dias);
    await onSave(data);
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="t-card rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <h2 className="text-lg font-black t-text">{mode === 'crear' ? '➕ Nuevo Cliente' : '✏️ Editar Cliente'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full t-hover t-subtle transition">✕</button>
        </div>

        <div className="p-6 space-y-4">
          {[
            { label: 'Nombre completo',     key: 'nombre',   type: 'text',  placeholder: 'Ej: Juan Pérez' },
            { label: 'Teléfono',            key: 'telefono', type: 'tel',   placeholder: 'Ej: 4421234567' },
            { label: 'Correo electrónico',  key: 'correo',   type: 'email', placeholder: 'Ej: juan@correo.com' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1.5">{label}</label>
              <input type={type} placeholder={placeholder} value={(form as Record<string, string>)[key] || ''}
                onChange={e => setForm({ ...form, [key]: e.target.value })} className="t-input" />
            </div>
          ))}

          <div>
            <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1.5">Plan</label>
            <select value={form.plan || ''} onChange={e => setForm({ ...form, plan: e.target.value })} className="t-input">
              <option value="">Seleccionar plan...</option>
              {planes.filter(p => p.activo).map(p => (
                <option key={p.id} value={p.nombre}>{p.nombre} — {p.duracion_dias} días</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1.5">Fecha de inicio</label>
            <input type="date" value={form.fecha_inicio || ''} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })} className="t-input" />
            {planData && form.fecha_inicio && (
              <p className="text-xs t-primary mt-1 font-medium">
                Vence: {formatFecha(calcularVencimientoPorDias(form.fecha_inicio, planData.duracion_dias))}
              </p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1.5">Estado</label>
            <select value={form.estado_pago || 'Activo'} onChange={e => setForm({ ...form, estado_pago: e.target.value })} className="t-input">
              <option value="Activo">Activo</option>
              <option value="Vencido">Vencido</option>
              <option value="Suspendido">Suspendido</option>
            </select>
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 t-cancel-btn py-2.5">Cancelar</button>
          <button onClick={handleSave} disabled={loading || !form.nombre} className="flex-1 t-btn py-2.5">
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : mode === 'crear' ? 'Crear Cliente' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}
