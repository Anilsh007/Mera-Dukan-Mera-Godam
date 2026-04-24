"use client"

import { ProtectedRoute, Sidebar, Header } from "@/app/components/client/useClient"
import { useState } from "react"
import { Toaster } from "sonner"
import SupabaseSyncManager from "../lib/dataSyncManager"

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-[var(--bg-primary)]">

        <Header onMenuClick={() => setIsOpen(true)} />

        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

          <main className="flex-1 min-w-0 overflow-y-auto p-4 lg:p-6 transition-all duration-300">
            {children}
          </main>
        </div>

        <Toaster richColors position="top-right" />
        <SupabaseSyncManager />
      </div>
    </ProtectedRoute>
  )
}
