"use client"

import { useEffect, useState } from "react"
import { Product } from "@/app/lib/db"
import { stockOut, getProductLogs } from "@/app/dashboard/add-product/product.service"
import { toast } from "sonner"
import Input from "@/app/components/utility/CommonInput"
import Button from "@/app/components/utility/Button"

const REASONS = ["Sold", "Expired", "Damaged", "Personal use", "Other"]

const selectClass = "w-full p-2 rounded-xl border bg-[var(--bg-input)] border-[var(--border-input)] text-[var(--text-primary)] focus:ring-2 focus:ring-emerald-400 outline-none"

export default function StockOutModal({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const [quantity, setQuantity] = useState("")
  const [salePrice, setSalePrice] = useState(String(product.price)) // default: current price
  const [reason, setReason] = useState("Sold")
  const [note, setNote] = useState("")
  const [selectedExpiry, setSelectedExpiry] = useState("")
  const [expiryOptions, setExpiryOptions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [logsLoading, setLogsLoading] = useState(true)
  const isSoldFlow = reason === "Sold"

  // product ke sab logs fetch karo — unique expiry dates nikalenge
  useEffect(() => {
    if (!product.id) return
    getProductLogs(product.id).then(logs => {
      // sirf "in" type logs mein expiry hogi
      const dates = logs
        .filter(l => l.type === "in" && l.expiry)
        .map(l => l.expiry as string)

      // unique + sorted (latest pehle)
      const unique = [...new Set(dates)].sort((a, b) =>
        new Date(b).getTime() - new Date(a).getTime()
      )

      setExpiryOptions(unique)
      if (unique.length > 0) setSelectedExpiry(unique[0]) // default: latest expiry
      setLogsLoading(false)
    })
  }, [product.id])

  const handleSubmit = async () => {
    const qty = Number(quantity)
    const price = Number(salePrice)

    if (!qty || qty <= 0) return toast.error("Quantity sahi daalo")
    if (qty > product.quantity) return toast.error(`Sirf ${product.quantity} available hai`)
    if (isSoldFlow && (!price || price <= 0)) return toast.error("Sale price daalo")
    if (!isSoldFlow && price < 0) return toast.error("Price negative nahi ho sakta")
    if (expiryOptions.length > 0 && !selectedExpiry) return toast.error("Expiry date select karo")
    if (!product.id) return

    try {
      setLoading(true)
      await stockOut({
        productId: product.id,
        quantity: qty,
        salePrice: isSoldFlow ? price : Math.max(price || 0, 0),
        expiry: selectedExpiry || undefined,
        reason,
        note,
      })
      toast.success(`−${qty} stock nikala gaya`)
      onClose()
    } catch (err: any) {
      toast.error(err.message || "Kuch gadbad hui")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-5 rounded-xl bg-[var(--bg-card)] border-[var(--border-card)] shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-base font-semibold">Stock Out</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">✕</button>
      </div>
      <p className="text-sm text-gray-400 capitalize mb-4">
        {product.name} · {product.quantity} available
      </p>
      <div className="border-t border-[var(--border-input)] mb-4" />

      <div className="flex flex-col gap-3">

        {/* Expiry dropdown */}
        <div>
          <label className="block mb-1 text-sm font-medium text-[var(--text-primary)]">
            Expiry Date <span className="text-red-400">*</span>
          </label>
          {logsLoading ? (
            <div className={`${selectClass} text-gray-400 text-sm`}>Loading batches...</div>
          ) : expiryOptions.length === 0 ? (
            <div className={`${selectClass} text-gray-400 text-sm`}>No expiry dates available</div>
          ) : (
            <select value={selectedExpiry} onChange={e => setSelectedExpiry(e.target.value)} className={selectClass} >
              {expiryOptions.map(exp => (
                <option key={exp} value={exp}>{exp}</option>
              ))}
            </select>
          )}
        </div>

        {/* Quantity */}
        <Input label={<>Quantity <span className="text-red-400">*</span></>} type="number" placeholder={`Max ${product.quantity}`} min={1} max={product.quantity} value={quantity} onChange={e => setQuantity(e.target.value)} />

        {/* Sale Price */}
        <Input
          label={
            <>
              {isSoldFlow ? "Sale Price (per unit)" : "Recovery Value (per unit)"}
              {isSoldFlow && <span className="text-red-400"> *</span>}
            </>
          }
          type="number"
          placeholder={isSoldFlow ? "How much did you sell it?" : "Optional, if any amount recovered"}
          value={salePrice}
          onChange={e => setSalePrice(e.target.value)}
        />

        {/* Live total */}
        {Number(quantity) > 0 && Number(salePrice) > 0 && (
          <div className="flex justify-between items-center px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
            <span className="text-sm text-emerald-700 dark:text-emerald-400">
              {isSoldFlow ? "Total Sale Value" : "Total Recovery Value"}
            </span>
            <span className="font-bold text-emerald-600">
              ₹{(Number(quantity) * Number(salePrice)).toLocaleString("en-IN")}
            </span>
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block mb-1 text-sm font-medium text-[var(--text-primary)]">Reason</label>
          <select value={reason} onChange={e => setReason(e.target.value)} className={selectClass} >
            {REASONS.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        {/* Note */}
        <Input label="Note (optional)" type="text" placeholder="Add a note (optional)" value={note} onChange={e => setNote(e.target.value)} />

      </div>

      <div className="flex gap-2 mt-6">
        <Button variant="ghost" title="Cancel" onClick={onClose} className="flex-1" />
        <Button variant="danger" title={isSoldFlow ? "Confirm Sale Stock" : "Confirm Stock Out"} loading={loading} onClick={handleSubmit} className="flex-1" />
      </div>
    </div>
  )
}
