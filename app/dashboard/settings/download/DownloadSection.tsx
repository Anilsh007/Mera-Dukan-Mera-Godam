"use client"

import Button from "@/app/components/utility/Button"
import Input from "@/app/components/utility/CommonInput"

type DownloadSectionProps = {
  fromDate: string
  toDate: string
  setFromDate: (value: string) => void
  setToDate: (value: string) => void
  downloading: boolean
  onDownloadAll: () => void
  onDownloadRange: () => void
}

export default function DownloadSection({
  fromDate,
  toDate,
  setFromDate,
  setToDate,
  downloading,
  onDownloadAll,
  onDownloadRange,
}: DownloadSectionProps) {
  return (

    <div className="p-4 sm:p-6 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-2xl shadow-[var(--shadow-card)]">
      <div className="flex justify-between gap-2">
        <h2 className="text-xl font-semibold">Download Data</h2>
        <Button onClick={onDownloadAll} disabled={downloading} title={`${downloading ? "Downloading..." : "Download All"}`} />
      </div>

      <p className="mt-1 text-sm">Download between date range</p>


      <div className="mt-5 flex justify-between">
        <Input type="date" value={fromDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFromDate(e.target.value)} />
        <Input type="date" value={toDate} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setToDate(e.target.value)} />
        <Button onClick={onDownloadRange} disabled={downloading} title={`${downloading ? "Downloading..." : "Download Range"}`} />
      </div>

    </div>

  )
}