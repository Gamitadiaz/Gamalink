"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase_config';

export default function LoginAdmin() {
  const router = useRouter();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      setError('Correo o contraseña incorrectos. Intenta de nuevo.');
      setLoading(false);
    } else {
      router.push('/demo_admin');
    }
  };

  return (
    <>
      <style>{`
        @keyframes fade-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-up { animation: fade-up 0.4s ease-out both; }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.15; transform: scale(1); }
          50%       { opacity: 0.25; transform: scale(1.05); }
        }
        .blob { animation: pulse-slow 6s ease-in-out infinite; }
        .blob-2 { animation: pulse-slow 8s ease-in-out infinite reverse; }
      `}</style>

      <div className="min-h-screen bg-gray-950 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">

        {/* Blobs decorativos de fondo */}
        <div className="blob absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-600 blur-[120px] pointer-events-none" />
        <div className="blob-2 absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] rounded-full bg-indigo-600 blur-[100px] pointer-events-none" />

        {/* Card */}
        <div className="relative z-10 w-full max-w-sm animate-fade-up">

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/40">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Panel<span className="text-blue-400">Pro</span>
              </span>
            </div>
            <p className="text-gray-500 text-sm">Acceso al panel administrativo</p>
          </div>

          {/* Form card */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 shadow-2xl">

            {/* Error */}
            {error && (
              <div className="mb-5 flex items-start gap-2.5 bg-red-950/60 border border-red-800/60 text-red-400 text-sm px-4 py-3 rounded-xl font-medium">
                <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@negocio.com"
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-xl px-4 py-3 pr-11 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                    tabIndex={-1}
                  >
                    {showPass ? (
                      // Ojo cerrado
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      // Ojo abierto
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/25 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Verificando...
                  </>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center text-gray-600 text-xs mt-6">
            Plataforma segura · <span className="text-gray-500">PanelPro</span>
          </p>
        </div>
      </div>
    </>
  );
}
