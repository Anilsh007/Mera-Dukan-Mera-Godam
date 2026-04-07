"use client"

import { useMemo, useState } from "react"
import TableComponent, { TableItem } from "@/app/components/utility/CommonTable"
import { Product } from "@/app/lib/db"
import Button from "@/app/components/utility/Button"

type Log = {
  id: string
  date: string
  quantityAdded: number
  type?: "in" | "out"
  reason?: string
  price: number
  expiry?: string
  note?: string
  productId?: number
}

// "15 Jan 2025, 03:45 PM" format
function formatDateTime(iso: string) {
  if (!iso) return "-"
  return new Date(iso).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

// Log ko TableItem mein convert karo
function logToRow(l: Log, productName: string): TableItem {
  const isIn = l.quantityAdded > 0
  return {
    id: Number(l.id),
    name: productName,
    category: isIn ? "Stock In ↑" : "Stock Out ↓",
    supplier: l.reason || "-",
    expiry: l.expiry || "-",
    price: l.price,
    quantity: Math.abs(l.quantityAdded),
    createdAt: formatDateTime(l.date),
    note: l.note || "-",
  }
}

export default function StockHistoryTabs({
  logs,
  products,
}: {
  logs: Log[]
  products: Product[]
}) {
  const [tab, setTab] = useState<"all" | "in" | "out">("all")

  // productId → name map (quick lookup)
  const productMap = useMemo(() => {
    const map: Record<number, string> = {}
    products.forEach(p => { if (p.id) map[p.id] = p.name })
    return map
  }, [products])

  const totalIn = logs
    .filter(l => l.quantityAdded > 0)
    .reduce((s, l) => s + l.quantityAdded, 0)

  const totalOut = logs
    .filter(l => l.quantityAdded < 0)
    .reduce((s, l) => s + Math.abs(l.quantityAdded), 0)

  const tableData: TableItem[] = useMemo(() => {
    // Filter by tab
    const filtered =
      tab === "all"
        ? [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        : logs
            .filter(l => tab === "in" ? l.quantityAdded > 0 : l.quantityAdded < 0)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return filtered.map(l => {
      const productName = l.productId
        ? (productMap[l.productId] || "-")
        : (products[0]?.name || "-")
      return logToRow(l, productName)
    })
  }, [tab, logs, productMap, products])

  const tabs = [
    { key: "all", label: `All (${logs.length})` },
    { key: "in",  label: `Stock In (${logs.filter(l => l.quantityAdded > 0).length})` },
    { key: "out", label: `Stock Out (${logs.filter(l => l.quantityAdded < 0).length})` },
  ]

  return (
    <div className="p-5 rounded-xl bg-[var(--bg-card)] border-[var(--border-card)] shadow-[var(--shadow-card)]">

      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Stock Activity</h3>
        <div className="text-sm">
          <span className="text-emerald-600 mr-3">↑ In: {totalIn}</span>
          <span className="text-red-500">↓ Out: {totalOut}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {tabs.map(t => (
          <Button
            key={t.key}
            variant={tab === t.key ? "primary" : "secondary"}
            onClick={() => setTab(t.key as any)}
            title={t.label}
          />
        ))}
      </div>

      {tableData.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">Koi record nahi mila</p>
      ) : (
        <TableComponent data={tableData} onEdit={() => {}} />
      )}

    </div>
  )
}
