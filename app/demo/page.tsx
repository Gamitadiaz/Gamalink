"use client";
import { useDemoAdmin } from '@/hooks/useDemoAdmin';
import Sidebar from '@/components/demo/Sidebar';
import Topbar from '@/components/demo/Topbar';
import ClientesView from '@/components/demo/views/ClientesView';
import ReportesView from '@/components/demo/views/ReportesView';
import ConfiguracionView from '@/components/demo/views/ConfiguracionView';
import ClienteModal from '@/components/demo/modals/ClienteModal';
import DeleteModal from '@/components/demo/modals/DeleteModal';
import RenovarModal from '@/components/demo/modals/RenovarModal';
import HistorialModal from '@/components/demo/modals/HistorialModal';
import PlanModal from '@/components/demo/modals/PlanModal';

export default function DemoAdmin() {
  const admin = useDemoAdmin();

  if (admin.loading) {
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

      {admin.sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => admin.setSidebarOpen(false)} />
      )}

      <div className="min-h-screen t-bg flex">
        <Sidebar
          nombreNegocio={admin.config.nombre_negocio}
          vistaActual={admin.vistaActual}
          setVistaActual={admin.setVistaActual}
          clientesCount={admin.clientes.length}
          sidebarOpen={admin.sidebarOpen}
          setSidebarOpen={admin.setSidebarOpen}
        />

        <main className="flex-1 flex flex-col min-w-0">
          <Topbar
            vistaActual={admin.vistaActual}
            setSidebarOpen={admin.setSidebarOpen}
            setClienteSeleccionado={admin.setClienteSeleccionado}
            setModalMode={admin.setModalMode}
          />

          <div className="flex-1 p-4 lg:p-6 overflow-auto">
            {admin.vistaActual === 'clientes' && (
              <ClientesView
                clientes={admin.clientes}
                clientesFiltrados={admin.clientesFiltrados}
                busqueda={admin.busqueda}
                setBusqueda={admin.setBusqueda}
                filtroEstado={admin.filtroEstado}
                setFiltroEstado={admin.setFiltroEstado}
                totalActivos={admin.totalActivos}
                totalVencidos={admin.totalVencidos}
                ingresosMes={admin.ingresosMes}
                moneda={admin.config.moneda}
                setClienteHistorial={admin.setClienteHistorial}
                setClienteARenovar={admin.setClienteARenovar}
                setClienteSeleccionado={admin.setClienteSeleccionado}
                setModalMode={admin.setModalMode}
                setClienteAEliminar={admin.setClienteAEliminar}
              />
            )}
            {admin.vistaActual === 'reportes' && (
              <ReportesView
                clientes={admin.clientes}
                pagos={admin.pagos}
                config={admin.config}
                totalActivos={admin.totalActivos}
                totalVencidos={admin.totalVencidos}
                ingresosMes={admin.ingresosMes}
                enviandoAvisos={admin.enviandoAvisos}
                setEnviandoAvisos={admin.setEnviandoAvisos}
                setClienteARenovar={admin.setClienteARenovar}
              />
            )}
            {admin.vistaActual === 'configuracion' && (
              <ConfiguracionView
                config={admin.config}
                configDraft={admin.configDraft}
                setConfigDraft={admin.setConfigDraft}
                configLoading={admin.configLoading}
                configSaved={admin.configSaved}
                guardarConfig={admin.guardarConfig}
                planes={admin.planes}
                setPlanSeleccionado={admin.setPlanSeleccionado}
                setPlanModalMode={admin.setPlanModalMode}
                togglePlanActivo={admin.togglePlanActivo}
                eliminarPlan={admin.eliminarPlan}
              />
            )}
          </div>
        </main>
      </div>

      <ClienteModal
        mode={admin.modalMode}
        cliente={admin.clienteSeleccionado}
        planes={admin.planes}
        onClose={() => admin.setModalMode(null)}
        onSave={admin.modalMode === 'crear' ? admin.handleCrear : admin.handleEditar}
      />
      <DeleteModal
        cliente={admin.clienteAEliminar}
        onClose={() => admin.setClienteAEliminar(null)}
        onConfirm={admin.handleEliminar}
      />
      <RenovarModal
        cliente={admin.clienteARenovar}
        planes={admin.planes}
        moneda={admin.config.moneda}
        onClose={() => admin.setClienteARenovar(null)}
        onConfirm={admin.handleRenovar}
      />
      <HistorialModal
        cliente={admin.clienteHistorial}
        pagos={admin.pagos}
        moneda={admin.config.moneda}
        onClose={() => admin.setClienteHistorial(null)}
      />
      <PlanModal
        mode={admin.planModalMode}
        plan={admin.planSeleccionado}
        onClose={() => admin.setPlanModalMode(null)}
        onSave={admin.planModalMode === 'crear' ? admin.handleCrearPlan : admin.handleEditarPlan}
      />
    </>
  );
}
