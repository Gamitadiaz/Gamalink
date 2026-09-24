"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase_config';
import { Cliente, Plan, Pago, Config, ModalMode } from '@/types/demo';
import { hoy, calcularVencimientoPorDias, diasRestantes } from '@/lib/demo-utils';

import ClientesView from '@/app/(plataforma)/components/ClientesView'; 
import ClienteModal from '@/app/(plataforma)/components/ClienteModal';
import DeleteModal from '@/app/(plataforma)/components/DeleteModal';
import RenovarModal from '@/app/(plataforma)/components/RenovarModal';
import HistorialModal from '@/app/(plataforma)/components/HistorialModal';

const DEFAULT_CONFIG: Config = {
  id: 1, nombre_negocio: '', moneda: 'MXN',
  correo_contacto: '', correo_bienvenida_activo: false, correo_vencimiento_activo: false,
};

export default function ClientesPage() {
  // 1. Estados específicos de Clientes
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('Todos');
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  // 2. Estados de Modales
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Partial<Cliente> | null>(null);
  const [clienteAEliminar, setClienteAEliminar] = useState<Cliente | null>(null);
  const [clienteARenovar, setClienteARenovar] = useState<Cliente | null>(null);
  const [clienteHistorial, setClienteHistorial] = useState<Cliente | null>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), type === 'error' ? 4000 : 2000);
  };

  // 3. Carga de datos (Solo lo que esta vista necesita)
  const cargarDatos = useCallback(async () => {
    setLoading(true);
    const [
      { data: cls }, { data: pgs }, { data: pls }, { data: cfg }
    ] = await Promise.all([
      supabase.from('clientes').select('*').order('nombre'),
      supabase.from('pagos').select('*').order('fecha_pago', { ascending: false }),
      supabase.from('planes').select('*').order('precio'),
      supabase.from('configuracion').select('*').limit(1),
    ]);
    
    if (cls) setClientes(cls);
    if (pgs) setPagos(pgs);
    if (pls) setPlanes(pls);
    if (cfg?.[0]) setConfig(cfg[0]);
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

  // 4. Handlers de Clientes
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
    await supabase.from('pagos').delete().eq('cliente_id', clienteAEliminar.id);
    const { error } = await supabase.from('clientes').delete().eq('id', clienteAEliminar.id);
    if (error) { showToast('Error al eliminar: ' + error.message); return; }
    await cargarDatos();
  };

  const handleRenovar = async ({ plan, metodo, notas }: { plan: string; metodo: string; notas: string }) => {
    if (!clienteARenovar) return;
    const planData = planes.find(p => p.nombre === plan);
    if (!planData) return;
    
    const estaVigente = clienteARenovar.fecha_vencimiento && diasRestantes(clienteARenovar.fecha_vencimiento) > 0;
    const baseCalculo = estaVigente ? clienteARenovar.fecha_vencimiento : hoy();
    const nuevaFechaVenc = calcularVencimientoPorDias(baseCalculo, planData.duracion_dias);
    
    await supabase.from('clientes').update({ plan, fecha_vencimiento: nuevaFechaVenc, estado_pago: 'Activo' }).eq('id', clienteARenovar.id);
    await supabase.from('pagos').insert([{ cliente_id: clienteARenovar.id, fecha_pago: hoy(), monto: planData.precio, plan, metodo_pago: metodo, notas }]);
    await cargarDatos();
  };

  // 5. Estado derivado
  const clientesFiltrados = clientes.filter(c => {
    const matchBusqueda = c.nombre.toLowerCase().includes(busqueda.toLowerCase()) || c.correo?.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'Todos' || c.estado_pago === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const totalActivos = clientes.filter(c => c.estado_pago === 'Activo').length;
  const totalVencidos = clientes.filter(c => c.estado_pago === 'Vencido' || (c.fecha_vencimiento && diasRestantes(c.fecha_vencimiento) < 0)).length;
  const ingresosMes = pagos.filter(p => p.fecha_pago?.startsWith(hoy().slice(0, 7))).reduce((s, p) => s + p.monto, 0);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando clientes...</div>;

  return (
    <div className="animate-fade-in">
      {/* Cabecera específica de clientes */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Clientes</h1>
        <button 
          onClick={() => { setClienteSeleccionado(null); setModalMode('crear'); }} 
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-700"
        >
          + Nuevo Cliente
        </button>
      </div>

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

      {/* Modales exclusivos de esta vista */}
      <ClienteModal mode={modalMode} cliente={clienteSeleccionado} planes={planes} onClose={() => setModalMode(null)} onSave={modalMode === 'crear' ? handleCrear : handleEditar} />
      <DeleteModal cliente={clienteAEliminar} onClose={() => setClienteAEliminar(null)} onConfirm={handleEliminar} />
      <RenovarModal cliente={clienteARenovar} planes={planes} moneda={config.moneda} onClose={() => setClienteARenovar(null)} onConfirm={handleRenovar} />
      <HistorialModal cliente={clienteHistorial} pagos={pagos} moneda={config.moneda} onClose={() => setClienteHistorial(null)} />
    </div>
  );
}