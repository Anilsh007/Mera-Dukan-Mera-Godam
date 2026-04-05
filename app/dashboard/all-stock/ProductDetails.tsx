"use client"

import { useEffect, useState } from "react"
import { Product } from "@/app/lib/db"
import { getProductLogs } from "@/app/dashboard/add-product/product.service"
import Button from "@/app/components/utility/Button"
import StockHistoryTabs from "./StockHistoryTabs"

type Props = {
    product: Product
    onBack?: () => void // 👈 optional (reusable)
}

export default function ProductDetails({ product, onBack }: Props) {
    const [logs, setLogs] = useState<any[]>([])

    useEffect(() => {
        if (product.id) {
            getProductLogs(product.id).then(setLogs)
        }
    }, [product.id])

    const isLowStock = product.quantity < 10

    return (
        <div className="space-y-6">

            {/* HEADER */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold capitalize">{product.name}</h2>
                    <p className="text-sm text-gray-500">
                        {product.category || "No category"}
                    </p>
                </div>

                {onBack && (
                    <Button title="← Back" onClick={onBack} variant="black" />
                )}
            </div>

            {/* SUMMARY CARDS */}
            <div className="grid justify-items-center grid-cols-2 md:grid-cols-5  p-4 rounded-xl bg-[var(--bg-card)] border-[var(--border-card)] shadow-[var(--shadow-card)]">

                <div>
                    <p className="text-xs text-gray-400">Stock</p>
                    <p className={`text-xl font-bold ${isLowStock ? "text-red-500" : "text-green-600"}`}>{product.quantity}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-400">Price</p>
                    <p className="text-xl font-bold">₹{product.price}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-400">Total Value</p>
                    <p className="text-xl font-bold text-emerald-600">₹{product.price * product.quantity}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-400">Created</p>
                    <p className="text-sm font-medium">{new Date(product.createdAt).toLocaleDateString()}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-400">Expiry</p>
                    <p className="text-sm font-medium">{product.expiry || "-"}</p>
                </div>
            </div>

            {/* PRODUCT INFO */}
            <div className="p-5 rounded-xl bg-[var(--bg-card)] border-[var(--border-card)] shadow-[var(--shadow-card)] space-y-2">

                <div className="grid items-center grid-cols-2 md:grid-cols-4 text-sm">
                    <h3 className="font-semibold mb-2">Product Info</h3>
                    <p><span className="text-gray-400">Supplier:</span> {product.supplier || "-"}</p>
                    <p><span className="text-gray-400">SKU:</span> {product.sku || "-"}</p>
                </div>

                {product.note && (
                    <p className="mt-2 text-sm">
                        <span className="text-gray-400">Note:</span> {product.note}
                    </p>
                )}
            </div>

            {/* HISTORY TABLE */}
            <StockHistoryTabs logs={logs} products={[product]} />

        </div>
    )
}