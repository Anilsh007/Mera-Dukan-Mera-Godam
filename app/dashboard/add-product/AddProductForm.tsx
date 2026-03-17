"use client"

import { useState } from "react"
import useAddProduct from "./useAddProduct"
import Button from "@/app/components/utility/Button"
import { MdOutlineAddchart, MdAdd, MdDeleteOutline } from "react-icons/md"
import Input from "@/app/components/utility/CommonInput"
import { CiWarning } from "react-icons/ci"

type ProductRow = {
    id: string
    name: string
    price: string
    quantity: string
    category: string
    supplier: string
    expiry: string
}

const createEmptyRow = (): ProductRow => ({
    id: Math.random().toString(36).substr(2, 9),
    name: "",
    price: "",
    quantity: "",
    category: "",
    supplier: "",
    expiry: ""
})

const productInputs = [
    { name: "name", placeholder: "Product Name", type: "text", width: "basis-full lg:basis-[30%]" },
    { name: "category", placeholder: "Category", type: "text", width: "basis-[48%] lg:basis-[15%]" },
    { name: "expiry", placeholder: "Expiry", type: "date", width: "basis-[48%] lg:basis-[15%]" },
    { name: "sku", placeholder: "SKU", type: "text", width: "basis-[48%] lg:basis-[20%]" },

    // 👇 second row starts automatically
    { name: "price", placeholder: "Price", type: "number", width: "basis-[48%] lg:basis-[12%]" },
    { name: "quantity", placeholder: "Qty", type: "number", width: "basis-[48%] lg:basis-[12%]" },
    { name: "supplier", placeholder: "Supplier", type: "text", width: "basis-[48%] lg:basis-[20%]" },
    { name: "note", placeholder: "Note", type: "text", width: "basis-full lg:basis-[30%]" }
]

export default function AddProductForm() {

    const { createProduct } = useAddProduct()
    const [rows, setRows] = useState<ProductRow[]>([createEmptyRow()])
    const [loading, setLoading] = useState(false)

    const grandTotal = rows.reduce(
        (sum, row) =>
            sum + (Number(row.price) || 0) * (Number(row.quantity) || 0),
        0
    )

    const addRow = () => setRows([...rows, createEmptyRow()])

    const removeRow = (id: string) => {
        if (rows.length > 1) {
            setRows(rows.filter(r => r.id !== id))
        }
    }

    const handleChange = (id: string, name: string, value: string) => {
        setRows(prev =>
            prev.map(row =>
                row.id === id ? { ...row, [name]: value } : row
            )
        )
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            for (const row of rows) {
                await createProduct(
                    { ...row, name: row.name.trim() },
                    () => { }
                )
            }
            setRows([createEmptyRow()])

        } finally {
            setLoading(false)
        }
    }

    const isFormValid = rows.every(
        row => row.name.trim() && row.price && row.quantity
    )

    return (

        <form onSubmit={handleSubmit} className="p-5 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl shadow-xl">

            <div className="space-y-4">
                {rows.map((row, index) => (
                    <div key={row.id} className="flex flex-wrap gap-3 items-center border-b pb-4 border-slate-700" >

                        <div className="w-8 h-8 flex items-center justify-center rounded-full border text-xs text-slate-500 font-bold"> {index + 1} </div>

                        {productInputs.map((input) => (
                            <div key={input.name} className={`${input.width} grow min-w-[200px]`} >
                                <Input type={input.type} placeholder={input.placeholder} value={(row as any)[input.name]}
                                    onChange={(e) => handleChange(row.id, input.name, e.target.value)} />
                            </div>
                        ))}

                        <div className="basis-[60px] text-right ml-auto">
                            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">Subtotal</p>

                            <p className="font-bold text-emerald-600 text-lg">
                                ₹{((Number(row.price) || 0) * (Number(row.quantity) || 0)).toLocaleString("en-IN")}
                            </p>
                        </div>

                        {rows.length > 1 && (
                            <div className="flex items-center">
                                {rows.length > 1 && (
                                    <Button type="button" onClick={() => removeRow(row.id)} icon={<MdDeleteOutline />} variant="delete" />
                                )}
                            </div>
                        )}
                    </div>

                ))}
            </div>

            <div className="flex justify-end mt-6">
                <Button type="button" title="Add Another Product" onClick={addRow} variant="dotBorder" icon={<MdAdd />} />
            </div>

            <div className="mt-6 border-t border-slate-700 pt-5">
                <p className="flex items-center gap-2 text-sm text-rose-400 pb-4"><CiWarning size={18} /> Review your items before adding them to the inventory.</p>

                <div className="flex flex-wrap items-center justify-between gap-6">
                    <div>
                        <p className="text-xs text-slate-400 uppercase font-bold">Grand Total</p>
                        <p className="text-2xl font-black text-emerald-600">₹{grandTotal.toLocaleString("en-IN")}</p>
                    </div>
                    <Button type="submit" title={loading ? "Saving Inventory..." : `Complete Entry (${rows.length} Items)`} variant="primary" disabled={loading || !isFormValid} icon={<MdOutlineAddchart />} />
                </div>
            </div>
        </form>
    )
}