"use client"

import { useEffect, useState } from "react"
import { getGoogleDriveAccessToken } from "@/app/lib/auth.service"
import { toast } from "sonner"
import BackupSection from "./BackupSection"

export default function BackupPage() {
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    async function checkConnection() {
      try {
        const token = await getGoogleDriveAccessToken()

        if (token) {
          setIsConnected(true)
          localStorage.setItem("drive_connected", "true")
        } else {
          throw new Error("No token")
        }
      } catch {
        setIsConnected(false)
        localStorage.setItem("drive_connected", "false")
      }
    }

    checkConnection()
  }, [])

  async function connectDrive() {
    try {
      const token = await getGoogleDriveAccessToken()
      if (!token) throw new Error()

      localStorage.setItem("drive_connected", "true")
      setIsConnected(true)
      toast.success("Drive connected ✅")
    } catch {
      localStorage.setItem("drive_connected", "false")
      setIsConnected(false)
      toast.error("Connection failed ❌")
    }
  }

  return <BackupSection isConnected={isConnected} onConnect={connectDrive} />
}