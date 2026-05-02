"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase_config';
import ConfigThemeSelector from '@/components/ConfigThemeSelector';

// ─── Types ────────────────────────────────────────────────────────────────────
type Cliente = {
  id: number; nombre: string; telefono: string; correo: string;
  estado_pago: string; fecha_inicio: string; fecha_vencimiento: string; plan: string;
};
type Plan    = { id: number; nombre: string; precio: number; duracion_dias: number; activo: boolean; };
type Pago    = { id: number; cliente_id: number; fecha_pago: string; monto: number; plan: string; metodo_pago: string; notas: string; created_at: string; };
type Config  = { id: number; nombre_negocio: string; moneda: string; correo_contacto: string; correo_bienvenida_activo: boolean; correo_vencimiento_activo: boolean; };
type ModalMode     = 'crear' | 'editar' | null;
type PlanModalMode = 'crear' | 'editar' | null;

const METODOS_PAGO = ['Efectivo', 'Transferencia', 'Tarjeta', 'Otro'];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function hoy(): string { return new Date().toISOString().split('T')[0]; }
function calcularVencimientoPorDias(fechaInicio: string, dias: number): string {
  const d = new Date(fechaInicio + 'T00:00:00'); d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
}
function diasRestantes(fechaVencimiento: string): number {
  return Math.round((new Date(fechaVencimiento + 'T00:00:00').getTime() - new Date(hoy() + 'T00:00:00').getTime()) / 86400000);
}
function formatMoneda(valor: number, moneda: string): string {
  return new Intl.NumberFormat('es-MX', { style: 'currency', currency: moneda === 'USD' ? 'USD' : 'MXN', minimumFractionDigits: 0 }).format(valor);
}
function formatFecha(fecha: string): string {
  if (!fecha) return '—';
  const [y, m, d] = fecha.split('-');
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${d} ${meses[parseInt(m) - 1]} ${y}`;
}

// ─── Badge vencimiento ────────────────────────────────────────────────────────
function BadgeVencimiento({ fecha }: { fecha: string }) {
  if (!fecha) return <span className="t-subtle text-sm">—</span>;
  const dias = diasRestantes(fecha);
  let bgColor = 'var(--green-bg)'; let textColor = 'var(--green)';
  let label = `${dias}d restantes`;
  if (dias < 0)       { bgColor = '#7f1d1d'; textColor = '#f87171'; label = `Venció hace ${Math.abs(dias)}d`; }
  else if (dias <= 5) { bgColor = '#7c2d12'; textColor = '#fb923c'; }
  return (
    <div>
      <p className="text-sm t-text">{formatFecha(fecha)}</p>
      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
        style={{ backgroundColor: bgColor + '40', color: textColor }}>
        {label}
      </span>
    </div>
  );
}

// ─── Toggle ───────────────────────────────────────────────────────────────────
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!value)}
      className="w-12 h-6 shrink-0 rounded-full relative transition-colors duration-200 cursor-pointer"
      style={{ backgroundColor: value ? 'var(--primary)' : 'var(--border)' }}>
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm transition-transform duration-200 ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
    </button>
  );
}

// ─── Modal Renovar ────────────────────────────────────────────────────────────
function RenovarModal({ cliente, planes, moneda, onClose, onConfirm }: {
  cliente: Cliente | null; planes: Plan[]; moneda: string;
  onClose: () => void; onConfirm: (datos: { plan: string; metodo: string; notas: string }) => Promise<void>;
}) {
  const [plan, setPlan]     = useState('');
  const [metodo, setMetodo] = useState('Efectivo');
  const [notas, setNotas]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cliente) { setPlan(cliente.plan || planes.find(p => p.activo)?.nombre || ''); setMetodo('Efectivo'); setNotas(''); }
  }, [cliente, planes]);

  if (!cliente) return null;
  const planData       = planes.find(p => p.nombre === plan);
  const estaVigente    = cliente.fecha_vencimiento && diasRestantes(cliente.fecha_vencimiento) > 0;
  const baseCalculo    = estaVigente ? cliente.fecha_vencimiento : hoy();
  const nuevaFechaVenc = planData ? calcularVencimientoPorDias(baseCalculo, planData.duracion_dias) : null;

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
          {/* Plan selector */}
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

          {/* Nueva fecha */}
          {nuevaFechaVenc && (
            <div className="rounded-xl p-3" style={{ backgroundColor: 'color-mix(in srgb, var(--primary) 15%, transparent)' }}>
              <p className="text-xs t-primary font-bold uppercase tracking-widest">Nueva fecha de vencimiento</p>
              <p className="text-lg font-black t-primary mt-0.5">{formatFecha(nuevaFechaVenc)}</p>
              {estaVigente && <p className="text-xs t-muted mt-0.5">Se extiende desde el vencimiento actual</p>}
            </div>
          )}

          {/* Método de pago */}
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

          {/* Notas */}
          <div>
            <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-2">Notas (opcional)</label>
            <textarea value={notas} onChange={e => setNotas(e.target.value)} rows={2}
              placeholder="Ej: Pagó en efectivo, dio $500..."
              className="t-input resize-none" />
          </div>
        </div>

        <div className="px-6 pb-6 flex gap-3">
          <button onClick={onClose} className="flex-1 t-cancel-btn py-2.5">Cancelar</button>
          <button onClick={handleConfirm} disabled={!plan || loading}
            className="flex-1 t-btn py-2.5">
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '✅ Confirmar Renovación'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Historial ──────────────────────────────────────────────────────────
function HistorialModal({ cliente, pagos, moneda, onClose }: {
  cliente: Cliente | null; pagos: Pago[]; moneda: string; onClose: () => void;
}) {
  if (!cliente) return null;
  const historial = pagos.filter(p => p.cliente_id === cliente.id)
    .sort((a, b) => new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="t-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-lg font-black t-text">📋 Historial de Pagos</h2>
            <p className="text-sm t-muted mt-0.5">{cliente.nombre}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full t-hover t-subtle transition">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          {historial.length === 0 ? (
            <p className="text-center t-subtle py-8">Sin pagos registrados.</p>
          ) : (
            <div className="space-y-3">
              {historial.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl t-surface" style={{ border: '1px solid var(--border)' }}>
                  <div>
                    <p className="font-bold t-text text-sm">{formatMoneda(p.monto, moneda)}</p>
                    <p className="text-xs t-muted">{formatFecha(p.fecha_pago)} · {p.metodo_pago}</p>
                    {p.notas && <p className="text-xs t-subtle mt-0.5 italic">"{p.notas}"</p>}
                  </div>
                  <span className="t-badge">{p.plan}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Modal Eliminar ───────────────────────────────────────────────────────────
function DeleteModal({ cliente, onClose, onConfirm }: {
  cliente: Cliente | null; onClose: () => void; onConfirm: () => Promise<void>;
}) {
  const [loading, setLoading] = useState(false);
  if (!cliente) return null;

  const handle = async () => { setLoading(true); await onConfirm(); setLoading(false); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="t-card rounded-2xl shadow-2xl w-full max-w-sm p-6" style={{ border: '1px solid var(--border)' }}>
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3"
            style={{ backgroundColor: 'color-mix(in srgb, #ef4444 20%, transparent)' }}>
            <span className="text-2xl">🗑️</span>
          </div>
          <h2 className="text-lg font-black t-text">Eliminar Cliente</h2>
          <p className="text-sm t-muted mt-1">¿Eliminar a <span className="font-bold t-text">{cliente.nombre}</span>? Esta acción no se puede deshacer.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 t-cancel-btn py-2.5">Cancelar</button>
          <button onClick={handle} disabled={loading}
            className="flex-1 font-bold py-2.5 rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-2 text-white"
            style={{ backgroundColor: '#dc2626' }}>
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Cliente (Crear/Editar) ─────────────────────────────────────────────
function ClienteModal({ mode, cliente, planes, onClose, onSave }: {
  mode: ModalMode; cliente: Partial<Cliente> | null; planes: Plan[];
  onClose: () => void; onSave: (data: Partial<Cliente>) => Promise<void>;
}) {
  const [form, setForm]     = useState<Partial<Cliente>>({});
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
    await onSave(data); setLoading(false); onClose();
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
            { label: 'Nombre completo', key: 'nombre', type: 'text', placeholder: 'Ej: Juan Pérez' },
            { label: 'Teléfono', key: 'telefono', type: 'tel', placeholder: 'Ej: 4421234567' },
            { label: 'Correo electrónico', key: 'correo', type: 'email', placeholder: 'Ej: juan@correo.com' },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1.5">{label}</label>
              <input type={type} placeholder={placeholder} value={(form as any)[key] || ''}
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
            {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : mode === 'crear' ? 'Crear Cliente' : 'Guardar Cambios'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Modal Plan ───────────────────────────────────────────────────────────────
function PlanModal({ mode, plan, onClose, onSave }: {
  mode: PlanModalMode; plan: Partial<Plan> | null;
  onClose: () => void; onSave: (data: Partial<Plan>) => Promise<void>;
}) {
  const [form, setForm]     = useState<Partial<Plan>>({ duracion_dias: 30, precio: 0 });
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DemoAdmin() {
  const router = useRouter();

  const [clientes, setClientes]                       = useState<Cliente[]>([]);
  const [pagos, setPagos]                             = useState<Pago[]>([]);
  const [planes, setPlanes]                           = useState<Plan[]>([]);
  const [config, setConfig]                           = useState<Config>({ id: 1, nombre_negocio: '', moneda: 'MXN', correo_contacto: '', correo_bienvenida_activo: false, correo_vencimiento_activo: false });
  const [configDraft, setConfigDraft]                 = useState<Config>(config);
  const [configLoading, setConfigLoading]             = useState(false);
  const [configSaved, setConfigSaved]                 = useState(false);
  const [loading, setLoading]                         = useState(true);
  const [vistaActual, setVistaActual]                 = useState<'clientes' | 'reportes' | 'configuracion'>('clientes');
  const [busqueda, setBusqueda]                       = useState('');
  const [filtroEstado, setFiltroEstado]               = useState('Todos');
  const [modalMode, setModalMode]                     = useState<ModalMode>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Partial<Cliente> | null>(null);
  const [clienteAEliminar, setClienteAEliminar]       = useState<Cliente | null>(null);
  const [clienteARenovar, setClienteARenovar]         = useState<Cliente | null>(null);
  const [clienteHistorial, setClienteHistorial]       = useState<Cliente | null>(null);
  const [planSeleccionado, setPlanSeleccionado]       = useState<Partial<Plan> | null>(null);
  const [planModalMode, setPlanModalMode]             = useState<PlanModalMode>(null);
  const [sidebarOpen, setSidebarOpen]                 = useState(false);
  const [enviandoAvisos, setEnviandoAvisos]           = useState(false);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    const [{ data: cls }, { data: pgs }, { data: pls }, { data: cfg }] = await Promise.all([
      supabase.from('clientes').select('*').order('nombre'),
      supabase.from('pagos').select('*').order('fecha_pago', { ascending: false }),
      supabase.from('planes').select('*').order('precio'),
      supabase.from('configuracion').select('*').limit(1),
    ]);
    if (cls) setClientes(cls); if (pgs) setPagos(pgs); if (pls) setPlanes(pls);
    if (cfg?.[0]) { setConfig(cfg[0]); setConfigDraft(cfg[0]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/demo/login'); else cargarDatos();
    });
  }, [cargarDatos, router]);

  const handleCrear    = async (data: Partial<Cliente>) => { await supabase.from('clientes').insert([data]); await cargarDatos(); };
  const handleEditar   = async (data: Partial<Cliente>) => { await supabase.from('clientes').update(data).eq('id', data.id!); await cargarDatos(); };
  const handleEliminar = async () => {
    if (!clienteAEliminar) return;
    await supabase.from('pagos').delete().eq('cliente_id', clienteAEliminar.id);
    await supabase.from('clientes').delete().eq('id', clienteAEliminar.id);
    await cargarDatos();
  };
  const handleRenovar = async ({ plan, metodo, notas }: { plan: string; metodo: string; notas: string }) => {
    if (!clienteARenovar) return;
    const planData = planes.find(p => p.nombre === plan); if (!planData) return;
    const estaVigente = clienteARenovar.fecha_vencimiento && diasRestantes(clienteARenovar.fecha_vencimiento) > 0;
    const baseCalculo = estaVigente ? clienteARenovar.fecha_vencimiento : hoy();
    const nuevaFechaVenc = calcularVencimientoPorDias(baseCalculo, planData.duracion_dias);
    await supabase.from('clientes').update({ plan, fecha_vencimiento: nuevaFechaVenc, estado_pago: 'Activo' }).eq('id', clienteARenovar.id);
    await supabase.from('pagos').insert([{ cliente_id: clienteARenovar.id, fecha_pago: hoy(), monto: planData.precio, plan, metodo_pago: metodo, notas }]);
    await cargarDatos();
  };
  const handleCrearPlan  = async (data: Partial<Plan>) => { await supabase.from('planes').insert([{ ...data, activo: true }]); await cargarDatos(); };
  const handleEditarPlan = async (data: Partial<Plan>) => { await supabase.from('planes').update(data).eq('id', data.id!); await cargarDatos(); };
  const togglePlanActivo = async (plan: Plan) => { await supabase.from('planes').update({ activo: !plan.activo }).eq('id', plan.id); await cargarDatos(); };
  const eliminarPlan     = async (id: number) => { await supabase.from('planes').delete().eq('id', id); await cargarDatos(); };
  const guardarConfig    = async () => {
    setConfigLoading(true);
    await supabase.from('configuracion').update(configDraft).eq('id', configDraft.id);
    setConfig(configDraft); setConfigLoading(false); setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  };

  const clientesFiltrados = clientes.filter(c => {
    const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          c.telefono?.includes(busqueda) ||
                          c.correo?.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'Todos' || c.estado_pago === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const totalActivos  = clientes.filter(c => c.estado_pago === 'Activo').length;
  const totalVencidos = clientes.filter(c => c.estado_pago === 'Vencido' || (c.fecha_vencimiento && diasRestantes(c.fecha_vencimiento) < 0)).length;
  const ingresosHoy   = pagos.filter(p => p.fecha_pago === hoy()).reduce((s, p) => s + p.monto, 0);
  const ingresosMes   = pagos.filter(p => p.fecha_pago?.startsWith(hoy().slice(0, 7))).reduce((s, p) => s + p.monto, 0);

  const navItems = [
    { id: 'clientes',      label: 'Clientes',     emoji: '👥' },
    { id: 'reportes',      label: 'Reportes',      emoji: '📊' },
    { id: 'configuracion', label: 'Configuración', emoji: '⚙️'  },
  ] as const;

  if (loading) {
    return (
      <div className="min-h-screen t-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-3"
            style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
          <p className="text-sm t-muted">Cargando panel...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes fade-in  { from { opacity: 0; } to { opacity: 1; } }
        @keyframes scale-in { from { opacity: 0; transform: scale(.95); } to { opacity: 1; transform: scale(1); } }
        .animate-fade-in  { animation: fade-in  0.2s ease-out both; }
        .animate-scale-in { animation: scale-in 0.2s ease-out both; }
      `}</style>

      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="min-h-screen t-bg flex">

        {/* ══════════════ SIDEBAR ══════════════ */}
        <aside className={`fixed inset-y-0 left-0 z-50 w-64 t-sidebar flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
          style={{ borderRight: '1px solid var(--border)' }}>

          {/* Logo */}
          <div className="p-5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: 'var(--primary)', boxShadow: '0 4px 12px var(--shadow)' }}>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <p className="font-black t-sidebar-text text-sm leading-none">
                  Gama<span style={{ color: 'var(--primary)' }}>Link</span>
                </p>
                <p className="text-[10px] t-sidebar-muted mt-0.5 truncate max-w-[130px]">{config.nombre_negocio || 'Panel Admin'}</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-3 space-y-1">
            {navItems.map(item => (
              <button key={item.id} onClick={() => { setVistaActual(item.id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition ${vistaActual === item.id ? 't-nav-active' : 't-sidebar-nav-inactive'}`}>
                <span className="text-base">{item.emoji}</span>
                {item.label}
                {item.id === 'clientes' && (
                  <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-black"
                    style={{
                      backgroundColor: vistaActual === 'clientes' ? 'rgba(255,255,255,0.2)' : 'color-mix(in srgb, var(--primary) 20%, transparent)',
                      color: vistaActual === 'clientes' ? 'white' : 'var(--primary)',
                    }}>
                    {clientes.length}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Footer sidebar */}
          <div className="p-4 space-y-2" style={{ borderTop: '1px solid var(--border)' }}>
            
            <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition"
              style={{ color: '#f87171' }}
              onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, #ef4444 15%, transparent)')}
              onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
              <span>🚪</span> Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* ══════════════ MAIN ══════════════ */}
        <main className="flex-1 flex flex-col min-w-0">

          {/* Topbar */}
          <header className="sticky top-0 z-30 px-4 lg:px-6 py-3 flex items-center gap-3"
            style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 85%, transparent)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}>
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl t-hover transition">
              <svg className="w-5 h-5 t-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h1 className="font-black t-text text-base flex-1 capitalize">
              {vistaActual === 'clientes' ? '👥 Clientes' : vistaActual === 'reportes' ? '📊 Reportes' : '⚙️ Configuración'}
            </h1>
            {vistaActual === 'clientes' && (
              <button onClick={() => { setClienteSeleccionado(null); setModalMode('crear'); }}
                className="t-btn text-sm px-4 py-2">
                <span className="text-base leading-none">+</span> Nuevo
              </button>
            )}
          </header>

          {/* Contenido */}
          <div className="flex-1 p-4 lg:p-6 overflow-auto">

            {/* ══════════════ CLIENTES ══════════════ */}
            {vistaActual === 'clientes' && (
              <div className="animate-fade-in space-y-4">

                {/* Stats rápidas */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Clientes', value: clientes.length,                          fgColor: 'var(--primary)', bgColor: 'color-mix(in srgb, var(--primary) 15%, transparent)' },
                    { label: 'Activos',         value: totalActivos,                              fgColor: 'var(--green)',   bgColor: 'var(--green-bg)' },
                    { label: 'Vencidos',        value: totalVencidos,                             fgColor: '#f87171',        bgColor: 'color-mix(in srgb, #f87171 15%, transparent)' },
                    { label: 'Ingresos Mes',    value: formatMoneda(ingresosMes, config.moneda),  fgColor: 'var(--accent)',  bgColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' },
                  ].map(s => (
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
                      onChange={e => setBusqueda(e.target.value)} className="t-input pl-9" />
                  </div>
                  <div className="flex gap-2">
                    {['Todos', 'Activo', 'Vencido', 'Suspendido'].map(f => (
                      <button key={f} onClick={() => setFiltroEstado(f)}
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

                {/* Tabla de clientes */}
                <div className="t-card rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  {clientesFiltrados.length === 0 ? (
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
                          {clientesFiltrados.map((c, i) => (
                            <tr key={c.id} className="t-hover transition"
                              style={{ borderBottom: i < clientesFiltrados.length - 1 ? '1px solid var(--border)' : 'none' }}>
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
                                    color: c.estado_pago === 'Activo' ? 'var(--green)' : 'var(--fg-muted)'
                                  }}>
                                  {c.estado_pago}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <button onClick={() => setClienteHistorial(c)} title="Historial"
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition"
                                    style={{ color: 'var(--primary)' }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, var(--primary) 15%, transparent)')}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                                    📋 <span>Ver</span>
                                  </button>
                                  <button onClick={() => setClienteARenovar(c)} title="Renovar"
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold transition"
                                    style={{ color: 'var(--green)' }}
                                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--green-bg)')}
                                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
                                    🔄 <span>Renovar</span>
                                  </button>
                                  <button onClick={() => { setClienteSeleccionado(c); setModalMode('editar'); }} title="Editar"
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg t-hover t-muted transition text-xs font-bold">
                                    ✏️ <span>Editar</span>
                                  </button>
                                  <button onClick={() => setClienteAEliminar(c)} title="Eliminar"
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
            )}

            {/* ══════════════ REPORTES ══════════════ */}
            {vistaActual === 'reportes' && (
              <div className="animate-fade-in space-y-6">

                {/* Resumen */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    { label: 'Total Clientes', value: clientes.length,                         fgColor: 'var(--primary)', bgColor: 'color-mix(in srgb, var(--primary) 15%, transparent)' },
                    { label: 'Activos',         value: totalActivos,                              fgColor: 'var(--green)',   bgColor: 'var(--green-bg)' },
                    { label: 'Vencidos',       value: totalVencidos,                            fgColor: '#f87171',        bgColor: 'color-mix(in srgb, #f87171 15%, transparent)' },
                    { label: 'Ingresos Mes',   value: formatMoneda(ingresosMes, config.moneda), fgColor: 'var(--accent)',  bgColor: 'color-mix(in srgb, var(--accent) 15%, transparent)' },
                  ].map(s => (
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
                    {config.correo_vencimiento_activo && (
                      <button
                        onClick={async () => { setEnviandoAvisos(true); await new Promise(r => setTimeout(r, 1500)); setEnviandoAvisos(false); }}
                        disabled={enviandoAvisos}
                        className="t-btn text-xs px-3 py-2">
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
                        <p className="font-black t-primary text-sm shrink-0">{formatMoneda(p.monto, config.moneda)}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Próximos a vencer */}
                <div className="t-card rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <div className="p-4 lg:p-5 t-header" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h3 className="font-black t-text">⚠️ Próximos a Vencer (5 días)</h3>
                  </div>
                  {(() => {
                    const lista = clientes.filter(c => {
                      if (!c.fecha_vencimiento || c.estado_pago !== 'Activo') return false;
                      const d = diasRestantes(c.fecha_vencimiento);
                      return d >= 0 && d <= 5;
                    });
                    return lista.length === 0
                      ? <p className="text-sm t-subtle p-5">Ningún cliente vence en los próximos 5 días. 🎉</p>
                      : (
                        <ul>
                          {lista.map((c, i) => (
                            <li key={c.id} className="px-4 lg:px-5 py-3 flex justify-between items-center gap-4 t-hover transition"
                              style={{ borderBottom: i < lista.length - 1 ? '1px solid var(--border)' : 'none' }}>
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
                      );
                  })()}
                </div>
              </div>
            )}

            {/* ══════════════ CONFIG ══════════════ */}
            {vistaActual === 'configuracion' && (
              <div className="animate-fade-in space-y-6">

                {/* Datos negocio */}
                <div className="t-card p-4 lg:p-6 rounded-2xl shadow-sm" style={{ border: '1px solid var(--border)' }}>
                  <h3 className="text-lg font-black t-text mb-4">🏢 Datos del Negocio</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1">Nombre del Negocio</label>
                      <input type="text" value={configDraft.nombre_negocio}
                        onChange={e => setConfigDraft({ ...configDraft, nombre_negocio: e.target.value })} className="t-input" />
                      <p className="text-xs t-subtle mt-1">Aparece en el panel y en los correos enviados.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1">Moneda</label>
                      <select value={configDraft.moneda} onChange={e => setConfigDraft({ ...configDraft, moneda: e.target.value })} className="t-input">
                        <option value="MXN">MXN — Pesos Mexicanos</option>
                        <option value="USD">USD — Dólares</option>
                      </select>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1">Correo de contacto</label>
                      <input type="email" value={configDraft.correo_contacto || ''}
                        onChange={e => setConfigDraft({ ...configDraft, correo_contacto: e.target.value })}
                        placeholder="contacto@tunegocio.com" className="t-input" />
                      <p className="text-xs t-subtle mt-1">Los clientes pueden responder a este correo cuando reciban notificaciones.</p>
                    </div>
                  </div>
                </div>

                {/* Correos automáticos */}
                <div className="t-card rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <div className="p-4 lg:p-6 t-header" style={{ borderBottom: '1px solid var(--border)' }}>
                    <h3 className="text-lg font-black t-text">📧 Correos Automáticos</h3>
                    <p className="text-sm t-muted">Solo se envían a clientes con correo registrado.</p>
                  </div>
                  <div className="p-4 lg:p-6 space-y-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h4 className="font-bold t-text text-sm">Correo de Bienvenida</h4>
                        <p className="text-xs t-muted mt-0.5">Se envía al registrar un nuevo cliente con correo.</p>
                      </div>
                      <Toggle value={configDraft.correo_bienvenida_activo} onChange={v => setConfigDraft({ ...configDraft, correo_bienvenida_activo: v })} />
                    </div>
                    <div className="flex items-start justify-between gap-4 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
                      <div>
                        <h4 className="font-bold t-text text-sm">Aviso de Vencimiento</h4>
                        <p className="text-xs t-muted mt-0.5">Activa el botón de avisos en Reportes (clientes que vencen en 3 días).</p>
                      </div>
                      <Toggle value={configDraft.correo_vencimiento_activo} onChange={v => setConfigDraft({ ...configDraft, correo_vencimiento_activo: v })} />
                    </div>
                  </div>
                </div>

                {/* Planes */}
                <div className="t-card rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  <div className="p-4 lg:p-6 flex items-center justify-between t-header" style={{ borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <h3 className="text-lg font-black t-text">💳 Planes de Membresía</h3>
                      <p className="text-sm t-muted">Los precios se reflejan en los reportes de ingresos.</p>
                    </div>
                    <button onClick={() => { setPlanSeleccionado({ duracion_dias: 30, precio: 0 }); setPlanModalMode('crear'); }}
                      className="t-btn text-xs px-3 py-2 whitespace-nowrap">
                      + Nuevo Plan
                    </button>
                  </div>
                  <div>
                    {planes.length === 0 ? (
                      <p className="p-6 text-sm t-subtle text-center">No hay planes creados.</p>
                    ) : planes.map((plan, i) => (
                      <div key={plan.id} className={`p-4 lg:p-5 flex items-center gap-4 t-hover transition ${!plan.activo ? 'opacity-50' : ''}`}
                        style={{ borderBottom: i < planes.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-bold t-text text-sm">{plan.nombre}</p>
                            {!plan.activo && <span className="t-badge text-[10px]">Inactivo</span>}
                          </div>
                          <p className="text-xs t-muted mt-0.5">{formatMoneda(plan.precio, config.moneda)} · {plan.duracion_dias} días</p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <button onClick={() => { setPlanSeleccionado(plan); setPlanModalMode('editar'); }}
                            className="text-xs t-primary font-bold hover:underline">Editar</button>
                          <button onClick={() => togglePlanActivo(plan)}
                            className="text-xs t-muted font-bold hover:underline">{plan.activo ? 'Desactivar' : 'Activar'}</button>
                          <button onClick={() => eliminarPlan(plan.id)}
                            className="text-xs font-bold hover:underline" style={{ color: '#f87171' }}>Eliminar</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <button onClick={guardarConfig} disabled={configLoading} className="t-btn px-8 py-3">
                    {configLoading
                      ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      : configSaved ? '✅ Guardado' : 'Guardar Cambios'}
                  </button>
                </div>

                {/* SECCIÓN DE APARIENCIA (NUEVA) */}
                <div className="t-card p-6 rounded-2xl shadow-sm border border-[var(--border)]">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[var(--bg-surface)] rounded-lg text-xl">🎨</div>
                    <div>
                      <h2 className="text-xl font-black t-text">Apariencia del Sistema</h2>
                      <p className="t-subtle text-sm">Personaliza cómo se ve tu panel administrativo de Gamalink.</p>
                    </div>
                  </div>
                  
                  {/* Llamamos al componente que creamos en el paso 2 */}
                  <ConfigThemeSelector />
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
