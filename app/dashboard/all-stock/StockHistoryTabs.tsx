"use client"

import { useMemo, useState } from "react"
import TableComponent, { TableItem } from "@/app/components/utility/CommonTable"
import { Product } from "@/app/lib/db"

type Log = {
  id: string
  date: string
  quantityAdded: number
  price: number
  note?: string
}

export default function StockHistoryTabs({
  logs,
  products
}: {
  logs: Log[]
  products: Product[]
}) {

  const [tab, setTab] = useState<"all" | "in" | "out">("all")

  const handleEdit = (item: TableItem) => {
    // TODO: Implement edit handler
    console.log("Edit item:", item)
  }

  // totals
  const totalIn = logs
    .filter(l => l.quantityAdded > 0)
    .reduce((sum, l) => sum + l.quantityAdded, 0)

  const totalOut = logs
    .filter(l => l.quantityAdded < 0)
    .reduce((sum, l) => sum + Math.abs(l.quantityAdded), 0)

  // TABLE DATA
  const tableData: TableItem[] = useMemo(() => {

    // ✅ ALL → PRODUCTS
    if (tab === "all") {
      return products.map(p => ({
        id: p.id || 0,
        name: p.name,
        category: p.category || "-",
        supplier: p.supplier || "-",
        expiry: p.expiry || "-",
        price: p.price,
        quantity: p.quantity,
        createdAt: p.createdAt,
        note: p.note || "-"
      }))
    }

    // ✅ IN / OUT → LOGS
    const filteredLogs =
      tab === "in"
        ? logs.filter(l => l.quantityAdded > 0)
        : logs.filter(l => l.quantityAdded < 0)

    return filteredLogs.map(log => ({
      id: Number(log.id),
      name: log.quantityAdded > 0 ? "Stock In" : "Stock Out",
      category: log.quantityAdded > 0 ? "IN" : "OUT",
      supplier: "-",
      expiry: "-",
      price: log.price,
      quantity: Math.abs(log.quantityAdded),
      createdAt: log.date,
      note: log.note || "-"
    }))

  }, [tab, logs, products])

  return (
    <div className="p-5 rounded-xl bg-[var(--bg-card)] border-[var(--border-card)] shadow-[var(--shadow-card)]">

      {/* HEADER */}
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Stock Activity</h3>

        <div className="text-sm">
          <span className="text-green-600 mr-3">In: {totalIn}</span>
          <span className="text-red-600">Out: {totalOut}</span>
        </div>
      </div>

      {/* TABS */}
      <div className="flex gap-2 mb-5">
        <button onClick={() => setTab("all")}>All</button>
        <button onClick={() => setTab("in")}>Stock In</button>
        <button onClick={() => setTab("out")}>Stock Out</button>
      </div>

      {/* TABLE */}
      <TableComponent data={tableData} onEdit={handleEdit} />

    </div>
  )
}