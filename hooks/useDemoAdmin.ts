"use client";
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase_config';
import { hoy, calcularVencimientoPorDias, calcularBaseRenovacion, diasRestantes, formatMoneda } from '@/lib/helpers';
import type { Cliente, Plan, Pago, Config, ModalMode, PlanModalMode } from '@/lib/types';

const DEFAULT_CONFIG: Config = {
  id: 1, nombre_negocio: '', moneda: 'MXN', correo_contacto: '',
  correo_bienvenida_activo: false, correo_vencimiento_activo: false,
};

export function useDemoAdmin() {
  const router = useRouter();

  const [clientes, setClientes]                             = useState<Cliente[]>([]);
  const [pagos, setPagos]                                   = useState<Pago[]>([]);
  const [planes, setPlanes]                                 = useState<Plan[]>([]);
  const [config, setConfig]                                 = useState<Config>(DEFAULT_CONFIG);
  const [configDraft, setConfigDraft]                       = useState<Config>(DEFAULT_CONFIG);
  const [configLoading, setConfigLoading]                   = useState(false);
  const [configSaved, setConfigSaved]                       = useState(false);
  const [loading, setLoading]                               = useState(true);
  const [vistaActual, setVistaActual]                       = useState<'clientes' | 'reportes' | 'configuracion'>('clientes');
  const [busqueda, setBusqueda]                             = useState('');
  const [filtroEstado, setFiltroEstado]                     = useState('Todos');
  const [modalMode, setModalMode]                           = useState<ModalMode>(null);
  const [clienteSeleccionado, setClienteSeleccionado]       = useState<Partial<Cliente> | null>(null);
  const [clienteAEliminar, setClienteAEliminar]             = useState<Cliente | null>(null);
  const [clienteARenovar, setClienteARenovar]               = useState<Cliente | null>(null);
  const [clienteHistorial, setClienteHistorial]             = useState<Cliente | null>(null);
  const [planSeleccionado, setPlanSeleccionado]             = useState<Partial<Plan> | null>(null);
  const [planModalMode, setPlanModalMode]                   = useState<PlanModalMode>(null);
  const [sidebarOpen, setSidebarOpen]                       = useState(false);
  const [enviandoAvisos, setEnviandoAvisos]                 = useState(false);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    const [{ data: cls }, { data: pgs }, { data: pls }, { data: cfg }] = await Promise.all([
      supabase.from('clientes').select('*').order('nombre'),
      supabase.from('pagos').select('*').order('fecha_pago', { ascending: false }),
      supabase.from('planes').select('*').order('precio'),
      supabase.from('configuracion').select('*').limit(1),
    ]);
    if (cls) setClientes(cls);
    if (pgs) setPagos(pgs);
    if (pls) setPlanes(pls);
    if (cfg?.[0]) { setConfig(cfg[0]); setConfigDraft(cfg[0]); }
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) router.push('/login'); else cargarDatos();
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
    const planData = planes.find(p => p.nombre === plan);
    if (!planData) return;
    const base = calcularBaseRenovacion(clienteARenovar.fecha_vencimiento);
    const nuevaFechaVenc = calcularVencimientoPorDias(base, planData.duracion_dias);
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
    setConfig(configDraft);
    setConfigLoading(false);
    setConfigSaved(true);
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

  return {
    clientes, pagos, planes, config,
    configDraft, setConfigDraft, configLoading, configSaved,
    loading,
    vistaActual, setVistaActual,
    busqueda, setBusqueda, filtroEstado, setFiltroEstado, clientesFiltrados,
    modalMode, setModalMode,
    clienteSeleccionado, setClienteSeleccionado,
    clienteAEliminar, setClienteAEliminar,
    clienteARenovar, setClienteARenovar,
    clienteHistorial, setClienteHistorial,
    planModalMode, setPlanModalMode,
    planSeleccionado, setPlanSeleccionado,
    sidebarOpen, setSidebarOpen,
    enviandoAvisos, setEnviandoAvisos,
    totalActivos, totalVencidos, ingresosHoy, ingresosMes,
    handleCrear, handleEditar, handleEliminar, handleRenovar,
    handleCrearPlan, handleEditarPlan, togglePlanActivo, eliminarPlan, guardarConfig,
  };
}
