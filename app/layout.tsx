import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'
import UserMenu from '@/components/UserMenu'

export const metadata: Metadata = {
  title: 'Apple Shop',
  description: 'Подбор техники Apple с помощью ИИ',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-3 flex justify-between items-center">
            <Link href="/" className="text-xl font-bold">🍏 Apple Shop</Link>
            <div className="flex items-center space-x-4">
              <Link href="/catalog" className="hover:text-blue-600">Каталог</Link>
              <Link href="/cart" className="hover:text-blue-600">Корзина</Link>
              <UserMenu />
            </div>
          </div>
        </nav>
        <main>{children}</main>
      </body>
    </html>
  )
}