"use client"

import { useEffect, useState } from "react"
import { getGoogleDriveAccessToken } from "@/app/lib/auth.service"
import { toast } from "sonner"
import {
  downloadAllData,
  downloadByDateRange,
} from "./settings.helpers"
import {
  DateRangeDownloadCard,
  DownloadAllCard,
  DriveConnectionCard,
} from "./SettingsSections"

export default function SettingsPage() {
  const [isConnected, setIsConnected] = useState(false)
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [downloading, setDownloading] = useState(false)

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

  async function handleDownloadAll() {
    setDownloading(true)
    try {
      await downloadAllData()
    } catch {
      toast.error("Download failed ❌")
    } finally {
      setDownloading(false)
    }
  }

  async function handleDownloadRange() {
    setDownloading(true)
    try {
      await downloadByDateRange(fromDate, toDate)
    } catch {
      toast.error("Download failed ❌")
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text-primary)]">
          Backup Settings
        </h1>
      </div>

      <DriveConnectionCard
        isConnected={isConnected}
        onConnect={connectDrive}
      />

      <DownloadAllCard
        downloading={downloading}
        onDownload={handleDownloadAll}
      />

      <DateRangeDownloadCard
        fromDate={fromDate}
        toDate={toDate}
        downloading={downloading}
        setFromDate={setFromDate}
        setToDate={setToDate}
        onDownload={handleDownloadRange}
      />
    </div>
  )
}