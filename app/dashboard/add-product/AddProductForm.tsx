"use client"

import { useState } from "react"
import useAddProduct from "./useAddProduct"
import Button from "@/app/components/utility/Button"
import { MdOutlineAddchart } from "react-icons/md"
import Input from "@/app/components/utility/CommonInput"

const INITIAL_STATE = { name: "", price: "", quantity: "", category: "" };

const FORM_FIELDS = [
    { name: "name", placeholder: "Product Name", required: true },
    { name: "category", placeholder: "Category", required: false },
    { name: "price", placeholder: "Price", type: "number", required: true },
    { name: "quantity", placeholder: "Stock Quantity", type: "number", required: true },
] as const;

export default function AddProductForm() {
    const { createProduct, loading } = useAddProduct()
    const [form, setForm] = useState(INITIAL_STATE)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        await createProduct(form, () => setForm(INITIAL_STATE));
    }

    // Unnecessary 'any' aur extra checks nikale
    const isFormValid = FORM_FIELDS
        .filter(f => f.required)
        .every(f => form[f.name as keyof typeof INITIAL_STATE]?.toString().trim() !== "");

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-xl bg-[var(--bg-card)] border-[var(--border-card)] shadow-[var(--shadow-card)]">
            <h2 className="text-2xl font-bold">Add Product</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {FORM_FIELDS.map((field) => (
                    <Input 
                        key={field.name} 
                        {...field} // Spread attributes
                        onChange={handleChange} 
                        value={form[field.name as keyof typeof INITIAL_STATE]} 
                    />
                ))}
            </div>
            <Button 
                type="submit" 
                title={loading ? "Adding..." : "Add Product"} 
                variant="primary" 
                icon={<MdOutlineAddchart />} 
                disabled={loading || !isFormValid} 
            />
        </form>
    )
}
