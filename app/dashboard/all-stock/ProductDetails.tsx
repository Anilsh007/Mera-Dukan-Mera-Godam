"use client"

import { useEffect, useState } from "react"
import { Product } from "@/app/lib/db"
import { getProductLogs } from "@/app/dashboard/add-product/product.service"
import Button from "@/app/components/utility/Button"
import StockHistoryTabs from "./StockHistoryTabs"

export default function ProductDetails({ product, onBack }: { product: Product; onBack?: () => void }) {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (product.id) {
      getProductLogs(product.id).then(data => {
        setLogs(data)
        setLoading(false)
      })
    }
  }, [product.id])

  const isCritical = product.quantity <= 5
  const isLow      = product.quantity > 5 && product.quantity <= 10
  const isOut      = product.quantity === 0

  const qtyColor = isOut ? "text-red-500" : isCritical ? "text-red-400" : isLow ? "text-amber-500" : "text-emerald-600"

  const totalIn  = logs.filter(l => l.quantityAdded > 0).reduce((s, l) => s + l.quantityAdded, 0)
  const totalOut = logs.filter(l => l.quantityAdded < 0).reduce((s, l) => s + Math.abs(l.quantityAdded), 0)

  return (
    <div className="space-y-5">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="text-xl sm:text-2xl font-bold capitalize text-[var(--text-primary)] truncate">{product.name}</h2>
          <p className="text-sm text-[var(--text-muted)] mt-0.5">{product.category || "Category nahi"}</p>
        </div>
        {onBack && <Button title="← Back" onClick={onBack} variant="ghost" className="flex-shrink-0" />}
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { label: "Stock",       value: product.quantity,                                                       cls: qtyColor },
          { label: "Price",       value: `₹${product.price.toLocaleString("en-IN")}`,                           cls: "" },
          { label: "Total Value", value: `₹${(product.price * product.quantity).toLocaleString("en-IN")}`,      cls: "text-emerald-600 dark:text-emerald-400" },
          { label: "Total In",    value: totalIn,                                                                cls: "text-emerald-600" },
          { label: "Total Out",   value: totalOut,                                                               cls: "text-red-500" },
          { label: "Expiry",      value: product.expiry || "—",                                                  cls: "text-amber-500" },
        ].map(s => (
          <div key={s.label} className="p-3 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-[var(--shadow-card)] text-center">
            <p className="text-xs text-[var(--text-muted)] mb-1">{s.label}</p>
            <p className={`font-bold text-sm sm:text-base ${s.cls || "text-[var(--text-primary)]"}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Product Info */}
      <div className="p-4 sm:p-5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-[var(--shadow-card)]">
        <h3 className="font-semibold text-sm text-[var(--text-muted)] uppercase tracking-wider mb-3">Product Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-sm">
          {[
            { label: "Supplier", value: product.supplier },
            { label: "SKU",      value: product.sku },
            { label: "Added On", value: new Date(product.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) },
          ].map(f => (
            <div key={f.label} className="flex gap-2">
              <span className="text-[var(--text-muted)] flex-shrink-0">{f.label}:</span>
              <span className="text-[var(--text-primary)] font-medium">{f.value || "—"}</span>
            </div>
          ))}
          {product.note && (
            <div className="sm:col-span-2 lg:col-span-3 flex gap-2">
              <span className="text-[var(--text-muted)] flex-shrink-0">Note:</span>
              <span className="text-[var(--text-primary)]">{product.note}</span>
            </div>
          )}
        </div>
      </div>

      {/* History */}
      {loading
        ? <div className="skeleton h-40 w-full rounded-xl" />
        : <StockHistoryTabs logs={logs} products={[product]} />
      }

    </div>
  )
}
