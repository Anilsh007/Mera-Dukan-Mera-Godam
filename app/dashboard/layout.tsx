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

        <div className="flex flex-1 lg:flex-row overflow-hidden">
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

          {/* main — always in-flow, sidebar overlaps via fixed+z-index on mobile */}
          <main className="flex-1 p-4 lg:p-6 overflow-y-auto min-w-0">
            {children}
          </main>
        </div>

        <Toaster richColors position="top-right" />
        <DriveSyncManager />
      </div>
    </ProtectedRoute>
  )
}
