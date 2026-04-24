"use client"

import { useMemo, useState } from "react"
import TableComponent, { TableItem } from "@/app/components/utility/CommonTable"
import { Product } from "@/app/lib/db"
import Button from "@/app/components/utility/Button"
import EditTableRowModal from "@/app/dashboard/all-stock/EditTableRowModal"
import { MdPrint } from "react-icons/md"


type Log = {
  id: string
  date: string
  quantityAdded: number
  type?: "in" | "out"
  reason?: string
  price: number
  expiry?: string
  note?: string
  productId?: string
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
    id: l.id,
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

export default function StockHistoryTabs({ logs, products }: { logs: Log[], products: Product[] }) {
  const [tab, setTab] = useState<"all" | "in" | "out">("all")
  const [selectedRow, setSelectedRow] = useState<TableItem | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string | number>>(new Set())
  const [printData, setPrintData] = useState<TableItem[] | null>(null)

  const productMap = useMemo(() => {
    const map: Record<string, string> = {}
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

  const toggleSelection = (id: string | number) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const selectAll = () => {
    if (selectedIds.size === tableData.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(tableData.map(r => r.id).filter((id): id is string | number => id !== undefined && id !== null)))
    }
  }

  // Print handler
  const handlePrint = (rows: TableItem[]) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const total = rows.reduce((sum, r) => sum + ((r.price ?? 0) * (r.quantity ?? 0)), 0)

    printWindow.document.write(`
      <html>
        <head>
          <title>Stock Receipt</title>
          <style>
            body { font-family: system-ui; padding: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background: #f3f4f6; }
            .total { text-align: right; font-size: 18px; font-weight: bold; margin-top: 20px; }
          </style>
        </head>
        <body>
          <h2>Stock Entry Receipt</h2>
          <p>Date: ${new Date().toLocaleString("en-IN")}</p>
          <table>
            <tr><th>Product</th><th>Type</th><th>Qty</th><th>Price</th><th>Total</th></tr>
            ${rows.map(r => `
              <tr>
                <td>${r.name}</td>
                <td>${r.category}</td>
                <td>${r.quantity}</td>
                <td>₹${r.price}</td>
                <td>₹${((r.price ?? 0) * (r.quantity ?? 0)).toLocaleString("en-IN")}</td>
              </tr>
            `).join('')}
          </table>
          <div class="total">Grand Total: ₹${total.toLocaleString("en-IN")}</div>
          <script>window.print();</script>
        </body>
      </html>
    `)
    printWindow.document.close()
  }


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
        <>
          <TableComponent data={tableData} onEdit={(item) => setSelectedRow(item)} showSelection={true} selectedIds={selectedIds} onToggleSelect={toggleSelection} onSelectAll={selectAll} onPrintRow={(row) => handlePrint([row])} />

          {selectedIds.size > 0 && (
            <div className="flex items-center justify-end mt-4 rounded-2xl p-2 text-center text-[var(--text-secondary)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] w-fit ml-auto gap-3">
              <span className="text-sm font-medium">{selectedIds.size} selected</span>
              <Button variant="primary" icon={<MdPrint />} title={`Print Selected`} onClick={() => handlePrint(tableData.filter(r => selectedIds.has(r.id!)))} />
              <Button variant="outline" title="Clear" onClick={() => setSelectedIds(new Set())} />
            </div>
          )}
        </>
      )}

      <EditTableRowModal open={selectedRow !== null} item={selectedRow} onClose={() => setSelectedRow(null)} onSave={(item) => setSelectedRow(null)} />
    </>
  )
}
