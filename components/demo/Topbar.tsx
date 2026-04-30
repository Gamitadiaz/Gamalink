"use client";
import type { ModalMode } from '@/lib/types';

type Vista = 'clientes' | 'reportes' | 'configuracion';

type Props = {
  vistaActual: Vista;
  setSidebarOpen: (v: boolean) => void;
  setClienteSeleccionado: (c: null) => void;
  setModalMode: (m: ModalMode) => void;
};

const TITLES: Record<Vista, string> = {
  clientes:      '👥 Clientes',
  reportes:      '📊 Reportes',
  configuracion: '⚙️ Configuración',
};

export default function Topbar({ vistaActual, setSidebarOpen, setClienteSeleccionado, setModalMode }: Props) {
  return (
    <header className="sticky top-0 z-30 px-4 lg:px-6 py-3 flex items-center gap-3"
      style={{ backgroundColor: 'color-mix(in srgb, var(--bg-card) 85%, transparent)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(8px)' }}>
      <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-xl t-hover transition">
        <svg className="w-5 h-5 t-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="font-black t-text text-base flex-1">{TITLES[vistaActual]}</h1>
      {vistaActual === 'clientes' && (
        <button onClick={() => { setClienteSeleccionado(null); setModalMode('crear'); }}
          className="t-btn text-sm px-4 py-2">
          <span className="text-base leading-none">+</span> Nuevo
        </button>
      )}
    </header>
  );
}
