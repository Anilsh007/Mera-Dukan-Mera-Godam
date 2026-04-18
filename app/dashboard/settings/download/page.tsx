"use client"

import { useState } from "react"
import { toast } from "sonner"
import DownloadSection from "./DownloadSection"
import { downloadAllData, downloadByDateRange } from "./download.helpers"

export default function DownloadPage() {
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  const [downloading, setDownloading] = useState(false)

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
    <DownloadSection
      fromDate={fromDate}
      toDate={toDate}
      setFromDate={setFromDate}
      setToDate={setToDate}
      downloading={downloading}
      onDownloadAll={handleDownloadAll}
      onDownloadRange={handleDownloadRange}
    />
  )
}