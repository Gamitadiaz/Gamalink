"use client";
import { Config, Plan } from '@/types/demo';
import { formatMoneda } from '@/lib/demo-utils';
import Toggle from './Toggle';
import ConfigThemeSelector from '@/components/ConfigThemeSelector';

interface Props {
  configDraft: Config;
  planes: Plan[];
  moneda: string;
  configLoading: boolean;
  configSaved: boolean;
  onConfigChange: (c: Config) => void;
  onGuardarConfig: () => void;
  onNuevoPlan: () => void;
  onEditarPlan: (p: Plan) => void;
  onTogglePlanActivo: (p: Plan) => void;
  onEliminarPlan: (id: number) => void;
}

export default function ConfiguracionView({
  configDraft, planes, moneda, configLoading, configSaved,
  onConfigChange, onGuardarConfig,
  onNuevoPlan, onEditarPlan, onTogglePlanActivo, onEliminarPlan,
}: Props) {
  return (
    <div className="animate-fade-in space-y-6">

      {/* Datos del negocio */}
      <div className="t-card p-4 lg:p-6 rounded-2xl shadow-sm" style={{ border: '1px solid var(--border)' }}>
        <h3 className="text-lg font-black t-text mb-4">🏢 Datos del Negocio</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1">Nombre del Negocio</label>
            <input type="text" value={configDraft.nombre_negocio}
              onChange={e => onConfigChange({ ...configDraft, nombre_negocio: e.target.value })} className="t-input" />
            <p className="text-xs t-subtle mt-1">Aparece en el panel y en los correos enviados.</p>
          </div>
          <div>
            <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1">Moneda</label>
            <select value={configDraft.moneda} onChange={e => onConfigChange({ ...configDraft, moneda: e.target.value })} className="t-input">
              <option value="MXN">MXN — Pesos Mexicanos</option>
              <option value="USD">USD — Dólares</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold t-muted uppercase tracking-widest mb-1">Correo de contacto</label>
            <input type="email" value={configDraft.correo_contacto || ''}
              onChange={e => onConfigChange({ ...configDraft, correo_contacto: e.target.value })}
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
            <Toggle value={configDraft.correo_bienvenida_activo} onChange={v => onConfigChange({ ...configDraft, correo_bienvenida_activo: v })} />
          </div>
          <div className="flex items-start justify-between gap-4 pt-5" style={{ borderTop: '1px solid var(--border)' }}>
            <div>
              <h4 className="font-bold t-text text-sm">Aviso de Vencimiento</h4>
              <p className="text-xs t-muted mt-0.5">Activa el botón de avisos en Reportes (clientes que vencen en 3 días).</p>
            </div>
            <Toggle value={configDraft.correo_vencimiento_activo} onChange={v => onConfigChange({ ...configDraft, correo_vencimiento_activo: v })} />
          </div>
        </div>
      </div>

      {/* Planes de membresía */}
      <div className="t-card rounded-2xl shadow-sm overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="p-4 lg:p-6 flex items-center justify-between t-header" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h3 className="text-lg font-black t-text">💳 Planes de Membresía</h3>
            <p className="text-sm t-muted">Los precios se reflejan en los reportes de ingresos.</p>
          </div>
          <button onClick={onNuevoPlan} className="t-btn text-xs px-3 py-2 whitespace-nowrap">
            + Nuevo Plan
          </button>
        </div>
        <div>
          {planes.length === 0 ? (
            <p className="p-6 text-sm t-subtle text-center">No hay planes creados.</p>
          ) : planes.map((plan, i) => (
            <div key={plan.id}
              className={`p-4 lg:p-5 flex items-center gap-4 t-hover transition ${!plan.activo ? 'opacity-50' : ''}`}
              style={{ borderBottom: i < planes.length - 1 ? '1px solid var(--border)' : 'none' }}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold t-text text-sm">{plan.nombre}</p>
                  {!plan.activo && <span className="t-badge text-[10px]">Inactivo</span>}
                </div>
                <p className="text-xs t-muted mt-0.5">{formatMoneda(plan.precio, moneda)} · {plan.duracion_dias} días</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => onEditarPlan(plan)} className="text-xs t-primary font-bold hover:underline">Editar</button>
                <button onClick={() => onTogglePlanActivo(plan)} className="text-xs t-muted font-bold hover:underline">
                  {plan.activo ? 'Desactivar' : 'Activar'}
                </button>
                <button onClick={() => onEliminarPlan(plan.id)} className="text-xs font-bold hover:underline" style={{ color: '#f87171' }}>
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={onGuardarConfig} disabled={configLoading} className="t-btn px-8 py-3">
          {configLoading
            ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            : configSaved ? '✅ Guardado' : 'Guardar Cambios'}
        </button>
      </div>

      {/* Apariencia */}
      <div className="t-card p-6 rounded-2xl shadow-sm border border-[var(--border)]">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[var(--bg-surface)] rounded-lg text-xl">🎨</div>
          <div>
            <h2 className="text-xl font-black t-text">Apariencia del Sistema</h2>
            <p className="t-subtle text-sm">Personaliza cómo se ve tu panel administrativo de Gamalink.</p>
          </div>
        </div>
        <ConfigThemeSelector />
      </div>
    </div>
  );
}
