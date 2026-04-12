"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase_config';

// ─── Types ────────────────────────────────────────────────────────────────────
type Cliente = {
  id: number;
  nombre: string;
  telefono: string;
  correo: string;
  estado_pago: string;
  fecha_inicio: string;
  fecha_vencimiento: string;
  plan: string;
};

type Plan = {
  id: number;
  nombre: string;
  precio: number;
  duracion_dias: number;
  activo: boolean;
};

type Pago = {
  id: number;
  cliente_id: number;
  fecha_pago: string;
  monto: number;
  plan: string;
  metodo_pago: string;
  notas: string;
  created_at: string;
};

type Config = {
  id: number;
  nombre_negocio: string;
  moneda: string;
  correo_contacto: string;
  correo_bienvenida_activo: boolean;
  correo_vencimiento_activo: boolean;
};

type ModalMode      = 'crear' | 'editar' | null;
type PlanModalMode  = 'crear' | 'editar' | null;

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hoy(): string {
  return new Date().toISOString().split('T')[0];
}

function calcularVencimientoPorDias(fechaInicio: string, dias: number): string {
  const d = new Date(fechaInicio + 'T00:00:00');
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
}

function diasRestantes(fechaVencimiento: string): number {
  const hoyMs = new Date(hoy() + 'T00:00:00').getTime();
  const vMs   = new Date(fechaVencimiento + 'T00:00:00').getTime();
  return Math.round((vMs - hoyMs) / (1000 * 60 * 60 * 24));
}

function formatMoneda(valor: number, moneda: string): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: moneda === 'USD' ? 'USD' : 'MXN',
    minimumFractionDigits: 0,
  }).format(valor);
}

function formatFecha(fecha: string): string {
  if (!fecha) return '—';
  const [y, m, d] = fecha.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${d} ${meses[parseInt(m) - 1]} ${y}`;
}

// ─── Badge vencimiento ────────────────────────────────────────────────────────
function BadgeVencimiento({ fecha }: { fecha: string }) {
  if (!fecha) return <span className="text-gray-400 text-sm">—</span>;
  const dias = diasRestantes(fecha);
  let color = 'text-green-600 bg-green-50';
  let label = `${dias}d restantes`;
  if (dias < 0)       { color = 'text-red-600 bg-red-50';       label = `Venció hace ${Math.abs(dias)}d`; }
  else if (dias <= 5) { color = 'text-orange-600 bg-orange-50'; label = `${dias}d restantes`; }
  return (
    <div>
      <p className="text-sm text-gray-700">{formatFecha(fecha)}</p>
      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color}`}>{label}</span>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`w-12 h-6 shrink-0 rounded-full relative transition-colors duration-200 cursor-pointer
        ${value ? 'bg-blue-600' : 'bg-gray-300'}`}>
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-200
        ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );
}

// ─── Modal Renovar ────────────────────────────────────────────────────────────
function RenovarModal({ cliente, planes, moneda, onClose, onConfirm }: {
  cliente: Cliente | null;
  planes: Plan[];
  moneda: string;
  onClose: () => void;
  onConfirm: (datos: { plan: string; metodo: string; notas: string }) => Promise<void>;
}) {
  const [plan, setPlan]     = useState('');
  const [metodo, setMetodo] = useState('Efectivo');
  const [notas, setNotas]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente) {
      setPlan(cliente.plan || planes.find(p => p.activo)?.nombre || '');
      setMetodo('Efectivo');
      setNotas('');
    }
  }, [cliente, planes]);

  if (!cliente) return null;

  const planData      = planes.find(p => p.nombre === plan);
  const estaVigente   = cliente.fecha_vencimiento && diasRestantes(cliente.fecha_vencimiento) > 0;
  const baseCalculo   = estaVigente ? cliente.fecha_vencimiento : hoy();
  const nuevaFechaVenc = planData
    ? calcularVencimientoPorDias(baseCalculo, planData.duracion_dias)
    : null;

  const handleConfirm = async () => {
    setLoading(true);
    await onConfirm({ plan, metodo, notas });
    setLoading(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-black text-gray-900">🔄 Renovar Membresía</h2>
            <p className="text-sm text-gray-500 mt-0.5">{cliente.nombre}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition">✕</button>
        </div>

        <div className="p-6 space-y-4">

          {/* Info estado actual */}
          <div className={`rounded-lg px-4 py-3 text-sm font-medium flex items-center gap-2
            ${estaVigente ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
            <span>{estaVigente ? '✅' : '⚠️'}</span>
            <span>
              {estaVigente
                ? `Vigente hasta ${formatFecha(cliente.fecha_vencimiento)} — se extenderá desde ahí`
                : `Vencida — se renovará desde hoy (${formatFecha(hoy())})`}
            </span>
          </div>

          {/* Plan */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Plan</label>
            <select value={plan} onChange={e => setPlan(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
              {planes.filter(p => p.activo).map(p => (
                <option key={p.id} value={p.nombre}>
                  {p.nombre} — {formatMoneda(p.precio, moneda)} / {p.duracion_dias}d
                </option>
              ))}
            </select>
          </div>

          {/* Preview nueva fecha */}
          {nuevaFechaVenc && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-blue-500 text-lg">📅</span>
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Nueva fecha de vencimiento</p>
                <p className="text-sm font-black text-blue-800">{formatFecha(nuevaFechaVenc)}</p>
              </div>
            </div>
          )}

          {/* Método de pago */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Método de pago</label>
            <select value={metodo} onChange={e => setMetodo(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
              {METODOS_PAGO.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Notas (opcional)</label>
            <input type="text" value={notas} onChange={e => setNotas(e.target.value)}
              placeholder="Ej. Pagó en dos partes"
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition">
            Cancelar
          </button>
          <button onClick={handleConfirm} disabled={loading || !plan}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : '✅ Confirmar Renovación'
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Historial ──────────────────────────────────────────────────────────
function HistorialModal({ cliente, pagos, moneda, onClose }: {
  cliente: Cliente | null;
  pagos: Pago[];
  moneda: string;
  onClose: () => void;
}) {
  if (!cliente) return null;

  const pagosSocio = pagos
    .filter(p => p.cliente_id === cliente.id)
    .sort((a, b) => new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime());

  const totalPagado = pagosSocio.reduce((acc, p) => acc + p.monto, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100 shrink-0">
          <div>
            <h2 className="text-lg font-black text-gray-900">📋 Historial de Pagos</h2>
            <p className="text-sm text-gray-500 mt-0.5">{cliente.nombre}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition">✕</button>
        </div>

        {/* Total */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 shrink-0 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Total pagado</p>
            <p className="text-2xl font-black text-gray-900">{formatMoneda(totalPagado, moneda)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Pagos registrados</p>
            <p className="text-2xl font-black text-gray-900">{pagosSocio.length}</p>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto">
          {pagosSocio.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-400">
              <span className="text-4xl mb-3">📭</span>
              <p className="font-semibold">Sin pagos registrados aún</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {pagosSocio.map((pago, i) => (
                <li key={pago.id} className="px-6 py-4 flex items-start gap-4">
                  {/* Número */}
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-600 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
                    {pagosSocio.length - i}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-gray-900 text-sm">{pago.plan}</p>
                      <p className="font-black text-gray-900 text-sm shrink-0">{formatMoneda(pago.monto, moneda)}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-gray-500">{formatFecha(pago.fecha_pago)}</p>
                      <span className="text-gray-300">·</span>
                      <span className="text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">{pago.metodo_pago}</span>
                    </div>
                    {pago.notas && (
                      <p className="text-xs text-gray-400 mt-1 italic">"{pago.notas}"</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 shrink-0">
          <button onClick={onClose} className="w-full border border-gray-200 text-gray-600 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Plan ───────────────────────────────────────────────────────────────
function PlanModal({ mode, plan, onClose, onSave }: {
  mode: PlanModalMode;
  plan: Partial<Plan>;
  onClose: () => void;
  onSave: (data: Partial<Plan>) => Promise<void>;
}) {
  const [form, setForm]       = useState<Partial<Plan>>(plan);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  useEffect(() => { setForm(plan); setError(''); }, [plan]);

  const handleSubmit = async () => {
    if (!form.nombre?.trim()) return setError('El nombre es requerido.');
    if (!form.duracion_dias || form.duracion_dias < 1) return setError('La duración debe ser al menos 1 día.');
    setLoading(true);
    setError('');
    try { await onSave(form); onClose(); }
    catch (e: any) { setError(e.message || 'Ocurrió un error.'); }
    finally { setLoading(false); }
  };

  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-scale-in">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">{mode === 'crear' ? '+ Nuevo Plan' : 'Editar Plan'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg font-medium">{error}</div>}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nombre *</label>
            <input type="text" value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Ej. Plan Ejecutivo" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Precio</label>
              <input type="number" min="0" value={form.precio ?? ''} onChange={e => setForm({ ...form, precio: parseFloat(e.target.value) || 0 })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="0" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Duración (días)</label>
              <input type="number" min="1" value={form.duracion_dias ?? ''} onChange={e => setForm({ ...form, duracion_dias: parseInt(e.target.value) || 30 })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" placeholder="30" />
            </div>
          </div>
          {form.duracion_dias && (
            <p className="text-xs text-gray-400">
              💡 {form.duracion_dias}d ≈ {form.duracion_dias === 7 ? '1 semana' : form.duracion_dias === 30 ? '1 mes' : form.duracion_dias === 365 ? '1 año' : `${Math.round(form.duracion_dias / 30 * 10) / 10} meses`}
            </p>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : mode === 'crear' ? 'Crear' : 'Guardar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Cliente ────────────────────────────────────────────────────────────
function ClienteModal({ mode, cliente, planes, onClose, onSave }: {
  mode: ModalMode;
  cliente: Partial<Cliente>;
  planes: Plan[];
  onClose: () => void;
  onSave: (data: Partial<Cliente>) => Promise<void>;
}) {
  const [form, setForm]       = useState<Partial<Cliente>>(cliente);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const planData          = planes.find(p => p.nombre === form.plan);
  const vencimientoPreview = form.fecha_inicio && planData
    ? calcularVencimientoPorDias(form.fecha_inicio, planData.duracion_dias)
    : null;

  useEffect(() => { setForm(cliente); setError(''); }, [cliente]);

  const handleSubmit = async () => {
    if (!form.nombre?.trim()) return setError('El nombre es requerido.');
    setLoading(true); setError('');
    try { await onSave(form); onClose(); }
    catch (e: any) { setError(e.message || 'Ocurrió un error.'); }
    finally { setLoading(false); }
  };

  if (!mode) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-black text-gray-900">{mode === 'crear' ? '+ Nuevo Socio' : 'Editar Socio'}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 text-gray-400 transition">✕</button>
        </div>
        <div className="p-6 space-y-4">
          {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg font-medium">{error}</div>}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nombre completo *</label>
            <input type="text" value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Ej. Carlos Mendoza" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Teléfono</label>
              <input type="tel" value={form.telefono || ''} onChange={e => setForm({ ...form, telefono: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="4421234567" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Correo</label>
              <input type="email" value={form.correo || ''} onChange={e => setForm({ ...form, correo: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder="correo@gmail.com" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Plan</label>
              <select value={form.plan || ''} onChange={e => setForm({ ...form, plan: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                <option value="">Seleccionar...</option>
                {planes.filter(p => p.activo).map(p => <option key={p.id} value={p.nombre}>{p.nombre}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Estado</label>
              <select value={form.estado_pago || 'Activo'} onChange={e => setForm({ ...form, estado_pago: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition bg-white">
                <option>Activo</option>
                <option>Vencido</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Fecha de inicio del pago</label>
            <input type="date" value={form.fecha_inicio || ''} onChange={e => setForm({ ...form, fecha_inicio: e.target.value })}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
          </div>
          {vencimientoPreview && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 flex items-center gap-3">
              <span className="text-blue-500 text-lg">📅</span>
              <div>
                <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Vencimiento calculado</p>
                <p className="text-sm font-black text-blue-800">{formatFecha(vencimientoPreview)}
                  {planData && <span className="font-normal text-blue-500 ml-2">({planData.duracion_dias}d)</span>}
                </p>
              </div>
            </div>
          )}
        </div>
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition">Cancelar</button>
          <button onClick={handleSubmit} disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : mode === 'crear' ? 'Crear Socio' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Eliminar ───────────────────────────────────────────────────────────
function DeleteModal({ cliente, onClose, onConfirm }: {
  cliente: Cliente | null;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  if (!cliente) return null;
  const handleConfirm = async () => { setLoading(true); await onConfirm(); setLoading(false); onClose(); };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-scale-in">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-2xl">🗑️</span></div>
        <h2 className="text-lg font-black text-center text-gray-900 mb-1">¿Eliminar socio?</h2>
        <p className="text-sm text-center text-gray-500 mb-6">
          Esto eliminará permanentemente a <span className="font-bold text-gray-800">{cliente.nombre}</span> y todo su historial de pagos.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-lg font-bold text-sm hover:bg-gray-50 transition">Cancelar</button>
          <button onClick={handleConfirm} disabled={loading}
            className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold text-sm hover:bg-red-700 transition disabled:opacity-60 flex items-center justify-center">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function DemoAdminPremium() {
  const router = useRouter();

  const [authLoading, setAuthLoading]     = useState(true);
  const [vistaActual, setVistaActual]     = useState('socios');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [planes, setPlanes]     = useState<Plan[]>([]);
  const [pagos, setPagos]       = useState<Pago[]>([]);
  const [config, setConfig]     = useState<Config>({
    id: 1, nombre_negocio: 'Mi Negocio', moneda: 'MXN',
    correo_contacto: '', correo_bienvenida_activo: false, correo_vencimiento_activo: false,
  });
  const [configDraft, setConfigDraft]     = useState<Config>(config);
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaved, setConfigSaved]     = useState(false);
  const [dataLoading, setDataLoading]     = useState(false);
  const [busqueda, setBusqueda]           = useState('');

  // Modales
  const [modalMode, setModalMode]                         = useState<ModalMode>(null);
  const [clienteSeleccionado, setClienteSeleccionado]     = useState<Partial<Cliente>>({});
  const [clienteAEliminar, setClienteAEliminar]           = useState<Cliente | null>(null);
  const [clienteARenovar, setClienteARenovar]             = useState<Cliente | null>(null);
  const [clienteHistorial, setClienteHistorial]           = useState<Cliente | null>(null);
  const [planModalMode, setPlanModalMode]                 = useState<PlanModalMode>(null);
  const [planSeleccionado, setPlanSeleccionado]           = useState<Partial<Plan>>({});

  // Toast
  const [toast, setToast] = useState<{ msg: string; tipo: 'ok' | 'error' } | null>(null);
  const showToast = (msg: string, tipo: 'ok' | 'error' = 'ok') => {
    setToast({ msg, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  // ── Auth ──
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/demo_admin/login');
      else setAuthLoading(false);
    };
    checkUser();
  }, [router]);

  // ── Fetch ──
  const fetchClientes = useCallback(async () => {
    setDataLoading(true);
    const { data, error } = await supabase.from('clientes').select('*').order('id', { ascending: false });
    if (!error && data) setClientes(data);
    setDataLoading(false);
  }, []);

  const fetchPlanes = useCallback(async () => {
    const { data } = await supabase.from('planes').select('*').order('id');
    if (data) setPlanes(data);
  }, []);

  const fetchPagos = useCallback(async () => {
    const { data } = await supabase.from('pagos').select('*').order('fecha_pago', { ascending: false });
    if (data) setPagos(data);
  }, []);

  const fetchConfig = useCallback(async () => {
    const { data } = await supabase.from('configuracion').select('*').limit(1).single();
    if (data) { setConfig(data); setConfigDraft(data); }
  }, []);

  useEffect(() => {
    if (!authLoading) {
      fetchClientes();
      fetchPlanes();
      fetchPagos();
      fetchConfig();
    }
  }, [authLoading, fetchClientes, fetchPlanes, fetchPagos, fetchConfig]);

  // ── Enviar correo ──
  const enviarCorreo = async (tipo: 'bienvenida' | 'vencimiento', cliente: Cliente, diasRestantesVal = 0) => {
    try {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, cliente: { ...cliente, dias_restantes: diasRestantesVal }, config }),
      });
    } catch (e) { console.error('Error correo:', e); }
  };

  // ── CRUD Clientes ──
  const handleCrear = async (form: Partial<Cliente>) => {
    const fechaInicio = form.fecha_inicio || hoy();
    const planData    = planes.find(p => p.nombre === form.plan);
    const fechaVenc   = calcularVencimientoPorDias(fechaInicio, planData?.duracion_dias || 30);
    const { data, error } = await supabase.from('clientes').insert([{
      nombre: form.nombre, telefono: form.telefono || null, correo: form.correo || null,
      estado_pago: form.estado_pago || 'Activo', plan: form.plan || '',
      fecha_inicio: fechaInicio, fecha_vencimiento: fechaVenc,
    }]).select().single();
    if (error) throw new Error(error.message);

    // Registrar pago inicial
    if (planData && data) {
      await supabase.from('pagos').insert([{
        cliente_id: data.id, fecha_pago: fechaInicio,
        monto: planData.precio, plan: form.plan, metodo_pago: 'Efectivo', notas: 'Pago inicial',
      }]);
      await fetchPagos();
    }

    if (config.correo_bienvenida_activo && data?.correo) await enviarCorreo('bienvenida', data);
    await fetchClientes();
  };

  const handleEditar = async (form: Partial<Cliente>) => {
    const fechaInicio = form.fecha_inicio || hoy();
    const planData    = planes.find(p => p.nombre === form.plan);
    const fechaVenc   = calcularVencimientoPorDias(fechaInicio, planData?.duracion_dias || 30);
    const { error }   = await supabase.from('clientes').update({
      nombre: form.nombre, telefono: form.telefono || null, correo: form.correo || null,
      estado_pago: form.estado_pago, plan: form.plan,
      fecha_inicio: fechaInicio, fecha_vencimiento: fechaVenc,
    }).eq('id', form.id);
    if (error) throw new Error(error.message);
    await fetchClientes();
  };

  const handleEliminar = async () => {
    if (!clienteAEliminar) return;
    await supabase.from('clientes').delete().eq('id', clienteAEliminar.id);
    await fetchClientes();
    await fetchPagos();
  };

  const toggleEstado = async (cliente: Cliente) => {
    const nuevoEstado = cliente.estado_pago === 'Activo' ? 'Vencido' : 'Activo';
    await supabase.from('clientes').update({ estado_pago: nuevoEstado }).eq('id', cliente.id);
    setClientes(prev => prev.map(c => c.id === cliente.id ? { ...c, estado_pago: nuevoEstado } : c));
  };

  // ── Renovar ──
  const handleRenovar = async ({ plan, metodo, notas }: { plan: string; metodo: string; notas: string }) => {
    if (!clienteARenovar) return;

    const planData    = planes.find(p => p.nombre === plan);
    const duracion    = planData?.duracion_dias || 30;
    const estaVigente = clienteARenovar.fecha_vencimiento && diasRestantes(clienteARenovar.fecha_vencimiento) > 0;
    const baseCalculo = estaVigente ? clienteARenovar.fecha_vencimiento : hoy();
    const nuevaFechaVenc = calcularVencimientoPorDias(baseCalculo, duracion);

    // Actualizar cliente
    const { error } = await supabase.from('clientes').update({
      plan,
      fecha_inicio:      hoy(),
      fecha_vencimiento: nuevaFechaVenc,
      estado_pago:       'Activo',
    }).eq('id', clienteARenovar.id);

    if (error) { showToast('Error al renovar.', 'error'); return; }

    // Registrar pago
    await supabase.from('pagos').insert([{
      cliente_id:  clienteARenovar.id,
      fecha_pago:  hoy(),
      monto:       planData?.precio || 0,
      plan,
      metodo_pago: metodo,
      notas:       notas || null,
    }]);

    await fetchClientes();
    await fetchPagos();
    showToast(`✅ Membresía de ${clienteARenovar.nombre} renovada hasta ${formatFecha(nuevaFechaVenc)}`);
  };

  // ── CRUD Planes ──
  const handleCrearPlan = async (form: Partial<Plan>) => {
    const { error } = await supabase.from('planes').insert([{ nombre: form.nombre, precio: form.precio || 0, duracion_dias: form.duracion_dias || 30, activo: true }]);
    if (error) throw new Error(error.message);
    await fetchPlanes();
  };

  const handleEditarPlan = async (form: Partial<Plan>) => {
    const { error } = await supabase.from('planes').update({ nombre: form.nombre, precio: form.precio || 0, duracion_dias: form.duracion_dias || 30 }).eq('id', form.id);
    if (error) throw new Error(error.message);
    await fetchPlanes();
  };

  const togglePlanActivo = async (plan: Plan) => {
    await supabase.from('planes').update({ activo: !plan.activo }).eq('id', plan.id);
    setPlanes(prev => prev.map(p => p.id === plan.id ? { ...p, activo: !p.activo } : p));
  };

  const eliminarPlan = async (id: number) => {
    await supabase.from('planes').delete().eq('id', id);
    await fetchPlanes();
  };

  // ── Config ──
  const guardarConfig = async () => {
    setConfigLoading(true);
    const { error } = await supabase.from('configuracion').update({
      nombre_negocio: configDraft.nombre_negocio, moneda: configDraft.moneda,
      correo_contacto: configDraft.correo_contacto,
      correo_bienvenida_activo: configDraft.correo_bienvenida_activo,
      correo_vencimiento_activo: configDraft.correo_vencimiento_activo,
    }).eq('id', config.id);
    if (error) { showToast('Error al guardar.', 'error'); }
    else { setConfig(configDraft); setConfigSaved(true); setTimeout(() => setConfigSaved(false), 2500); showToast('Configuración guardada.'); }
    setConfigLoading(false);
  };

  const enviarAvisosVencimiento = async () => {
    const lista = clientes.filter(c => {
      if (!c.fecha_vencimiento || c.estado_pago !== 'Activo' || !c.correo) return false;
      const d = diasRestantes(c.fecha_vencimiento);
      return d >= 0 && d <= 3;
    });
    if (lista.length === 0) { showToast('No hay socios con correo que venzan en 3 días.', 'error'); return; }
    for (const c of lista) await enviarCorreo('vencimiento', c, diasRestantes(c.fecha_vencimiento));
    showToast(`✅ ${lista.length} aviso(s) enviados.`);
  };

  // ── Computed ──
  const clientesFiltrados = clientes.filter(c => c.nombre?.toLowerCase().includes(busqueda.toLowerCase()));
  const totalActivos   = clientes.filter(c => c.estado_pago === 'Activo').length;
  const totalVencidos  = clientes.filter(c => c.estado_pago === 'Vencido').length;
  const porVencer      = clientes.filter(c => { if (!c.fecha_vencimiento || c.estado_pago !== 'Activo') return false; const d = diasRestantes(c.fecha_vencimiento); return d >= 0 && d <= 5; }).length;
  const ingresosEstimados = clientes.filter(c => c.estado_pago === 'Activo').reduce((acc, c) => acc + (planes.find(p => p.nombre === c.plan)?.precio || 0), 0);

  // Ingresos reales del mes actual desde tabla pagos
  const mesActual = new Date().toISOString().slice(0, 7); // "2026-04"
  const ingresosMes = pagos.filter(p => p.fecha_pago.startsWith(mesActual)).reduce((acc, p) => acc + p.monto, 0);

  const abrirModalCrear = () => {
    const primerPlan = planes.find(p => p.activo);
    setClienteSeleccionado({ plan: primerPlan?.nombre || '', estado_pago: 'Activo', fecha_inicio: hoy() });
    setModalMode('crear');
  };

  if (authLoading) return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-gray-900 text-white">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
      <p className="font-bold tracking-widest uppercase">Cargando Sistema...</p>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes scale-in { from{opacity:0;transform:scale(0.95)} to{opacity:1;transform:scale(1)} }
        .animate-scale-in { animation: scale-in 0.15s ease-out both; }
        @keyframes fade-in { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:translateY(0)} }
        .animate-fade-in { animation: fade-in 0.2s ease-out both; }
        @keyframes slide-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .animate-slide-up { animation: slide-up 0.3s ease-out both; }
      `}</style>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl font-semibold text-sm animate-slide-up
          ${toast.tipo === 'ok' ? 'bg-gray-900 text-white' : 'bg-red-600 text-white'}`}>
          {toast.msg}
        </div>
      )}

      <div className="flex h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">

        {/* ── SIDEBAR ── */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0`}>
          <div className="h-16 flex items-center justify-between px-6 border-b border-gray-800">
            <div className="flex items-center min-w-0">
              <svg className="w-7 h-7 text-blue-500 mr-2 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <div className="min-w-0">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-widest">Socios</p>
                <p className="text-sm font-black text-white truncate">{config.nombre_negocio}</p>
              </div>
            </div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 ml-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <nav className="p-4 space-y-2">
            {['socios','reportes','configuracion'].map(item => (
              <button key={item} onClick={() => { setVistaActual(item); setIsSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold capitalize transition
                  ${vistaActual === item ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
                {item === 'socios' && '👥 Socios'}
                {item === 'reportes' && '📊 Reportes'}
                {item === 'configuracion' && '⚙️ Config'}
              </button>
            ))}
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/demo_admin/login'); }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-red-400 hover:bg-red-900/20 mt-10 transition">
              🚪 Cerrar Sesión
            </button>
          </nav>
        </aside>

        {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black/50 z-40 lg:hidden" />}

        {/* ── MAIN ── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 lg:px-8 shrink-0">
            <div className="flex items-center gap-4">
              <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-gray-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <div>
                <h2 className="text-base lg:text-lg font-black text-gray-800 capitalize leading-tight">{vistaActual}</h2>
                <p className="text-xs text-gray-400 leading-tight">{config.nombre_negocio}</p>
              </div>
            </div>
            <div className="w-9 h-9 bg-blue-500 rounded-full flex items-center justify-center text-white font-black text-sm">
              {config.nombre_negocio.charAt(0).toUpperCase()}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto p-4 lg:p-8">

            {/* ══════════════ SOCIOS ══════════════ */}
            {vistaActual === 'socios' && (
              <div className="animate-fade-in">
                {/* KPIs */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Total', value: clientes.length, color: '' },
                    { label: 'Activos', value: totalActivos, color: 'text-green-600' },
                    { label: 'Vencidos', value: totalVencidos, color: 'text-red-500' },
                    { label: 'Por vencer', value: porVencer, color: 'text-orange-500', sub: 'en 5 días' },
                  ].map(kpi => (
                    <div key={kpi.label} className="bg-white p-4 lg:p-6 rounded-xl shadow-sm border border-gray-100">
                      <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{kpi.label}</p>
                      <p className={`text-2xl lg:text-3xl font-black ${kpi.color}`}>{kpi.value}</p>
                      {kpi.sub && <p className="text-[10px] text-gray-400">{kpi.sub}</p>}
                    </div>
                  ))}
                </div>

                {/* Tabla */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-xs">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input type="text" placeholder="Buscar socio..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                    </div>
                    <button onClick={abrirModalCrear}
                      className="bg-blue-600 text-white text-sm px-4 py-2 rounded-lg font-bold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition whitespace-nowrap">
                      + Nuevo Socio
                    </button>
                  </div>

                  {dataLoading ? (
                    <div className="flex items-center justify-center py-16 text-gray-400">
                      <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
                      Cargando socios...
                    </div>
                  ) : clientesFiltrados.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                      <span className="text-4xl mb-3">👥</span>
                      <p className="font-semibold">{busqueda ? 'Sin resultados' : 'Aún no hay socios'}</p>
                      {!busqueda && <button onClick={abrirModalCrear} className="mt-4 text-blue-600 font-bold text-sm hover:underline">Agregar el primero</button>}
                    </div>
                  ) : (
                    <>
                      {/* Mobile */}
                      <div className="md:hidden divide-y divide-gray-100">
                        {clientesFiltrados.map(c => (
                          <div key={c.id} className="p-4 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-bold text-gray-900">{c.nombre}</p>
                                <p className="text-xs text-gray-500">{c.plan} · {c.telefono || 'Sin tel.'}</p>
                              </div>
                              <button onClick={() => toggleEstado(c)}
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold cursor-pointer transition
                                  ${c.estado_pago === 'Activo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                {c.estado_pago}
                              </button>
                            </div>
                            <BadgeVencimiento fecha={c.fecha_vencimiento} />
                            <div className="flex gap-3 pt-1">
                              <button onClick={() => setClienteARenovar(c)} className="text-blue-600 font-bold text-xs hover:underline">🔄 Renovar</button>
                              <button onClick={() => setClienteHistorial(c)} className="text-gray-500 font-bold text-xs hover:underline">📋 Historial</button>
                              <button onClick={() => { setClienteSeleccionado(c); setModalMode('editar'); }} className="text-gray-500 font-bold text-xs hover:underline">Editar</button>
                              <button onClick={() => setClienteAEliminar(c)} className="text-red-500 font-bold text-xs hover:underline">Eliminar</button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Desktop */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="w-full text-left">
                          <thead className="bg-gray-50 text-xs text-gray-400 uppercase">
                            <tr>
                              <th className="px-5 py-4">Socio</th>
                              <th className="px-5 py-4">Plan</th>
                              <th className="px-5 py-4">Estado</th>
                              <th className="px-5 py-4">Inicio</th>
                              <th className="px-5 py-4">Vencimiento</th>
                              <th className="px-5 py-4">Pagos</th>
                              <th className="px-5 py-4 text-right">Acciones</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100 text-sm">
                            {clientesFiltrados.map(c => {
                              const numPagos = pagos.filter(p => p.cliente_id === c.id).length;
                              return (
                                <tr key={c.id} className="hover:bg-gray-50 transition">
                                  <td className="px-5 py-4">
                                    <p className="font-bold text-gray-900">{c.nombre}</p>
                                    {c.correo && <p className="text-xs text-gray-400">{c.correo}</p>}
                                  </td>
                                  <td className="px-5 py-4 text-gray-600 text-sm">{c.plan || '—'}</td>
                                  <td className="px-5 py-4">
                                    <button onClick={() => toggleEstado(c)} title="Clic para cambiar"
                                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold cursor-pointer transition
                                        ${c.estado_pago === 'Activo' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                                      {c.estado_pago}
                                    </button>
                                  </td>
                                  <td className="px-5 py-4 text-gray-500 text-sm">{formatFecha(c.fecha_inicio)}</td>
                                  <td className="px-5 py-4"><BadgeVencimiento fecha={c.fecha_vencimiento} /></td>
                                  <td className="px-5 py-4">
                                    <button onClick={() => setClienteHistorial(c)}
                                      className="flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-blue-600 transition">
                                      <span className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-black">{numPagos}</span>
                                      ver
                                    </button>
                                  </td>
                                  <td className="px-5 py-4">
                                    <div className="flex items-center justify-end gap-2">
                                      <button onClick={() => setClienteARenovar(c)}
                                        className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1 rounded-lg text-xs font-bold transition">
                                        🔄 Renovar
                                      </button>
                                      <button onClick={() => { setClienteSeleccionado(c); setModalMode('editar'); }}
                                        className="text-gray-500 font-bold text-xs hover:underline">Editar</button>
                                      <button onClick={() => setClienteAEliminar(c)}
                                        className="text-red-500 font-bold text-xs hover:underline">Eliminar</button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}

                  {!dataLoading && clientesFiltrados.length > 0 && (
                    <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
                      {clientesFiltrados.length} socio{clientesFiltrados.length !== 1 ? 's' : ''} encontrado{clientesFiltrados.length !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ══════════════ REPORTES ══════════════ */}
            {vistaActual === 'reportes' && (
              <div className="animate-fade-in space-y-6">

                {/* KPIs financieros */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-6 rounded-xl text-white shadow-lg shadow-blue-600/20">
                    <p className="text-blue-200 text-xs font-bold uppercase tracking-widest mb-1">Ingresos este mes</p>
                    <p className="text-4xl font-black">{formatMoneda(ingresosMes, config.moneda)}</p>
                    <p className="text-blue-300 text-sm mt-1">pagos registrados en {new Date().toLocaleString('es-MX', { month: 'long' })}</p>
                  </div>
                  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                    <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-1">Estimado mensual recurrente</p>
                    <p className="text-4xl font-black text-gray-900">{formatMoneda(ingresosEstimados, config.moneda)}</p>
                    <p className="text-gray-400 text-sm mt-1">{totalActivos} socios activos</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Distribución por plan */}
                  <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-800 mb-4">Distribución por Plan</h3>
                    <div className="space-y-3">
                      {planes.map(plan => {
                        const count = clientes.filter(c => c.plan === plan.nombre).length;
                        const pct   = clientes.length ? Math.round((count / clientes.length) * 100) : 0;
                        return (
                          <div key={plan.id}>
                            <div className="flex justify-between text-sm mb-1">
                              <span className="font-semibold text-gray-700">{plan.nombre}</span>
                              <span className="text-gray-500">{count} ({pct}%)</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ingresos por plan */}
                  <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-100 shadow-sm">
                    <h3 className="text-base font-bold text-gray-800 mb-4">Ingresos por Plan (activos)</h3>
                    <div className="space-y-3">
                      {planes.filter(p => p.precio > 0).map(plan => {
                        const activos  = clientes.filter(c => c.plan === plan.nombre && c.estado_pago === 'Activo').length;
                        const subtotal = plan.precio * activos;
                        const pct      = ingresosEstimados ? Math.round((subtotal / ingresosEstimados) * 100) : 0;
                        return (
                          <div key={plan.id} className="flex items-center gap-3">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm mb-1">
                                <span className="font-semibold text-gray-700">{plan.nombre} × {activos}</span>
                                <span className="font-bold text-gray-900">{formatMoneda(subtotal, config.moneda)}</span>
                              </div>
                              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-green-500 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Últimos pagos */}
                <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-base font-bold text-gray-800 mb-4">💳 Últimos Pagos Registrados</h3>
                  {pagos.length === 0 ? (
                    <p className="text-sm text-gray-400">Aún no hay pagos registrados.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {pagos.slice(0, 8).map(pago => {
                        const socio = clientes.find(c => c.id === pago.cliente_id);
                        return (
                          <li key={pago.id} className="py-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-black text-xs shrink-0">↓</div>
                              <div className="min-w-0">
                                <p className="font-semibold text-gray-800 text-sm truncate">{socio?.nombre || 'Socio eliminado'}</p>
                                <p className="text-xs text-gray-400">{pago.plan} · {formatFecha(pago.fecha_pago)} · {pago.metodo_pago}</p>
                              </div>
                            </div>
                            <span className="font-black text-gray-900 text-sm shrink-0">+{formatMoneda(pago.monto, config.moneda)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Próximos a vencer */}
                <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-800">⚠️ Próximos a vencer (5 días)</h3>
                    {config.correo_vencimiento_activo && (
                      <button onClick={enviarAvisosVencimiento}
                        className="text-xs bg-orange-100 text-orange-700 font-bold px-3 py-1.5 rounded-lg hover:bg-orange-200 transition">
                        📧 Enviar avisos
                      </button>
                    )}
                  </div>
                  {(() => {
                    const lista = clientes.filter(c => {
                      if (!c.fecha_vencimiento || c.estado_pago !== 'Activo') return false;
                      const d = diasRestantes(c.fecha_vencimiento);
                      return d >= 0 && d <= 5;
                    });
                    return lista.length === 0
                      ? <p className="text-sm text-gray-400">Ningún socio vence en los próximos 5 días. 🎉</p>
                      : (
                        <ul className="divide-y divide-gray-100">
                          {lista.map(c => (
                            <li key={c.id} className="py-3 flex justify-between items-center gap-4">
                              <div>
                                <p className="font-bold text-gray-800">{c.nombre}</p>
                                <p className="text-xs text-gray-500">{c.plan}{c.correo ? ` · ${c.correo}` : ' · sin correo'}</p>
                              </div>
                              <div className="flex items-center gap-3">
                                <BadgeVencimiento fecha={c.fecha_vencimiento} />
                                <button onClick={() => setClienteARenovar(c)}
                                  className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0">
                                  Renovar
                                </button>
                              </div>
                            </li>
                          ))}
                        </ul>
                      );
                  })()}
                </div>
              </div>
            )}

            {/* ══════════════ CONFIG ══════════════ */}
            {vistaActual === 'configuracion' && (
              <div className="animate-fade-in space-y-6">

                {/* Datos negocio */}
                <div className="bg-white p-4 lg:p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-800 mb-4">🏢 Datos del Negocio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Nombre del Negocio</label>
                      <input type="text" value={configDraft.nombre_negocio} onChange={e => setConfigDraft({ ...configDraft, nombre_negocio: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                      <p className="text-xs text-gray-400 mt-1">Aparece en el panel y en los correos enviados.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Moneda</label>
                      <select value={configDraft.moneda} onChange={e => setConfigDraft({ ...configDraft, moneda: e.target.value })}
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition">
                        <option value="MXN">MXN — Pesos Mexicanos</option>
                        <option value="USD">USD — Dólares</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Correo de contacto</label>
                      <input type="email" value={configDraft.correo_contacto || ''} onChange={e => setConfigDraft({ ...configDraft, correo_contacto: e.target.value })}
                        placeholder="contacto@tunegocio.com"
                        className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                      <p className="text-xs text-gray-400 mt-1">Los socios pueden responder a este correo cuando reciban notificaciones.</p>
                    </div>
                  </div>
                </div>

                {/* Correos automáticos */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 lg:p-6 border-b border-gray-100 bg-gray-50/50">
                    <h3 className="text-lg font-bold text-gray-800">📧 Correos Automáticos</h3>
                    <p className="text-sm text-gray-500">Solo se envían a socios con correo registrado.</p>
                  </div>
                  <div className="p-4 lg:p-6 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">Correo de Bienvenida</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Se envía al registrar un nuevo socio con correo.</p>
                      </div>
                      <Toggle value={configDraft.correo_bienvenida_activo} onChange={v => setConfigDraft({ ...configDraft, correo_bienvenida_activo: v })} />
                    </div>
                    <div className="flex items-start justify-between gap-4 border-t border-gray-100 pt-5">
                      <div>
                        <h4 className="font-bold text-gray-800 text-sm">Aviso de Vencimiento</h4>
                        <p className="text-xs text-gray-500 mt-0.5">Activa el botón de avisos en Reportes (socios que vencen en 3 días).</p>
                      </div>
                      <Toggle value={configDraft.correo_vencimiento_activo} onChange={v => setConfigDraft({ ...configDraft, correo_vencimiento_activo: v })} />
                    </div>
                  </div>
                </div>

                {/* Planes */}
                <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
                  <div className="p-4 lg:p-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800">💳 Planes de Membresía</h3>
                      <p className="text-sm text-gray-500">Los precios se reflejan en los reportes de ingresos.</p>
                    </div>
                    <button onClick={() => { setPlanSeleccionado({ duracion_dias: 30, precio: 0 }); setPlanModalMode('crear'); }}
                      className="bg-blue-600 text-white text-xs px-3 py-2 rounded-lg font-bold hover:bg-blue-700 transition whitespace-nowrap">
                      + Nuevo Plan
                    </button>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {planes.length === 0 ? (
                      <p className="p-6 text-sm text-gray-400 text-center">No hay planes creados.</p>
                    ) : planes.map(plan => (
                      <div key={plan.id} className={`p-4 lg:p-5 flex items-center gap-4 transition ${!plan.activo ? 'opacity-50' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-gray-900 text-sm">{plan.nombre}</p>
                            {!plan.activo && <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full font-bold">Inactivo</span>}
                          </div>
                          <p className="text-xs text-gray-500 mt-0.5">{formatMoneda(plan.precio, config.moneda)} · {plan.duracion_dias} días</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => { setPlanSeleccionado(plan); setPlanModalMode('editar'); }} className="text-xs text-blue-600 font-bold hover:underline">Editar</button>
                          <button onClick={() => togglePlanActivo(plan)} className="text-xs text-gray-500 font-bold hover:underline">{plan.activo ? 'Desactivar' : 'Activar'}</button>
                          <button onClick={() => eliminarPlan(plan.id)} className="text-xs text-red-500 font-bold hover:underline">Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={guardarConfig} disabled={configLoading}
                    className="bg-gray-900 text-white px-8 py-3 rounded-lg font-bold hover:bg-black transition disabled:opacity-60 flex items-center gap-2">
                    {configLoading
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : configSaved ? '✅ Guardado' : 'Guardar Cambios'
                    }
                  </button>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Modales ── */}
      <ClienteModal mode={modalMode} cliente={clienteSeleccionado} planes={planes}
        onClose={() => setModalMode(null)}
        onSave={modalMode === 'crear' ? handleCrear : handleEditar} />

      <DeleteModal cliente={clienteAEliminar}
        onClose={() => setClienteAEliminar(null)}
        onConfirm={handleEliminar} />

      <RenovarModal cliente={clienteARenovar} planes={planes} moneda={config.moneda}
        onClose={() => setClienteARenovar(null)}
        onConfirm={handleRenovar} />

      <HistorialModal cliente={clienteHistorial} pagos={pagos} moneda={config.moneda}
        onClose={() => setClienteHistorial(null)} />

      <PlanModal mode={planModalMode} plan={planSeleccionado}
        onClose={() => setPlanModalMode(null)}
        onSave={planModalMode === 'crear' ? handleCrearPlan : handleEditarPlan} />
    </>
  );
}
