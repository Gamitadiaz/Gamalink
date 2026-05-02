"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase_config';
import { Cliente, Plan, Pago, Config, ModalMode, PlanModalMode } from '@/types/demo';
import { hoy, calcularVencimientoPorDias, diasRestantes, formatMoneda } from '@/lib/demo-utils';
import DemoSidebar from '@/components/demo/DemoSidebar';
import ClientesView from '@/components/demo/ClientesView';
import ReportesView from '@/components/demo/ReportesView';
import ConfiguracionView from '@/components/demo/ConfiguracionView';
import ClienteModal from '@/components/demo/ClienteModal';
import DeleteModal from '@/components/demo/DeleteModal';
import RenovarModal from '@/components/demo/RenovarModal';
import HistorialModal from '@/components/demo/HistorialModal';
import PlanModal from '@/components/demo/PlanModal';

type Vista = 'clientes' | 'reportes' | 'configuracion';

const DEFAULT_CONFIG: Config = {
  id: 1, nombre_negocio: '', moneda: 'MXN',
  correo_contacto: '', correo_bienvenida_activo: false, correo_vencimiento_activo: false,
};

export default function DemoAdmin() {
  const router = useRouter();

  const [clientes, setClientes]     = useState<Cliente[]>([]);
  const [pagos, setPagos]           = useState<Pago[]>([]);
  const [planes, setPlanes]         = useState<Plan[]>([]);
  const [config, setConfig]         = useState<Config>(DEFAULT_CONFIG);
  const [configDraft, setConfigDraft] = useState<Config>(DEFAULT_CONFIG);
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaved, setConfigSaved]     = useState(false);
  const [loading, setLoading]       = useState(true);
  const [vistaActual, setVistaActual] = useState<Vista>('clientes');
  const [busqueda, setBusqueda]     = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [sidebarOpen, setSidebarOpen]   = useState(false);
  const [enviandoAvisos, setEnviandoAvisos] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), type === 'error' ? 4000 : 2000);
  };

  // Modal state
  const [modalMode, setModalMode]                     = useState<ModalMode>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Partial<Cliente> | null>(null);
  const [clienteAEliminar, setClienteAEliminar]       = useState<Cliente | null>(null);
  const [clienteARenovar, setClienteARenovar]         = useState<Cliente | null>(null);
  const [clienteHistorial, setClienteHistorial]       = useState<Cliente | null>(null);
  const [planSeleccionado, setPlanSeleccionado]       = useState<Partial<Plan> | null>(null);
  const [planModalMode, setPlanModalMode]             = useState<PlanModalMode>(null);

  // ── Data loading ────────────────────────────────────────────────────────────

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    const [
      { data: cls, error: clsErr },
      { data: pgs, error: pgsErr },
      { data: pls, error: plsErr },
      { data: cfg, error: cfgErr },
    ] = await Promise.all([
      supabase.from('clientes').select('*').order('nombre'),
      supabase.from('pagos').select('*').order('fecha_pago', { ascending: false }),
      supabase.from('planes').select('*').order('precio'),
      supabase.from('configuracion').select('*').limit(1),
    ]);
    if (cls) setClientes(cls);
    if (pgs) setPagos(pgs);
    if (pls) setPlanes(pls);
    if (cfg?.[0]) { setConfig(cfg[0]); setConfigDraft(cfg[0]); }
    if (clsErr || pgsErr || plsErr || cfgErr)
      showToast('Error al cargar los datos. Verifica tu conexión.');
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/demo/login'); else cargarDatos();
    });
  }, [cargarDatos, router]);

  // ── Clientes handlers ────────────────────────────────────────────────────────

  const handleCrear = async (data: Partial<Cliente>) => {
    const { error } = await supabase.from('clientes').insert([data]);
    if (error) { showToast('Error al crear cliente: ' + error.message); return; }
    await cargarDatos();
  };
  const handleEditar = async (data: Partial<Cliente>) => {
    const { error } = await supabase.from('clientes').update(data).eq('id', data.id!);
    if (error) { showToast('Error al guardar cambios: ' + error.message); return; }
    await cargarDatos();
  };
  const handleEliminar = async () => {
    if (!clienteAEliminar) return;
    const { error: errPagos } = await supabase.from('pagos').delete().eq('cliente_id', clienteAEliminar.id);
    if (errPagos) { showToast('Error al eliminar historial de pagos: ' + errPagos.message); return; }
    const { error } = await supabase.from('clientes').delete().eq('id', clienteAEliminar.id);
    if (error) { showToast('Error al eliminar cliente: ' + error.message); return; }
    await cargarDatos();
  };
  const handleRenovar = async ({ plan, metodo, notas }: { plan: string; metodo: string; notas: string }) => {
    if (!clienteARenovar) return;
    const planData = planes.find(p => p.nombre === plan);
    if (!planData) return;
    const estaVigente    = clienteARenovar.fecha_vencimiento && diasRestantes(clienteARenovar.fecha_vencimiento) > 0;
    const baseCalculo    = estaVigente ? clienteARenovar.fecha_vencimiento : hoy();
    const nuevaFechaVenc = calcularVencimientoPorDias(baseCalculo, planData.duracion_dias);
    const { error: errCliente } = await supabase.from('clientes').update({ plan, fecha_vencimiento: nuevaFechaVenc, estado_pago: 'Activo' }).eq('id', clienteARenovar.id);
    if (errCliente) { showToast('Error al renovar membresía: ' + errCliente.message); return; }
    const { error: errPago } = await supabase.from('pagos').insert([{ cliente_id: clienteARenovar.id, fecha_pago: hoy(), monto: planData.precio, plan, metodo_pago: metodo, notas }]);
    if (errPago) { showToast('Membresía renovada, pero no se pudo registrar el pago: ' + errPago.message); }
    await cargarDatos();
  };

  // ── Planes handlers ──────────────────────────────────────────────────────────

  const handleCrearPlan = async (data: Partial<Plan>) => {
    const { error } = await supabase.from('planes').insert([{ ...data, activo: true }]);
    if (error) { showToast('Error al crear plan: ' + error.message); return; }
    await cargarDatos();
  };
  const handleEditarPlan = async (data: Partial<Plan>) => {
    const { error } = await supabase.from('planes').update(data).eq('id', data.id!);
    if (error) { showToast('Error al editar plan: ' + error.message); return; }
    await cargarDatos();
  };
  const togglePlanActivo = async (plan: Plan) => {
    const { error } = await supabase.from('planes').update({ activo: !plan.activo }).eq('id', plan.id);
    if (error) { showToast('Error al actualizar plan: ' + error.message); return; }
    await cargarDatos();
  };
  const eliminarPlan = async (id: number) => {
    const { error } = await supabase.from('planes').delete().eq('id', id);
    if (error) { showToast('Error al eliminar plan: ' + error.message); return; }
    await cargarDatos();
  };

  // ── Config handler ───────────────────────────────────────────────────────────

  const guardarConfig = async () => {
    setConfigLoading(true);
    const { error } = await supabase.from('configuracion').update(configDraft).eq('id', configDraft.id);
    setConfigLoading(false);
    if (error) { showToast('Error al guardar configuración: ' + error.message); return; }
    setConfig(configDraft);
    setConfigSaved(true);
    showToast('Configuración guardada', 'success');
    setTimeout(() => setConfigSaved(false), 2000);
  };

  // ── Derived state ────────────────────────────────────────────────────────────

  const clientesFiltrados = clientes.filter(c => {
    const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                          c.telefono?.includes(busqueda) ||
                          c.correo?.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'Todos' || c.estado_pago === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const totalActivos  = clientes.filter(c => c.estado_pago === 'Activo').length;
  const totalVencidos = clientes.filter(c => c.estado_pago === 'Vencido' || (c.fecha_vencimiento && diasRestantes(c.fecha_vencimiento) < 0)).length;
  const ingresosMes   = pagos.filter(p => p.fecha_pago?.startsWith(hoy().slice(0, 7))).reduce((s, p) => s + p.monto, 0);

  // ── Loading screen ───────────────────────────────────────────────────────────

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

  // ── Render ───────────────────────────────────────────────────────────────────

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

        <DemoSidebar
          nombreNegocio={config.nombre_negocio}
          totalClientes={clientes.length}
          vistaActual={vistaActual}
          sidebarOpen={sidebarOpen}
          onVistaChange={setVistaActual}
          onCloseSidebar={() => setSidebarOpen(false)}
          onSignOut={async () => { await supabase.auth.signOut(); router.push('/demo/login'); }}
        />

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
              <button onClick={() => { setClienteSeleccionado(null); setModalMode('crear'); }} className="t-btn text-sm px-4 py-2">
                <span className="text-base leading-none">+</span> Nuevo
              </button>
            )}
          </header>

          {/* Views */}
          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            {vistaActual === 'clientes' && (
              <ClientesView
                clientes={clientesFiltrados}
                totalActivos={totalActivos}
                totalVencidos={totalVencidos}
                ingresosMes={ingresosMes}
                moneda={config.moneda}
                busqueda={busqueda}
                filtroEstado={filtroEstado}
                onBusquedaChange={setBusqueda}
                onFiltroChange={setFiltroEstado}
                onVerHistorial={setClienteHistorial}
                onRenovar={setClienteARenovar}
                onEditar={c => { setClienteSeleccionado(c); setModalMode('editar'); }}
                onEliminar={setClienteAEliminar}
              />
            )}
            {vistaActual === 'reportes' && (
              <ReportesView
                clientes={clientes}
                pagos={pagos}
                totalActivos={totalActivos}
                totalVencidos={totalVencidos}
                ingresosMes={ingresosMes}
                moneda={config.moneda}
                correoVencimientoActivo={config.correo_vencimiento_activo}
                enviandoAvisos={enviandoAvisos}
                onEnviarAvisos={async () => { setEnviandoAvisos(true); await new Promise(r => setTimeout(r, 1500)); setEnviandoAvisos(false); }}
                onRenovar={setClienteARenovar}
              />
            )}
            {vistaActual === 'configuracion' && (
              <ConfiguracionView
                configDraft={configDraft}
                planes={planes}
                moneda={config.moneda}
                configLoading={configLoading}
                configSaved={configSaved}
                onConfigChange={setConfigDraft}
                onGuardarConfig={guardarConfig}
                onNuevoPlan={() => { setPlanSeleccionado({ duracion_dias: 30, precio: 0 }); setPlanModalMode('crear'); }}
                onEditarPlan={p => { setPlanSeleccionado(p); setPlanModalMode('editar'); }}
                onTogglePlanActivo={togglePlanActivo}
                onEliminarPlan={eliminarPlan}
              />
            )}
          </div>
        </main>
      </div>

      {/* Modales */}
      <ClienteModal
        mode={modalMode} cliente={clienteSeleccionado} planes={planes}
        onClose={() => setModalMode(null)}
        onSave={modalMode === 'crear' ? handleCrear : handleEditar}
      />
      <DeleteModal
        cliente={clienteAEliminar}
        onClose={() => setClienteAEliminar(null)}
        onConfirm={handleEliminar}
      />
      <RenovarModal
        cliente={clienteARenovar} planes={planes} moneda={config.moneda}
        onClose={() => setClienteARenovar(null)}
        onConfirm={handleRenovar}
      />
      <HistorialModal
        cliente={clienteHistorial} pagos={pagos} moneda={config.moneda}
        onClose={() => setClienteHistorial(null)}
      />
      <PlanModal
        mode={planModalMode} plan={planSeleccionado}
        onClose={() => setPlanModalMode(null)}
        onSave={planModalMode === 'crear' ? handleCrearPlan : handleEditarPlan}
      />

      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold animate-scale-in"
          style={{ backgroundColor: toast.type === 'error' ? '#ef4444' : 'var(--green)', color: 'white' }}
        >
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          {toast.message}
        </div>
      )}
    </>
  );
}
