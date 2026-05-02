import './globals.css'
import Script from 'next/script'
import { Providers } from './providers'

export const metadata = {
  title: 'Gamalink | Soluciones de Software',
  description: 'Desarrollo web y sistemas a la medida',
}

const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.className=t}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: THEME_INIT }}
        />
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}
