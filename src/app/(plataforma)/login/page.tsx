"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase_config';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMensaje, setErrorMensaje] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMensaje('');
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      setErrorMensaje('Credenciales incorrectas. Intenta de nuevo.');
    } else {
      router.push('/clientes'); 
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0B0F19] text-white">
      <div className="w-full max-w-sm p-8 bg-[#111827] rounded-2xl border border-gray-800 shadow-2xl">
        
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            Gama<span className="text-indigo-500">Link</span>
          </h1>
          <p className="text-xs text-gray-400">Acceso al panel administrativo</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
              Correo Electrónico
            </label>
            <input 
              type="email" 
              placeholder="admin@negocio.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-[10px] font-bold text-gray-400 mb-1.5 uppercase tracking-wider">
              Contraseña
            </label>
            <div className="relative">
              <input 
                type="password" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#1F2937] border border-gray-700 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
            </div>
          </div>

          {errorMensaje && (
            <p className="text-red-400 text-xs text-center">{errorMensaje}</p>
          )}

          <button 
            type="submit" 
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-colors mt-2"
          >
            Iniciar Sesión
          </button>
        </form>
        
        <div className="text-center mt-8 text-[10px] text-gray-500">
          Plataforma segura · GamaLink
        </div>
      </div>
    </div>
  );
}