'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ConfigThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const temas = [
    { id: 'light', nombre: 'Lila Claro', icon: '🟣', desc: 'Identidad original Gamalink' },
    { id: 'dark',  nombre: 'Lila Oscura', icon: '🌙', desc: 'Alto contraste para la noche' },
    { id: 'blue',  nombre: 'Azul Corp', icon: '🔵', desc: 'Estilo profesional clásico' },
    { id: 'saas',  nombre: 'Modo SaaS', icon: '🏢', desc: 'Sidebar oscuro y panel limpio' },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
      {temas.map((t) => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          className={`flex items-center gap-4 p-4 rounded-xl border transition-all text-left ${
            theme === t.id 
              ? 'border-[var(--primary)] bg-[var(--bg-surface)] ring-2 ring-[var(--primary)]/20' 
              : 'border-[var(--border)] bg-[var(--bg-card)] hover:border-[var(--primary)]'
          }`}
        >
          <div className="text-2xl">{t.icon}</div>
          <div>
            <p className="font-bold t-text text-sm">{t.nombre}</p>
            <p className="t-subtle text-xs">{t.desc}</p>
          </div>
          {theme === t.id && <span className="ml-auto">✅</span>}
        </button>
      ))}
    </div>
  )
}