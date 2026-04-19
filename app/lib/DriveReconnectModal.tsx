"use client"

import { FC } from "react"
import Button from "@/app/components/utility/Button"

interface Props {
  isOpen: boolean
  onClose: () => void
  onConnect: () => void
}

const DriveReconnectModal: FC<Props> = ({ isOpen, onClose, onConnect }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50 p-4">
      <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] p-6 w-full max-w-sm shadow-2xl">
        <div className="text-center mb-5">
          <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl">
            ☁️
          </div>
          <h2 className="text-lg font-bold text-[var(--text-primary)]">Drive Disconnect Ho Gaya</h2>
          <p className="text-sm text-[var(--text-muted)] mt-2 leading-relaxed">
            Google Drive se connection toot gaya hai. Data sync karne ke liye reconnect karo.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost"   onClick={onClose}   title="Baad mein"    className="flex-1" />
          <Button variant="primary" onClick={onConnect} title="Reconnect ✓"  className="flex-1" />
        </div>
      </div>
    </div>
  )
}

export default DriveReconnectModal
