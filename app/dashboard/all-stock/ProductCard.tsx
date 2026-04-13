"use client"

import { useState } from "react"
import { Product } from "@/app/lib/db"
import Button from "@/app/components/utility/Button"
import StockInModal from "./StockInModal"
import StockOutModal from "./StockOutModal"

type ModalType = "in" | "out" | null

function expiryInfo(expiry?: string): { label: string; cls: string } | null {
  if (!expiry) return null
  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000)
  if (days < 0) return { label: "Expired", cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" }
  if (days <= 7) return { label: `${days}d left`, cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" }
  if (days <= 30) return { label: `${days}d left`, cls: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" }
  return null
}

export default function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  const [modal, setModal] = useState<ModalType>(null)

  const isCritical = product.quantity > 0 && product.quantity <= 5
  const isLow = product.quantity > 5 && product.quantity <= 10
  const isOut = product.quantity === 0

  const stockBadge = isOut ? { label: "Out of Stock", cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" }
    : isCritical ? { label: "Critical", cls: "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400" }
      : isLow ? { label: "Low Stock", cls: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" }
        : { label: "In Stock", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" }

  const expInfo = expiryInfo(product.expiry)

  return (
    <>
      <div onClick={onClick} className="group relative p-5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-card)] shadow-[var(--shadow-card)] cursor-pointer transition-all duration-200 hover:shadow-xl hover:-translate-y-1 flex flex-col gap-4">
        {/* Top row */}
        <div className="flex justify-between items-start gap-2">
          <div className="min-w-0">
            <h2 className="font-semibold text-base capitalize group-hover:text-emerald-600 transition truncate text-[var(--text-primary)]">
              {product.name}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
              {product.category || "Category nahi"}
              {product.sku ? ` · ${product.sku}` : ""}
            </p>
          </div>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold flex-shrink-0 ${stockBadge.cls}`}>
            {stockBadge.label}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-[var(--bg-primary)] rounded-xl p-2">
            <p className="text-xs text-[var(--text-muted)] mb-0.5">Price</p>
            <p className="font-semibold text-sm text-[var(--text-primary)]">₹{product.price.toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-[var(--bg-primary)] rounded-xl p-2">
            <p className="text-xs text-[var(--text-muted)] mb-0.5">Qty</p>
            <p className={`font-bold text-sm ${isOut ? "text-red-500" : isCritical ? "text-red-400" : isLow ? "text-amber-500" : "text-[var(--text-primary)]"}`}>
              {product.quantity}
            </p>
          </div>
          <div className="bg-[var(--bg-primary)] rounded-xl p-2">
            <p className="text-xs text-[var(--text-muted)] mb-0.5">Value</p>
            <p className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
              ₹{(product.price * product.quantity).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* Expiry + Supplier footer */}
        {(product.expiry || product.supplier) && (
          <div className="flex items-center justify-between text-xs gap-2">
            {product.supplier
              ? <span className="text-[var(--text-muted)] truncate">🏭 {product.supplier}</span>
              : <span />
            }
            {expInfo
              ? <span className={`px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${expInfo.cls}`}>⏰ {expInfo.label}</span>
              : product.expiry
                ? <span className="text-[var(--text-muted)] flex-shrink-0">Exp: {product.expiry}</span>
                : null
            }
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-2 mt-auto" onClick={e => e.stopPropagation()}>
          <Button variant="primary" title="+ Stock In" onClick={() => setModal("in")} className="flex-1" />
          <Button variant="danger" title="− Stock Out" onClick={() => setModal("out")} disabled={isOut} className="flex-1" />
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)} >
          <div className="bg-[var(--bg-card)] rounded-2xl border border-[var(--border-card)] p-5 sm:p-6 w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()} >
            {modal === "in"
              ? <StockInModal product={product} onClose={() => setModal(null)} />
              : <StockOutModal product={product} onClose={() => setModal(null)} />
            }
          </div>
        </div>
      )}
    </>
  )
}
