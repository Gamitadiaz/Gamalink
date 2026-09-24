import Link from 'next/link';

export default function EnDesarrolloPage() {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center min-h-[70vh] text-center">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-200 max-w-md w-full flex flex-col items-center">
        
        
        <h1 className="text-xl font-bold text-gray-800 mb-3">
          Sección en Desarrollo
        </h1>
        
        <p className="text-sm text-gray-500 mb-8 leading-relaxed">
          Estamos construyendo herramientas increíbles para esta sección. Esta función estará disponible en las próximas actualizaciones de GamaLink.
        </p>
        
        <Link 
          href="/clientes" 
          className="w-full block bg-indigo-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
        >
          Volver a Clientes
        </Link>
      </div>
    </div>
  );
}