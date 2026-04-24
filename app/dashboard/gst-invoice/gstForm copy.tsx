"use client"

import { useState } from "react"
import Input from "@/app/components/utility/CommonInput"
import { calculateGST, numberToWords, GSTInvoice } from "@/app/dashboard/gst-invoice/gst.types"

export default function GstForm() {

    const [invoice, setInvoice] = useState<GSTInvoice>({
        invoiceNo: "",
        invoiceDate: "",
        seller: { name: "", gstin: "", address: "", city: "", state: "", pincode: "" },
        buyer: { name: "", address: "", city: "", state: "", pincode: "" },
        items: [],
        totals: {
            taxableValue: 0,
            cgstTotal: 0,
            sgstTotal: 0,
            igstTotal: 0,
            grandTotal: 0,
            amountInWords: ""
        }
    })

    const [isInterState, setIsInterState] = useState(false)

    // 🧠 Add Item
    const addItem = () => {
        const newItem = {
            description: "",
            hsnCode: "",
            quantity: 1,
            unit: "pcs",
            rate: 0,
            taxableValue: 0,
            cgstRate: 9,
            cgstAmount: 0,
            sgstRate: 9,
            sgstAmount: 0,
            igstRate: 18,
            igstAmount: 0,
            total: 0
        }

        setInvoice(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }))
    }

    // 🧠 Update Item
    const updateItem = (index: number, field: string, value: any) => {
        const items = [...invoice.items]
        items[index] = { ...items[index], [field]: value }

        const gst = calculateGST(
            items[index].igstRate,
            items[index].quantity,
            items[index].rate,
            isInterState
        )

        items[index] = {
            ...items[index],
            taxableValue: gst.taxableValue,
            cgstAmount: gst.cgst,
            sgstAmount: gst.sgst,
            igstAmount: gst.igst,
            total: gst.total
        }

        setInvoice(prev => ({ ...prev, items }))
        calculateTotals(items)
    }

    // 🧠 Totals
    const calculateTotals = (items: any[]) => {
        const totals = items.reduce((acc, item) => {
            acc.taxableValue += item.taxableValue
            acc.cgstTotal += item.cgstAmount
            acc.sgstTotal += item.sgstAmount
            acc.igstTotal += item.igstAmount
            acc.grandTotal += item.total
            return acc
        }, {
            taxableValue: 0,
            cgstTotal: 0,
            sgstTotal: 0,
            igstTotal: 0,
            grandTotal: 0
        })

        totals.amountInWords = numberToWords(totals.grandTotal)

        setInvoice(prev => ({ ...prev, totals }))
    }

    return (
        <div className="space-y-6">

            {/* Invoice Info */}
            <div className="grid grid-cols-2 gap-4">
                <Input label="Invoice No" onChange={e => setInvoice({ ...invoice, invoiceNo: e.target.value })} />
                <Input type="date" label="Date" onChange={e => setInvoice({ ...invoice, invoiceDate: e.target.value })} />
            </div>

            {/* Seller */}
            <div>
                <h3 className="font-semibold mb-2">Seller Details</h3>
                <Input label="Name" />
                <Input label="GSTIN" />
                <Input label="Address" />
            </div>

            {/* Buyer */}
            <div>
                <h3 className="font-semibold mb-2">Buyer Details</h3>
                <Input label="Name" />
                <Input label="GSTIN" />
                <Input label="Address" />
            </div>

            {/* GST Type */}
            <div className="flex items-center gap-2">
                <input type="checkbox" onChange={(e) => setIsInterState(e.target.checked)} />
                <span>Inter-State (IGST)</span>
            </div>

            {/* Items */}
            <div>
                <button onClick={addItem} className="px-4 py-2 bg-emerald-500 text-white rounded-lg">
                    + Add Item
                </button>

                {invoice.items.map((item, i) => (
                    <div key={i} className="grid grid-cols-5 gap-2 mt-3">
                        <Input placeholder="Item" onChange={e => updateItem(i, "description", e.target.value)} />
                        <Input type="number" placeholder="Qty" onChange={e => updateItem(i, "quantity", Number(e.target.value))} />
                        <Input type="number" placeholder="Rate" onChange={e => updateItem(i, "rate", Number(e.target.value))} />
                        <Input type="number" placeholder="GST %" onChange={e => updateItem(i, "igstRate", Number(e.target.value))} />
                        <div className="flex items-center text-sm font-semibold">
                            ₹{item.total}
                        </div>
                    </div>
                ))}
            </div>

            {/* Totals */}
            <div className="border-t pt-4 text-sm space-y-1">
                <p>Taxable: ₹{invoice.totals.taxableValue}</p>
                <p>CGST: ₹{invoice.totals.cgstTotal}</p>
                <p>SGST: ₹{invoice.totals.sgstTotal}</p>
                <p>IGST: ₹{invoice.totals.igstTotal}</p>
                <p className="font-bold text-lg">Total: ₹{invoice.totals.grandTotal}</p>
                <p className="italic">{invoice.totals.amountInWords}</p>
            </div>
        </div>
    )
}