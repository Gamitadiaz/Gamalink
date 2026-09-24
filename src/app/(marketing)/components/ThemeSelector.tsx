'use client'

import { useTheme } from '@/app/providers'
import { useEffect, useState } from 'react'

export default function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  return (
    <div className="flex bg-[var(--bg-surface)] p-1 rounded-lg border border-[var(--border)] gap-1">
      <button
        onClick={() => setTheme('light')}
        className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${theme === 'light' ? 'bg-[var(--primary)] text-[var(--primary-fg)] shadow-sm' : 'text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--bg-header)]'}`}
        title="Lila Claro"
      >
        🟣
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${theme === 'dark' ? 'bg-[var(--primary)] text-[var(--primary-fg)] shadow-sm' : 'text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--bg-header)]'}`}
        title="Noche Oscura"
      >
        🌙
      </button>
      <button
        onClick={() => setTheme('blue')}
        className={`w-7 h-7 rounded-md flex items-center justify-center transition-all ${theme === 'blue' ? 'bg-[var(--primary)] text-[var(--primary-fg)] shadow-sm' : 'text-[var(--fg-subtle)] hover:text-[var(--fg)] hover:bg-[var(--bg-header)]'}`}
        title="Azul Corporativo"
      >
        🔵
      </button>

      <button
        onClick={() => setTheme('saas')}
        className={`px-2 py-1 text-xs rounded-md transition-all ${theme === 'saas' ? 'bg-[var(--primary)] text-[var(--primary-fg)] shadow-sm' : 'hover:bg-[var(--bg-header)]'}`}
      >
        SaaS
      </button>
    </div>
  )
}