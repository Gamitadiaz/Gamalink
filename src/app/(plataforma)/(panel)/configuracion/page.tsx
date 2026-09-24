"use client";

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase_config';
import { Plan, Config, PlanModalMode } from '@/types/demo';

import ConfiguracionView from '@/app/(plataforma)/components/ConfiguracionView';
import PlanModal from '@/app/(plataforma)/components/PlanModal';

const DEFAULT_CONFIG: Config = {
  id: 1, nombre_negocio: '', moneda: 'MXN',
  correo_contacto: '', correo_bienvenida_activo: false, correo_vencimiento_activo: false,
};

export default function ConfiguracionPage() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const [configDraft, setConfigDraft] = useState<Config>(DEFAULT_CONFIG);
  
  const [loading, setLoading] = useState(true);
  const [configLoading, setConfigLoading] = useState(false);
  const [configSaved, setConfigSaved] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'success' } | null>(null);

  const [planSeleccionado, setPlanSeleccionado] = useState<Partial<Plan> | null>(null);
  const [planModalMode, setPlanModalMode] = useState<PlanModalMode>(null);

  const showToast = (message: string, type: 'error' | 'success' = 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), type === 'error' ? 4000 : 2000);
  };

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    const [
      { data: pls }, { data: cfg }
    ] = await Promise.all([
      supabase.from('planes').select('*').order('precio'),
      supabase.from('configuracion').select('*').limit(1),
    ]);
    
    if (pls) setPlanes(pls);
    if (cfg?.[0]) { 
      setConfig(cfg[0]); 
      setConfigDraft(cfg[0]); 
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    cargarDatos();
  }, [cargarDatos]);

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

  const handleCrearPlan = async (data: Partial<Plan>) => {
    const { error } = await supabase.from('planes').insert([{ ...data, activo: true }]);
    if (error) showToast('Error al crear plan: ' + error.message);
    await cargarDatos();
  };

  const handleEditarPlan = async (data: Partial<Plan>) => {
    const { error } = await supabase.from('planes').update(data).eq('id', data.id!);
    if (error) showToast('Error al editar plan: ' + error.message);
    await cargarDatos();
  };

  const togglePlanActivo = async (plan: Plan) => {
    const { error } = await supabase.from('planes').update({ activo: !plan.activo }).eq('id', plan.id);
    if (error) showToast('Error al actualizar plan: ' + error.message);
    await cargarDatos();
  };

  const eliminarPlan = async (id: number) => {
    const { error } = await supabase.from('planes').delete().eq('id', id);
    if (error) showToast('Error al eliminar plan: ' + error.message);
    await cargarDatos();
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Cargando configuración...</div>;

  return (
    <div className="animate-fade-in relative">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Configuración del Sistema</h1>

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

      <PlanModal
        mode={planModalMode} 
        plan={planSeleccionado}
        onClose={() => setPlanModalMode(null)}
        onSave={planModalMode === 'crear' ? handleCrearPlan : handleEditarPlan}
      />

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl text-sm font-bold animate-scale-in"
          style={{ backgroundColor: toast.type === 'error' ? '#ef4444' : 'var(--green)', color: 'white' }}
        >
          <span>{toast.type === 'error' ? '⚠️' : '✅'}</span>
          {toast.message}
        </div>
      )}
    </div>
  );
}