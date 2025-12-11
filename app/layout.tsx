import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '店舗予約システム',
  description: '店舗管理者向け予約システム',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  )
}
