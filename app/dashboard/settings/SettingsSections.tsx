// all-stock/settings/SettingsSections.tsx
"use client"

import Button from "@/app/components/utility/Button"
import Input from "@/app/components/utility/CommonInput"

type DriveCardProps = {
  isConnected: boolean
  onConnect: () => void
}

export function DriveConnectionCard({
  isConnected,
  onConnect,
}: DriveCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        Google Drive
      </h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        {isConnected ? "Connected ✅" : "Not Connected"}
      </p>
      {!isConnected && (
        <div className="mt-4">
          <Button title="Connect Drive" variant="success" onClick={onConnect} />
        </div>
      )}
      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        Data automatically sync hota hai Drive par connection ke baad.
      </p>
    </div>
  )
}

type DownloadAllCardProps = {
  downloading: boolean
  onDownload: () => void
}

export function DownloadAllCard({
  downloading,
  onDownload,
}: DownloadAllCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        Download Data
      </h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Saare products aur stock logs CSV format mein download karo.
      </p>
      <div className="mt-4">
        <Button
          title={downloading ? "Downloading..." : "Download All Data"}
          variant="outline"
          onClick={onDownload}
        />
      </div>
    </div>
  )
}

type DateRangeCardProps = {
  fromDate: string
  toDate: string
  downloading: boolean
  setFromDate: (val: string) => void
  setToDate: (val: string) => void
  onDownload: () => void
}

export function DateRangeDownloadCard({
  fromDate,
  toDate,
  downloading,
  setFromDate,
  setToDate,
  onDownload,
}: DateRangeCardProps) {
  return (
    <div className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 shadow-[var(--shadow-card)]">
      <h2 className="text-lg font-semibold text-[var(--text-primary)]">
        Download by Date Range
      </h2>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        Sirf ek date range ke stock logs download karo.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label="From Date"
          type="date"
          value={fromDate}
          onChange={(e) => setFromDate(e.target.value)}
        />
        <Input
          label="To Date"
          type="date"
          value={toDate}
          onChange={(e) => setToDate(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <Button
          title={downloading ? "Downloading..." : "Download Logs"}
          variant="success"
          onClick={onDownload}
        />
      </div>
    </div>
  )
}