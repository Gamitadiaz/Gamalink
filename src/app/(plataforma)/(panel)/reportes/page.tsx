"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase_config';
import { Cliente, Pago, Plan, Config } from '@/types/demo';
import { hoy, calcularVencimientoPorDias, diasRestantes } from '@/lib/demo-utils';

import ReportesView from '@/app/(plataforma)/components/ReportesView';
import RenovarModal from '@/app/(plataforma)/components/RenovarModal';

const DEFAULT_CONFIG: Config = {
  id: 1, nombre_negocio: '', moneda: 'MXN',
  correo_contacto: '', correo_bienvenida_activo: false, correo_vencimiento_activo: false,
};

export default function ReportesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  
  const [enviandoAvisos, setEnviandoAvisos] = useState(false);
  const [clienteARenovar, setClienteARenovar] = useState<Cliente | null>(null);

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

  const totalActivos = clientes.filter(c => c.estado_pago === 'Activo').length;
  const totalVencidos = clientes.filter(c => c.estado_pago === 'Vencido' || (c.fecha_vencimiento && diasRestantes(c.fecha_vencimiento) < 0)).length;
  const ingresosMes = pagos.filter(p => p.fecha_pago?.startsWith(hoy().slice(0, 7))).reduce((s, p) => s + p.monto, 0);

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando reportes...</div>;

  return (
    <div className="animate-fade-in">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Reportes Financieros</h1>
      
      <ReportesView
        clientes={clientes}
        pagos={pagos}
        totalActivos={totalActivos}
        totalVencidos={totalVencidos}
        ingresosMes={ingresosMes}
        moneda={config.moneda}
        correoVencimientoActivo={config.correo_vencimiento_activo}
        enviandoAvisos={enviandoAvisos}
        onEnviarAvisos={async () => {
          setEnviandoAvisos(true);
          await new Promise(r => setTimeout(r, 1500));
          setEnviandoAvisos(false);
        }}
        onRenovar={setClienteARenovar}
      />

      <RenovarModal 
        cliente={clienteARenovar} 
        planes={planes} 
        moneda={config.moneda} 
        onClose={() => setClienteARenovar(null)} 
        onConfirm={handleRenovar} 
      />
    </div>
  );
}