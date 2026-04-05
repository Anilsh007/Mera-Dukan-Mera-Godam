"use client"

import { useEffect, useState } from "react"
import Button from "@/app/components/utility/Button"
import Input from "@/app/components/utility/CommonInput"
import { TableItem } from "@/app/components/utility/CommonTable"

type Props = {
  isOpen: boolean
  onClose: () => void
  product: TableItem | null
  onSave: (updated: TableItem) => Promise<void>
}

export default function EditProductModal({
  isOpen,
  onClose,
  product,
  onSave,
}: Props) {
  const [form, setForm] = useState<TableItem>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [show, setShow] = useState(false) // 👈 controls animation mount

  // set form
  useEffect(() => {
    if (product) setForm(product)
  }, [product])

  // animation control (mount + unmount delay)
  useEffect(() => {
    if (isOpen) {
      setShow(true)
    } else {
      setTimeout(() => setShow(false), 300) // match duration
    }
  }, [isOpen])

  if (!show || !product) return null

  const handleChange = (field: keyof TableItem, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!form.name?.trim()) return setError("Name is required")
    if ((form.price ?? 0) < 0) return setError("Price cannot be negative")
    if ((form.quantity ?? 0) < 0) return setError("Quantity cannot be negative")
    if (!form.id) return

    setError("")
    setLoading(true)

    try {
      await onSave(form)
    } catch {
      setError("Failed to save changes")
    } finally {
      setLoading(false)
    }
  }

  const fields: { label: string; key: keyof TableItem; type?: string; colSpan?: string }[] = [
    { label: "Name", key: "name" },
    { label: "Category", key: "category" },
    { label: "Supplier", key: "supplier" },
    { label: "Expiry Date", key: "expiry", type: "date" },
    { label: "Price", key: "price", type: "number" },
    { label: "Quantity", key: "quantity", type: "number" },
    { label: "Note", key: "note", colSpan: "col-span-2" },
  ]

  return (
    <>
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300
        ${isOpen ? "opacity-100" : "opacity-0"}`}
      />

      {/* MODAL */}
      <div
        className={`fixed inset-0 flex items-center justify-center z-50 transition-all duration-300 ease-out
        ${isOpen
          ? "opacity-100 translate-y-0 scale-100"
          : "opacity-0 -translate-y-12 scale-95"
        }`}
      >
        <div className="w-full max-w-lg rounded-xl bg-white dark:bg-gray-900 p-6 shadow-lg">
          <h2 className="text-lg font-semibold mb-4">Edit Product</h2>

          <div className="grid grid-cols-2 gap-4">
            {fields.map(f => (
              <Input
                key={f.key as string}
                label={f.label}
                type={f.type}
                containerClassName={f.colSpan}
                value={form[f.key] ?? ""}
                onChange={e =>
                  handleChange(
                    f.key,
                    f.type === "number"
                      ? Number(e.target.value)
                      : e.target.value
                  )
                }
              />
            ))}
          </div>

          {error && (
            <p className="text-red-500 text-sm mt-3">{error}</p>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button title="Cancel" variant="black" onClick={onClose} />
            <Button
              title={loading ? "Saving..." : "Save"}
              variant="primary"
              onClick={handleSubmit}
            />
          </div>
        </div>
      </div>
    </>
  )
}