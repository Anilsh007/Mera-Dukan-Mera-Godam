"use client"

import { ProtectedRoute, Sidebar, Header } from "@/app/components/client/useClient"
import { useState } from "react"
import { Toaster } from "sonner"
import DriveSyncManager from "@/app/lib/DriveSyncManager"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
        <Header onMenuClick={() => setIsOpen(true)} />
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

          <main className="flex-1 px-3 py-4 lg:relative absolute lg:p-6 overflow-y-auto">
            {children}
            <Toaster richColors position="top-right" />
          </main>
        </div>

        {/* Drive Sync / Reconnect Logic */}
        <DriveSyncManager />
      </div>
    </ProtectedRoute>
  )
}