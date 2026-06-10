import type { Metadata } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'BlockBuilder + Next.js SSR',
  description: 'Пример SSR-интеграции BlockBuilder с Next.js App Router',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
