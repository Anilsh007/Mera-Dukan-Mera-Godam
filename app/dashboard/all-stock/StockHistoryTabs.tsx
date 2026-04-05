"use client"

import { useMemo, useState } from "react"
import TableComponent, { TableItem } from "@/app/components/utility/CommonTable"
import { Product } from "@/app/lib/db"
import Button from "@/app/components/utility/Button"

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
    console.log("Edit item:", item)
  }

  const totalIn = logs
    .filter(l => l.quantityAdded > 0)
    .reduce((s, l) => s + l.quantityAdded, 0)

  const totalOut = logs
    .filter(l => l.quantityAdded < 0)
    .reduce((s, l) => s + Math.abs(l.quantityAdded), 0)

  const tableData: TableItem[] = useMemo(() => {

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

    return logs
      .filter(l => tab === "in" ? l.quantityAdded > 0 : l.quantityAdded < 0)
      .map(l => ({
        id: Number(l.id),
        name: l.quantityAdded > 0 ? "Stock In" : "Stock Out",
        category: l.quantityAdded > 0 ? "IN" : "OUT",
        supplier: "-",
        expiry: "-",
        price: l.price,
        quantity: Math.abs(l.quantityAdded),
        createdAt: l.date,
        note: l.note || "-"
      }))

  }, [tab, logs, products])

  const tabs = [
    { key: "all", label: "All" },
    { key: "in", label: "Stock In" },
    { key: "out", label: "Stock Out" }
  ]

  return (
    <div className="p-5 rounded-xl bg-[var(--bg-card)] border-[var(--border-card)] shadow-[var(--shadow-card)]">

      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Stock Activity</h3>
        <div className="text-sm">
          <span className="text-green-600 mr-3">In: {totalIn}</span>
          <span className="text-red-600">Out: {totalOut}</span>
        </div>
      </div>

      <div className="flex gap-2 mb-5">
        {tabs.map(t => (
          <Button variant="secondary" key={t.key} onClick={()=> setTab(t.key as any)} title={t.label} />
        ))}
      </div>

      <TableComponent data={tableData} onEdit={handleEdit} />

    </div>
  )
}