"use client"

import { useMemo, useState } from "react"
import TableComponent, { TableItem } from "@/app/components/utility/CommonTable"
import { Product } from "@/app/lib/db"
import Button from "@/app/components/utility/Button"
import EditTableRowModal from "@/app/dashboard/all-stock/EditTableRowModal"

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
  const [selectedRow, setSelectedRow] = useState<TableItem | null>(null)

  const productMap = useMemo(() => {
    const map: Record<number, string> = {}
    products.forEach((p) => {
      if (p.id) map[p.id] = p.name
    })
    return map
  }, [products])

  const totalInQty = logs
    .filter((l) => l.quantityAdded > 0)
    .reduce((s, l) => s + l.quantityAdded, 0)

  const totalOutQty = logs
    .filter((l) => l.quantityAdded < 0)
    .reduce((s, l) => s + Math.abs(l.quantityAdded), 0)

  const totalInValue = logs
    .filter((l) => l.quantityAdded > 0)
    .reduce((s, l) => s + l.quantityAdded * Number(l.price || 0), 0)

  const totalOutValue = logs
    .filter((l) => l.quantityAdded < 0)
    .reduce((s, l) => s + Math.abs(l.quantityAdded) * Number(l.price || 0), 0)

  const tableData: TableItem[] = useMemo(() => {
    const filtered =
      tab === "all"
        ? [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        : logs
          .filter((l) => (tab === "in" ? l.quantityAdded > 0 : l.quantityAdded < 0))
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return filtered.map((l) => {
      const productName = l.productId
        ? productMap[l.productId] || "-"
        : products[0]?.name || "-"
      return logToRow(l, productName)
    })
  }, [tab, logs, productMap, products])

  const tabs = [
    { key: "all", label: `All (${logs.length})` },
    { key: "in", label: `Stock In (${logs.filter((l) => l.quantityAdded > 0).length})` },
    { key: "out", label: `Stock Out (${logs.filter((l) => l.quantityAdded < 0).length})` },
  ]


  return (
    <>
      <div className="mb-4 flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Button key={t.key} title={t.label} variant={tab === t.key ? "success" : "outline"} onClick={() => setTab(t.key as "all" | "in" | "out")} />
        ))}
      </div>

      {tableData.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border-card)] p-6 text-center text-[var(--text-secondary)]">
          No records found
        </div>
      ) : (
        <TableComponent data={tableData} onEdit={(item) => setSelectedRow(item)} />
      )}

      <EditTableRowModal open={selectedRow !== null} item={selectedRow} onClose={() => setSelectedRow(null)} onSave={(item) => setSelectedRow(null)} />
    </>
  )
}