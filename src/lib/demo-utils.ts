export function hoy(): string {
  return new Date().toISOString().split('T')[0];
}

export function calcularVencimientoPorDias(fechaInicio: string, dias: number): string {
  const d = new Date(fechaInicio + 'T00:00:00');
  d.setDate(d.getDate() + dias);
  return d.toISOString().split('T')[0];
}

export function diasRestantes(fechaVencimiento: string): number {
  return Math.round(
    (new Date(fechaVencimiento + 'T00:00:00').getTime() - new Date(hoy() + 'T00:00:00').getTime()) / 86400000
  );
}

export function formatMoneda(valor: number, moneda: string): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: moneda === 'USD' ? 'USD' : 'MXN',
    minimumFractionDigits: 0,
  }).format(valor);
}

export function formatFecha(fecha: string): string {
  if (!fecha) return '—';
  const [y, m, d] = fecha.split('-');
  const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  return `${d} ${meses[parseInt(m) - 1]} ${y}`;
}
