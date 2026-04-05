"use client"

import { Product } from "@/app/lib/db"

export default function ProductCard({
    product,
    onClick,
}: {
    product: Product
    onClick: () => void
}) {
    const isLow = product.quantity < 10
    const totalValue = product.price * product.quantity

    return (
        <div onClick={onClick} className="group p-5 rounded-2xl gap-4 bg-[var(--bg-card)] border-[var(--border-card)] shadow-[var(--shadow-card)] cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {/* TOP */}
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="font-semibold text-lg capitalize group-hover:text-emerald-600 transition">{product.name}</h2>
                    <p className="text-xs text-gray-400 mt-1">{product.category || "No category"}</p>
                </div>

                {/* STOCK BADGE */}
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${isLow ? "bg-red-100 text-red-600" : "bg-emerald-100 text-emerald-600"}`}>{isLow ? "Low" : "In Stock"}</span>
            </div>

            {/* MIDDLE */}
            <div className="mt-4 flex items-center justify-between">
                <div>
                    <p className="text-xs text-gray-400">Price</p>
                    <p className="font-semibold text-base">₹{product.price}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-400">Quantity</p>
                    <p className="font-semibold text-base">{product.quantity}</p>
                </div>

                <div>
                    <p className="text-xs text-gray-400">Total Value</p>
                    <p className="text-lg font-bold text-emerald-600">
                        ₹{totalValue}
                    </p>
                </div>
            </div>

            {/* FOOTER */}
            <div className="mt-4 flex justify-between items-center text-xs text-gray-400">
                <span>
                    {product.sku ? `SKU: ${product.sku}` : "No SKU"}
                </span>

                {product.expiry && (
                    <span className="text-amber-500">
                        Exp: {product.expiry}
                    </span>
                )}
            </div>
        </div>
    )
}