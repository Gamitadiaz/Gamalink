"use client";
import { useState } from 'react';
import type { Cliente } from '@/lib/types';

export default function DeleteModal({ cliente, onClose, onConfirm }: {
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
