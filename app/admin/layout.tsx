import AdminNav from '@/components/AdminNav'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="container mx-auto px-4 py-4">
      <AdminNav />
      {children}
    </div>
  )
}