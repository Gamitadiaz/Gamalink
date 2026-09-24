import { Cliente, Pago } from '@/types/demo';
import { formatMoneda, formatFecha } from '@/lib/demo-utils';

interface Props {
  cliente: Cliente | null;
  pagos: Pago[];
  moneda: string;
  onClose: () => void;
}

export default function HistorialModal({ cliente, pagos, moneda, onClose }: Props) {
  if (!cliente) return null;

  const historial = pagos
    .filter(p => p.cliente_id === cliente.id)
    .sort((a, b) => new Date(b.fecha_pago).getTime() - new Date(a.fecha_pago).getTime());

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="t-card rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between px-6 pt-6 pb-4" style={{ borderBottom: '1px solid var(--border)' }}>
          <div>
            <h2 className="text-lg font-black t-text">📋 Historial de Pagos</h2>
            <p className="text-sm t-muted mt-0.5">{cliente.nombre}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full t-hover t-subtle transition">✕</button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">
          {historial.length === 0 ? (
            <p className="text-center t-subtle py-8">Sin pagos registrados.</p>
          ) : (
            <div className="space-y-3">
              {historial.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-xl t-surface" style={{ border: '1px solid var(--border)' }}>
                  <div>
                    <p className="font-bold t-text text-sm">{formatMoneda(p.monto, moneda)}</p>
                    <p className="text-xs t-muted">{formatFecha(p.fecha_pago)} · {p.metodo_pago}</p>
                    {p.notas && <p className="text-xs t-subtle mt-0.5 italic">"{p.notas}"</p>}
                  </div>
                  <span className="t-badge">{p.plan}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
