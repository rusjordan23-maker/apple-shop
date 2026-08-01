'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminNav() {
  const pathname = usePathname()
  const links = [
    { href: '/admin/dashboard', label: 'Дашборд' },
    { href: '/admin/products', label: 'Товары' },
    { href: '/admin/orders', label: 'Заказы' },
    { href: '/admin/settings', label: 'Настройки' },
    { href: '/admin/logs', label: 'Логи' },
  ]

  return (
    <nav className="bg-gray-100 p-4 rounded mb-6 flex flex-wrap gap-4">
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`px-4 py-2 rounded ${pathname === link.href ? 'bg-blue-600 text-white' : 'bg-white hover:bg-gray-200'}`}
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}