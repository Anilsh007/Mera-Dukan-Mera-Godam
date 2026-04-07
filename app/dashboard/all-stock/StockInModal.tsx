"use client"

import { useState } from "react"
import { Product } from "@/app/lib/db"
import { addProduct } from "@/app/dashboard/add-product/product.service"
import { auth } from "@/app/lib/firebase"
import { toast } from "sonner"
import Input from "@/app/components/utility/CommonInput"
import Button from "@/app/components/utility/Button"

type StockInForm = {
  name: string
  price: string
  quantity: string
  category: string
  supplier: string
  expiry: string
  sku: string
  note: string
}

const initForm = (product: Product): StockInForm => ({
  name: product.name,
  price: String(product.price),
  quantity: "",
  category: product.category || "",
  supplier: product.supplier || "",
  expiry: product.expiry || "",
  sku: product.sku || "",
  note: "",
})

// readonly = product identity, editable = batch-specific info
const fields = [
  { key: "name", label: "Product Name", required: true, type: "text", placeholder: "", width: "basis-full lg:basis-[calc(40%-6px)]", readonly: true },
  { key: "category", label: "Category", required: false, type: "text", placeholder: "", width: "basis-full sm:basis-[calc(50%-6px)] lg:basis-[calc(20%-6px)]", readonly: true },
  { key: "expiry", label: "Expiry Date", required: true, type: "date", placeholder: "", width: "basis-full sm:basis-[calc(50%-6px)] lg:basis-[calc(20%-6px)]", readonly: false },
  { key: "sku", label: "SKU", required: false, type: "text", placeholder: "Enter SKU", width: "basis-full sm:basis-[calc(50%-6px)] lg:basis-[calc(20%-6px)]", readonly: true },
  { key: "price", label: "Price/unit", required: true, type: "number", placeholder: "Enter price", width: "basis-full sm:basis-[calc(50%-6px)] lg:basis-[calc(20%-6px)]", readonly: false },
  { key: "quantity", label: "Quantity", required: true, type: "number", placeholder: "Kitna aaya?", width: "basis-full sm:basis-[calc(50%-6px)] lg:basis-[calc(20%-6px)]", readonly: false },
  { key: "supplier", label: "Supplier", required: false, type: "text", placeholder: "Enter supplier", width: "basis-full sm:basis-[calc(50%-6px)] lg:basis-[calc(30%-6px)]", readonly: false },
  { key: "note", label: "Note", required: false, type: "text", placeholder: "Add note", width: "basis-full sm:basis-[calc(50%-6px)] lg:basis-[calc(50%-6px)]", readonly: false },
]

export default function StockInModal({
  product,
  onClose,
}: {
  product: Product
  onClose: () => void
}) {
  const [form, setForm] = useState<StockInForm>(initForm(product))
  const [loading, setLoading] = useState(false)

  const set = (key: keyof StockInForm, value: string) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const subtotal = (Number(form.price) || 0) * (Number(form.quantity) || 0)

  const handleSubmit = async () => {
    if (!form.quantity || Number(form.quantity) <= 0) return toast.error("Quantity daalo")
    if (!form.price || Number(form.price) <= 0) return toast.error("Price daalo")
    if (!form.expiry) return toast.error("Expiry date daalo")

    const userId = auth.currentUser?.uid
    if (!userId) return toast.error("Login karein pehle")

    try {
      setLoading(true)
      await addProduct({
        name: form.name.trim(),
        price: Number(form.price),
        quantity: Number(form.quantity),
        category: form.category,
        supplier: form.supplier,
        expiry: form.expiry,
        sku: form.sku,
        note: form.note,
        userId,
      })
      toast.success(`+${form.quantity} stock add ho gaya`)
      onClose()
    } catch {
      toast.error("Kuch gadbad hui")
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-base font-semibold">Stock In</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl cursor-pointer">✕</button>
      </div>
      <p className="text-sm text-gray-400 capitalize mb-4">{product.name}</p>
      <div className="border-t border-[var(--border-input)] mb-4" />

      <p className="flex justify-end text-sm text-rose-400 font-medium mb-3">
        * Required fields must be filled
      </p>

      <div className="flex flex-wrap gap-3">
        {fields.map(f => (
          <div key={f.key} className={f.width}>
            {f.readonly ? (
              // Name aur category — sirf dikhao, edit nahi ho sakta
              <div>
                <label className="block mb-1 text-sm font-medium text-[var(--text-primary)]">
                  {f.label}
                </label>
                <div className="w-full p-2 rounded-xl border bg-[var(--bg-input)] border-[var(--border-input)] text-[var(--text-muted)] capitalize opacity-60 select-none">
                  {form[f.key as keyof StockInForm] || "—"}
                </div>
              </div>
            ) : (
              // Price, expiry, quantity etc — editable
              <Input
                label={f.required ? <>{f.label} <span className="text-red-400">*</span></> : f.label}
                type={f.type}
                placeholder={f.placeholder}
                value={form[f.key as keyof StockInForm]}
                onChange={e => set(f.key as keyof StockInForm, e.target.value)}
              />
            )}
          </div>
        ))}
      </div>

      {subtotal > 0 && (
        <div className="mt-4 text-right">
          <p className="text-xs text-gray-400 uppercase">Subtotal</p>
          <p className="text-2xl font-black text-emerald-600">
            ₹{subtotal.toLocaleString("en-IN")}
          </p>
        </div>
      )}

      <div className="flex gap-2 mt-6">
        <Button variant="ghost" title="Cancel" onClick={onClose} className="flex-1" />
        <Button
          variant="primary"
          title="Confirm Stock In"
          loading={loading}
          onClick={handleSubmit}
          className="flex-1"
        />
      </div>
    </>
  )
}
