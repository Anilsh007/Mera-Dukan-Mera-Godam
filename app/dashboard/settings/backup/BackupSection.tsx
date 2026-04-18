"use client"

import Button from "@/app/components/utility/Button"

type BackupSectionProps = {
  isConnected: boolean
  onConnect: () => void
}

export default function BackupSection({
  isConnected,
  onConnect,
}: BackupSectionProps) {
  return (
    <div className="min-h-screen flex items-center justify-center text-center">
      <div className="w-full max-w-md p-4 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-[var(--shadow-card)] text-[var(--text-secondary)]">

        <h2 className="text-xl font-semibold">Backup & Sync</h2>
        <p className="mt-1 text-sm">Manage your Google Drive connection and automatic backup settings.</p>

        <div className="rounded-xl p-4 m-3 border border-[var(--border-card)] bg-[var(--surface-secondary)]">
          <p className="text-sm font-medium">
            Status: {isConnected ? "Connected ✅" : "Not Connected"}
          </p>

          {!isConnected && (
            <p className="mt-2 text-sm text-slate-600">Connect your Google Drive to enable automatic backups.</p>
          )}
        </div>

        {!isConnected && (
          <div className="mt-5 flex justify-center">
            <Button onClick={onConnect} title="Connect Google Drive" />
          </div>
        )}
      </div>
    </div>
  )
}