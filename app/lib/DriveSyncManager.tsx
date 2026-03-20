"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { autoSyncToDrive } from "@/app/lib/autoSync.service"
import { getGoogleDriveAccessToken } from "@/app/lib/auth.service"
import DriveReconnectModal from "@/app/components/reuseModule/DriveReconnectModal"

export default function DriveSyncManager() {
  const [showReconnectModal, setShowReconnectModal] = useState(false)

  /** Initial + online sync */
  useEffect(() => {
    autoSyncToDrive()

    const handleOnline = () => {
      autoSyncToDrive()
    }

    window.addEventListener("online", handleOnline)
    return () => window.removeEventListener("online", handleOnline)
  }, [])

  /** Background sync every 5 min */
  useEffect(() => {
    const interval = setInterval(() => {
      autoSyncToDrive()
    }, 300000) // 5 minutes

    return () => clearInterval(interval)
  }, [])

  /** Check Drive connection every 5 sec */
  useEffect(() => {
    const interval = setInterval(() => {
      const isConnected = localStorage.getItem("drive_connected")
      if (!isConnected || !navigator.onLine) {
        setShowReconnectModal(true)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  /** Reconnect handler */
  const handleReconnect = async () => {
    try {
      const token = await getGoogleDriveAccessToken(true) // manual popup
      if (!token) throw new Error("Connection failed")

      localStorage.setItem("drive_connected", "true")
      setShowReconnectModal(false)
      toast.success("Drive reconnected ✅")

      autoSyncToDrive()
    } catch {
      toast.error("Connection failed ❌")
    }
  }

  return (
    <DriveReconnectModal
      isOpen={showReconnectModal}
      onClose={() => setShowReconnectModal(false)}
      onConnect={handleReconnect}
    />
  )
}