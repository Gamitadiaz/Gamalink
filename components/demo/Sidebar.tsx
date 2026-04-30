"use client";
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase_config';

type Vista = 'clientes' | 'reportes' | 'configuracion';

type Props = {
  nombreNegocio: string;
  vistaActual: Vista;
  setVistaActual: (v: Vista) => void;
  clientesCount: number;
  sidebarOpen: boolean;
  setSidebarOpen: (v: boolean) => void;
};

const NAV_ITEMS = [
  { id: 'clientes',      label: 'Clientes',     emoji: '👥' },
  { id: 'reportes',      label: 'Reportes',      emoji: '📊' },
  { id: 'configuracion', label: 'Configuración', emoji: '⚙️'  },
] as const;

export default function Sidebar({ nombreNegocio, vistaActual, setVistaActual, clientesCount, sidebarOpen, setSidebarOpen }: Props) {
  const router = useRouter();

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 t-sidebar flex flex-col transform transition-transform duration-300 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
      style={{ borderRight: '1px solid var(--border)' }}>

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
            <p className="text-[10px] t-sidebar-muted mt-0.5 truncate max-w-[130px]">{nombreNegocio || 'Panel Admin'}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map(item => (
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
                {clientesCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition"
          style={{ color: '#f87171' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'color-mix(in srgb, #ef4444 15%, transparent)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'transparent')}>
          <span>🚪</span> Cerrar Sesión
        </button>
      </div>
    </aside>
  );
}
