"use client"

import { Boxes, Package2, IndianRupee, Tag, Truck, CalendarClock, ChevronDown } from "lucide-react"
import type { Product } from "@/app/lib/db"

type CategoryGroup = {
    label: string
    products: Product[]
    totalQty: number
    totalValue: number
}

function expiryInfo(expiry?: string) {
    if (!expiry) return null

    const days = Math.ceil(
        (new Date(expiry).getTime() - Date.now()) / 86400000
    )

    if (days < 0) {
        return {
            label: "Expired",
            cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        }
    }

    if (days <= 7) {
        return {
            label: `${days}d left`,
            cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        }
    }

    if (days <= 30) {
        return {
            label: `${days}d left`,
            cls: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        }
    }

    return null
}

function getGroupStockState(products: Product[]) {
    const totalQty = products.reduce((sum, p) => sum + p.quantity, 0)
    const hasCritical = products.some((p) => p.quantity > 0 && p.quantity <= 5)
    const hasLow = products.some((p) => p.quantity > 5 && p.quantity <= 10)

    if (totalQty === 0) {
        return {
            label: "Out of Stock",
            cls: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
        }
    }

    if (hasCritical) {
        return {
            label: "Critical",
            cls: "bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400",
        }
    }

    if (hasLow) {
        return {
            label: "Low Stock",
            cls: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
        }
    }

    return {
        label: "In Stock",
        cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    }
}

type ProductGroupCardProps = {
    group: CategoryGroup
    onSelect: () => void
}

export default function ProductGroupCard({
    group,
    onSelect,
}: ProductGroupCardProps) {
    const stockState = getGroupStockState(group.products)
    const previewProducts = group.products.slice(0, 2)

    return (
        <div className="group/card w-full break-inside-avoid rounded-3xl border-[var(--border-card)] bg-[var(--surface-card)] p-5 text-left shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 cursor-pointer">
            {/* Main clickable card */}
            <div onClick={onSelect} role="button" tabIndex={0}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        onSelect()
                    }
                }}
            >
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="flex items-center gap-2">
                            <div className="rounded-2xl bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
                                <Boxes className="h-4 w-4" />
                            </div>
                            <div>
                                <h3 className="truncate text-lg font-semibold capitalize">
                                    {group.label}
                                </h3>
                            </div>
                        </div>
                    </div>

                    <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-medium ${stockState.cls}`}>
                        {stockState.label}
                    </span>
                </div>

                {/* Summary Stats */}
                <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-[var(--surface-primary)] p-3">
                        <div className="mb-1 flex items-center gap-1 text-sky-500">
                            <Package2 className="h-3.5 w-3.5" />
                            <span className="text-xs text-[var(--text-secondary)]">products</span>
                        </div>
                        <p className="text-sm font-semibold">{group.products.length}</p>
                    </div>

                    <div className="rounded-2xl bg-[var(--surface-primary)] p-3">
                        <div className="mb-1 flex items-center gap-1 text-violet-500">
                            <Tag className="h-3.5 w-3.5" />
                            <span className="text-xs text-[var(--text-secondary)]">Qty</span>
                        </div>
                        <p className="text-sm font-semibold">{group.totalQty}</p>
                    </div>

                    <div className="rounded-2xl bg-[var(--surface-primary)] p-3">
                        <div className="mb-1 flex items-center gap-1 text-emerald-500">
                            <IndianRupee className="h-3.5 w-3.5" />
                            <span className="text-xs text-[var(--text-secondary)]">Value</span>
                        </div>
                        <p className="text-sm font-semibold">
                            ₹{group.totalValue.toLocaleString("en-IN")}
                        </p>
                    </div>
                </div>
            </div>

            {/* Preview Products - separate section for masonry */}
            {previewProducts.length > 0 && (
                <div className="mt-3 space-y-2">
                    {previewProducts.map((product) => {
                        const expInfo = expiryInfo(product.expiry)

                        return (
                            <div key={product.id} className="rounded-2xl border border-[var(--border-card)] bg-[var(--surface-primary)] px-3 py-3 shadow-[var(--shadow-card)]"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="truncate font-semibold capitalize">
                                            {product.name}
                                        </p>
                                    </div>

                                    {(product.expiry || product.supplier) && (
                                        <div className="flex flex-wrap gap-2 text-xs text-[var(--text-secondary)]">
                                            {product.supplier && (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300">
                                                    <Truck className="h-3 w-3" />
                                                    {product.supplier}
                                                </span>
                                            )}

                                            {(expInfo || product.expiry) && (
                                                <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 ${expInfo?.cls || "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-300"}`}>
                                                    <CalendarClock className="h-3 w-3" />
                                                    {expInfo ? expInfo.label : `Exp: ${product.expiry}`}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-3 grid grid-cols-3 justify-items-center gap-3 text-xs">
                                    <div>
                                        <p className="text-[var(--text-secondary)]">Price</p>
                                        <p className="font-medium">
                                            ₹{product.price.toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[var(--text-secondary)]">Value</p>
                                        <p className="font-medium">
                                            ₹{(product.price * product.quantity).toLocaleString("en-IN")}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[var(--text-secondary)]">Qty</p>
                                        <p className="font-medium">{product.quantity}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })}

                    {/* See More Products Button */}
                    {group.products.length > 2 && (
                        <button onClick={onSelect} type="button" className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-[var(--border-card)] px-4 py-2.5 text-xs font-medium text-[var(--text-secondary)] transition-all hover:bg-[var(--surface-primary)] hover:text-[var(--text-primary)] hover:shadow-md hover:border-[var(--border-primary)]" >
                            <ChevronDown className="h-3.5 w-3.5 -rotate-90 group-hover/card-hover:rotate-0 transition-transform duration-200" />
                            +{group.products.length - 2} Please click to see more
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}