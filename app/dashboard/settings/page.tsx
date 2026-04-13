"use client"

import { useEffect, useState } from "react"
import { getGoogleDriveAccessToken } from "@/app/lib/auth.service"
import { db } from "@/app/lib/db"
import { toast } from "sonner"
import Button from "@/app/components/utility/Button"
import Input from "@/app/components/utility/CommonInput"

// ─────────────────────────────────────────────────────────────
// CSV download helper
// ─────────────────────────────────────────────────────────────
function toCSV(rows: Record<string, any>[], headers: string[]): string {
  const escape = (val: any) => {
    const str = val === null || val === undefined ? "" : String(val)
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str
  }
  const lines = [
    headers.join(","),
    ...rows.map(r => headers.map(h => escape(r[h])).join(",")),
  ]
  return lines.join("\n")
}

function downloadFile(content: string, filename: string) {
  const blob = new Blob(["\uFEFF" + content], { type: "text/csv;charset=utf-8;" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function formatDate(iso: string) {
  if (!iso) return "-"
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: true,
  })
}

// ─────────────────────────────────────────────────────────────
// Download functions
// ─────────────────────────────────────────────────────────────
async function downloadAllData() {
  const [products, logs] = await Promise.all([
    db.products.toArray(),
    db.productLogs.toArray(),
  ])

  // Product ID → Name map
  const nameMap: Record<number, string> = {}
  products.forEach(p => { if (p.id) nameMap[p.id] = p.name })

  // Products CSV
  const productHeaders = ["id", "name", "category", "price", "quantity", "supplier", "expiry", "sku", "note", "createdAt"]
  const productRows = products.map(p => ({
    id: p.id, name: p.name, category: p.category || "",
    price: p.price, quantity: p.quantity, supplier: p.supplier || "",
    expiry: p.expiry || "", sku: p.sku || "", note: p.note || "",
    createdAt: formatDate(p.createdAt),
  }))

  // Logs CSV
  const logHeaders = ["id", "productName", "type", "quantity", "price", "expiry", "reason", "note", "date"]
  const logRows = logs.map(l => ({
    id: l.id,
    productName: nameMap[l.productId] || "-",
    type: l.quantityAdded > 0 ? "Stock In" : "Stock Out",
    quantity: Math.abs(l.quantityAdded),
    price: l.price,
    expiry: l.expiry || "",
    reason: l.reason || "",
    note: l.note || "",
    date: formatDate(l.date),
  }))

  downloadFile(toCSV(productRows, productHeaders), "products_all.csv")
  setTimeout(() => downloadFile(toCSV(logRows, logHeaders), "logs_all.csv"), 500)

  toast.success(`✅ Downloaded — ${products.length} products, ${logs.length} logs`)
}

async function downloadByDateRange(from: string, to: string) {
  if (!from || !to) { toast.error("Dono dates select karo"); return }

  const fromDate = new Date(from)
  const toDate = new Date(to)
  toDate.setHours(23, 59, 59, 999) // to date ka poora din include karo

  if (fromDate > toDate) { toast.error("From date, To date se pehle honi chahiye"); return }

  const [products, logs] = await Promise.all([
    db.products.toArray(),
    db.productLogs.toArray(),
  ])

  const nameMap: Record<number, string> = {}
  products.forEach(p => { if (p.id) nameMap[p.id] = p.name })

  // Date range ke andar ke logs
  const filteredLogs = logs.filter(l => {
    const d = new Date(l.date)
    return d >= fromDate && d <= toDate
  })

  if (!filteredLogs.length) {
    toast.error("Is date range mein koi record nahi mila")
    return
  }

  const logHeaders = ["id", "productName", "type", "quantity", "price", "expiry", "reason", "note", "date"]
  const logRows = filteredLogs.map(l => ({
    id: l.id,
    productName: nameMap[l.productId] || "-",
    type: l.quantityAdded > 0 ? "Stock In" : "Stock Out",
    quantity: Math.abs(l.quantityAdded),
    price: l.price,
    expiry: l.expiry || "",
    reason: l.reason || "",
    note: l.note || "",
    date: formatDate(l.date),
  }))

  const label = `${from}_to_${to}`
  downloadFile(toCSV(logRows, logHeaders), `logs_${label}.csv`)
  toast.success(`✅ ${filteredLogs.length} records downloaded`)
}

// ─────────────────────────────────────────────────────────────
// Settings Page
// ─────────────────────────────────────────────────────────────
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
        } else throw new Error("No token")
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
    try { await downloadAllData() }
    catch { toast.error("Download failed ❌") }
    finally { setDownloading(false) }
  }

  async function handleDownloadRange() {
    setDownloading(true)
    try { await downloadByDateRange(fromDate, toDate) }
    catch { toast.error("Download failed ❌") }
    finally { setDownloading(false) }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">

        {/* ── Google Drive Card ── */}
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Backup Settings</h2>

          <div className="flex items-center bg-[var(--bg-sidebar)] justify-between p-4 rounded-lg">
            <span className="font-medium">Google Drive</span>
            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isConnected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
              }`}>
              {isConnected ? "Connected ✅" : "Not Connected"}
            </span>
          </div>

          {!isConnected && (
            <Button onClick={connectDrive} variant="primary" title="Connect Google Drive" className="w-full" />
          )}

          <p className="text-sm text-[var(--text-muted)] text-center">
            Data automatically sync hota hai Drive par connection ke baad.
          </p>
        </div>

        {/* ── Download All Data Card ── */}
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-6 space-y-3">
          <h2 className="text-xl font-semibold">Download Data</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Saare products aur stock logs CSV format mein download karo.
          </p>
          <Button onClick={handleDownloadAll} loading={downloading} variant="primary" title="⬇ Download All Data" className="w-full" />
        </div>

        {/* ── Download by Date Range Card ── */}
        <div className="bg-[var(--bg-card)] rounded-2xl shadow-lg p-6 space-y-4">
          <h2 className="text-xl font-semibold">Download by Date Range</h2>
          <p className="text-sm text-[var(--text-muted)]">
            Sirf ek date range ke stock logs download karo.
          </p>

          <div className="flex gap-3">
            <div className="flex-1">
              <Input label="From" type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} />
            </div>
            <div className="flex-1">
              <Input label="To" type="date" value={toDate} onChange={e => setToDate(e.target.value)} />
            </div>
          </div>

          <Button onClick={handleDownloadRange} loading={downloading} variant="black" title="⬇ Download Range" className="w-full" disabled={!fromDate || !toDate} />
        </div>

      </div>
    </div>
  )
}
