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

  const productMap = useMemo(() => {
    const map: Record<number, string> = {}
    products.forEach(p => { if (p.id) map[p.id] = p.name })
    return map
  }, [products])

  // ─── Quantity totals ─────────────────────────────────────────
  const totalInQty = logs
    .filter(l => l.quantityAdded > 0)
    .reduce((s, l) => s + l.quantityAdded, 0)

  const totalOutQty = logs
    .filter(l => l.quantityAdded < 0)
    .reduce((s, l) => s + Math.abs(l.quantityAdded), 0)

  // ─── Rupee totals ────────────────────────────────────────────
  // In: kitna kharch hua (purchase price)
  const totalInValue = logs
    .filter(l => l.quantityAdded > 0)
    .reduce((s, l) => s + l.quantityAdded * Number(l.price || 0), 0)

  // Out: kitna mila (sale price)
  const totalOutValue = logs
    .filter(l => l.quantityAdded < 0)
    .reduce((s, l) => s + Math.abs(l.quantityAdded) * Number(l.price || 0), 0)

  const tableData: TableItem[] = useMemo(() => {
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
    { key: "in", label: `Stock In (${logs.filter(l => l.quantityAdded > 0).length})` },
    { key: "out", label: `Stock Out (${logs.filter(l => l.quantityAdded < 0).length})` },
  ]

  // ─── Summary strip (tab ke hisaab se) ────────────────────────
  const summaryCards = tab === "all"
    ? [
      { label: "Total In Qty", value: `+${totalInQty}`, sub: `₹${totalInValue.toLocaleString("en-IN")} kharch`, color: "text-emerald-600 dark:text-emerald-400" },
      { label: "Total Out Qty", value: `-${totalOutQty}`, sub: `₹${totalOutValue.toLocaleString("en-IN")} mila`, color: "text-red-500 dark:text-red-400" },
      { label: "Net Qty", value: totalInQty - totalOutQty >= 0 ? `+${totalInQty - totalOutQty}` : `${totalInQty - totalOutQty}`, sub: "bacha hua", color: (totalInQty - totalOutQty) >= 0 ? "text-sky-600" : "text-orange-500" },
    ]
    : tab === "in"
      ? [
        { label: "Qty Added", value: `+${totalInQty}`, sub: "items aaye", color: "text-emerald-600 dark:text-emerald-400" },
        { label: "Total Kharch", value: `₹${totalInValue.toLocaleString("en-IN")}`, sub: "purchase cost", color: "text-emerald-600 dark:text-emerald-400" },
        { label: "Avg Price", value: totalInQty > 0 ? `₹${Math.round(totalInValue / totalInQty).toLocaleString("en-IN")}` : "—", sub: "per unit", color: "text-sky-600" },
      ]
      : [
        { label: "Qty Nikali", value: `-${totalOutQty}`, sub: "items biki", color: "text-red-500 dark:text-red-400" },
        { label: "Total Revenue", value: `₹${totalOutValue.toLocaleString("en-IN")}`, sub: "sale se mila", color: "text-red-500 dark:text-red-400" },
        { label: "Avg Sale Price", value: totalOutQty > 0 ? `₹${Math.round(totalOutValue / totalOutQty).toLocaleString("en-IN")}` : "—", sub: "per unit", color: "text-sky-600" },
      ]

  return (
    <>
      {/* Tab Buttons */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {tabs.map(t => (
          <Button key={t.key} variant={tab === t.key ? "primary" : "secondary"} onClick={() => setTab(t.key as any)} title={t.label} />
        ))}
      </div>

      {tableData.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">Koi record nahi mila</p>
      ) : (
        <TableComponent data={tableData} onEdit={() => { }} />
      )}
    </>
  )
}
