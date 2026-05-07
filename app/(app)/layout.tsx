import { TabBar } from '@/components/layout/TabBar'

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-bg pb-24">
      <div className="max-w-md mx-auto">
        {children}
      </div>
      <TabBar />
    </div>
  )
}
