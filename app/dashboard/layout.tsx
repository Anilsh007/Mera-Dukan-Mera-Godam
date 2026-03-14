"use client";
import { ProtectedRoute, Sidebar, Header } from "@/app/components/client/useClient";
import { useState } from "react";
import { Toaster } from "sonner";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  return (
    <ProtectedRoute>
      <Header onMenuClick={() => setIsOpen(true)} />
      <div style={{ display: "flex", minHeight: "91vh", background: "var(--bg-primary)" }}>
        <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />
        <div style={{ padding: "24px", flex: 1 }}>
          {children}
          <Toaster richColors position="top-right" />
        </div>
      </div>
    </ProtectedRoute>
  );
}
