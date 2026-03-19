"use client";
import { ProtectedRoute, Sidebar, Header } from "@/app/components/client/useClient";
import { useEffect, useState } from "react";
import { Toaster } from "sonner";
import { autoSyncToDrive } from "../lib/autoSync.service";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    autoSyncToDrive()
  }, [])

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
        <Header onMenuClick={() => setIsOpen(true)} />
        <div className="flex flex-1 flex-col lg:flex-row overflow-hidden">
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
          <div className="flex-1 px-3 py-4 lg:relative absolute lg:p-6 overflow-y-auto">
            {children}
            <Toaster richColors position="top-right" />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}