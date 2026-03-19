"use client"

import { useState } from "react"
import useAddProduct from "./useAddProduct"
import Button from "@/app/components/utility/Button"
import { MdOutlineAddchart, MdAdd, MdDeleteOutline } from "react-icons/md"
import Input from "@/app/components/utility/CommonInput"
import { CiWarning } from "react-icons/ci"
import { toast } from "sonner"

type ProductRow = {
    id: string
    name: string
    price: string
    quantity: string
    category: string
    supplier: string
    expiry: string
    note: string
    sku: string
}

const createEmptyRow = (): ProductRow => ({
    id: Math.random().toString(36).substr(2, 9),
    name: "",
    price: "",
    quantity: "",
    category: "",
    supplier: "",
    expiry: "",
    note: "",
    sku: ""
})

const productInputs = [
    { key: "name", label: (<>Product Name <span className="text-red-500">*</span></>), required: true, type: "text", placeholder: "Enter product name", width: "basis-full lg:basis-[30%]" },
    { key: "category", label: "Category", type: "text", placeholder: "Enter category", width: "basis-[48%] lg:basis-[15%]" },
    { key: "expiry", label: (<>Expiry Date <span className="text-red-500">*</span></>), required: true, type: "date", placeholder: "Select expiry", width: "basis-[48%] lg:basis-[15%]" },
    { key: "sku", label: "SKU", type: "text", placeholder: "Enter SKU", width: "basis-[48%] lg:basis-[20%]" },
    { key: "price", label: (<>Price per unit <span className="text-red-500">*</span></>), required: true, type: "number", placeholder: "Enter price", width: "basis-[48%] lg:basis-[12%]" },
    { key: "quantity", label: (<>Quantity <span className="text-red-500">*</span></>), required: true, type: "number", placeholder: "Enter quantity", width: "basis-[48%] lg:basis-[12%]" },
    { key: "supplier", label: "Supplier", type: "text", placeholder: "Enter supplier", width: "basis-[48%] lg:basis-[20%]" },
    { key: "note", label: "Note", type: "text", placeholder: "Add note", width: "basis-full lg:basis-[30%]" }
]

export default function AddProductForm() {
    const { createProduct, loading } = useAddProduct()
    const [rows, setRows] = useState<ProductRow[]>([createEmptyRow()])

    const addRow = () => setRows([...rows, createEmptyRow()])
    const removeRow = (id: string) => rows.length > 1 && setRows(rows.filter(r => r.id !== id))

    const handleChange = (id: string, key: keyof ProductRow, value: string) => {
        setRows(prev =>
            prev.map(row => (row.id === id ? { ...row, [key]: value } : row))
        )
    }

    // ✅ Grand Total
    const grandTotal = rows.reduce(
        (sum, row) => sum + (Number(row.price) || 0) * (Number(row.quantity) || 0),
        0
    )

    // ✅ Dynamic validation
    const isFormValid = rows.every(row =>
        productInputs.every(input => {
            if (!input.required) return true
            const value = row[input.key as keyof ProductRow]
            return String(value).trim() !== ""
        })
    )

    // ✅ Submit with toast validation
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        const invalidField = rows.find((row, index) =>
            productInputs.some(input => {
                if (!input.required) return false
                const value = row[input.key as keyof ProductRow]
                if (!String(value).trim()) {
                    toast.error(`Row ${index + 1}: ${input.label} is required`)
                    return true
                }
                return false
            })
        )

        if (invalidField) return

        try {
            for (const row of rows) {
                await createProduct({ ...row, name: row.name.trim() })
            }

            toast.success("Products added successfully ✅")
            setRows([createEmptyRow()])
        } catch (err) {
            console.error(err)
            toast.error("Something went wrong")
        }
    }

    return (
        <form onSubmit={handleSubmit} className="p-5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl shadow-xl">

            <div className="space-y-4">
                <p className="flex justify-end text-sm text-rose-400 font-medium">* Required fields must be filled before submitting the form.</p>
                {rows.map((row, index) => (
                    <div key={row.id} className="flex flex-wrap gap-3 items-center border-b pb-5 border-[var(--border-input)]">

                        <div className="w-8 h-8 flex items-center justify-center rounded-full border text-xs text-slate-500 font-bold">
                            {index + 1}
                        </div>

                        {productInputs.map(input => (
                            <div key={input.key} className={`${input.width} min-w-[200px]`}>
                                <Input type={input.type} label={input.label} placeholder={input.placeholder} value={row[input.key as keyof ProductRow]} onChange={(e) => handleChange(row.id, input.key as keyof ProductRow, e.target.value)}
                                />
                            </div>
                        ))}

                        <div className="basis-[80px] text-right ml-auto">
                            <p className="text-[10px] text-slate-400 uppercase">Subtotal</p>
                            <p className="font-bold text-emerald-600">
                                ₹{((Number(row.price) || 0) * (Number(row.quantity) || 0)).toLocaleString("en-IN")}
                            </p>
                        </div>

                        {rows.length > 1 && (
                            <Button
                                type="button"
                                onClick={() => removeRow(row.id)}
                                icon={<MdDeleteOutline />}
                                variant="delete"
                            />
                        )}
                    </div>
                ))}
            </div>

            <div className="flex justify-end mt-6">
                <Button
                    type="button"
                    title="Add Another Product"
                    onClick={addRow}
                    variant="dotBorder"
                    icon={<MdAdd />}
                />
            </div>

            <div className="mt-6 border-t border-[var(--border-input)] pt-5">
                <p className="flex items-center gap-2 text-sm text-rose-400 pb-4">
                    <CiWarning size={18} /> Review your items before adding them.
                </p>

                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div>
                        <p className="text-xs text-slate-400 uppercase">Grand Total</p>
                        <p className="text-2xl font-black text-emerald-600">
                            ₹{grandTotal.toLocaleString("en-IN")}
                        </p>
                    </div>

                    <Button
                        type="submit"
                        title={loading ? "Saving..." : `Complete Entry (${rows.length})`}
                        variant="primary"
                        disabled={loading || !isFormValid}
                        icon={<MdOutlineAddchart />}
                    />
                </div>
            </div>
        </form>
    )
}