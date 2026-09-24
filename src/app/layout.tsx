import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Gamalink | Soluciones de Software',
  description: 'Desarrollo web y sistemas a la medida',
}

const THEME_INIT = `(function(){try{var t=localStorage.getItem('theme')||'light';document.documentElement.className=t}catch(e){}})()`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}