import './globals.css'
import { Providers } from './providers'

export const metadata = {
  title: 'Gamalink | Soluciones de Software',
  description: 'Desarrollo web y sistemas a la medida',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}