"use client";
import { ProtectedRoute, Sidebar, Header } from "@/app/components/client/useClient";
import { useState } from "react";
import { Toaster } from "sonner";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <ProtectedRoute>
      <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
        <Header onMenuClick={() => setIsOpen(true)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
          <div className="flex-1 p-6 overflow-y-auto">
            {children}
            <Toaster richColors position="top-right" />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}