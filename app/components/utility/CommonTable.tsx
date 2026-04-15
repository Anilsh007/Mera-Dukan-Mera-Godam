"use client"

import Button from "@/app/components/utility/Button"

export interface TableItem {
    id?: number
    name?: string
    category?: string
    supplier?: string
    expiry?: string
    price?: number
    quantity?: number
    createdAt?: string
    note?: string
}

type Props = {
    data: TableItem[]
    onEdit: (item: TableItem) => void
}

// Already-formatted strings (from StockHistoryTabs) ko dobara parse mat karo
function smartDate(val?: string) {
    if (!val || val === "-") return "-"
    const d = new Date(val)
    if (isNaN(d.getTime())) return val  // already a human-readable string
    return d.toLocaleString("en-IN", {
        day: "2-digit", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", hour12: true,
    })
}

function ExpiryCell({ val }: { val?: string }) {
    if (!val || val === "-") return <span className="text-[var(--text-muted)]">—</span>
    const d = new Date(val)
    const now = new Date()
    const days = Math.ceil((d.getTime() - now.getTime()) / 86400000)
    if (isNaN(d.getTime())) return <span>{val}</span>
    const cls = days < 0 ? "text-red-500 font-semibold" : days <= 30 ? "text-amber-500 font-medium" : "text-[var(--text-secondary)]"
    const label = days < 0 ? `${val} (Expired)` : days <= 30 ? `${val} (${days}d)` : val
    return <span className={cls}>{label}</span>
}

function QtyCell({ qty }: { qty?: number }) {
    const q = qty ?? 0
    const dot = q === 0 ? "bg-red-500" : q <= 5 ? "bg-red-400" : q <= 10 ? "bg-amber-400" : "bg-emerald-500"
    const txt = q === 0 ? "text-red-500 font-semibold" : q <= 10 ? "text-amber-600" : "text-[var(--text-primary)]"
    return (
        <span className={`inline-flex items-center gap-1.5 ${txt}`}>
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
            {q}
        </span>
    )
}

function TypeBadge({ category }: { category?: string }) {
    if (!category || category === "-") return <span className="text-[var(--text-muted)]">—</span>
    if (category.includes("↑") || category === "in")
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 whitespace-nowrap">↑ Stock In</span>
    if (category.includes("↓") || category === "out")
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 whitespace-nowrap">↓ Stock Out</span>
    return <span className="capitalize text-[var(--text-primary)]">{category}</span>
}

const COLS = [
    { key: "name", label: "Product" },
    { key: "category", label: "Type / Category" },
    { key: "supplier", label: "Supplier / Reason" },
    { key: "expiry", label: "Expiry" },
    { key: "price", label: "Price" },
    { key: "quantity", label: "Qty" },
    { key: "total", label: "Total" },
    { key: "createdAt", label: "Date & Time" },
    { key: "note", label: "Note" },
] as const

export default function TableComponent({ data, onEdit }: Props) {
    if (data.length === 0) {
        return (
            <div className="py-14 text-center text-[var(--text-muted)]">
                <p className="text-4xl mb-3">📋</p>
                <p className="text-sm">No records found</p>
            </div>
        )
    }

    return (
        <div className="w-full rounded-xl border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)] overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm" style={{ minWidth: 780 }}>

                    <thead className="bg-black/5 dark:bg-white/5">
                        <tr className="border-b border-[var(--border-card)]">
                            {COLS.map(c => (
                                <th key={c.key} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)] whitespace-nowrap">
                                    {c.label}
                                </th>
                            ))}
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Action</th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--border-card)]">
                        {data.map((item, i) => {
                            const total = (item.price ?? 0) * (item.quantity ?? 0)
                            return (
                                <tr key={item.id ?? i} className="hover:bg-blue-50/40 dark:hover:bg-white/[0.03] transition-colors">

                                    {/* Product name */}
                                    <td className="px-4 py-3 whitespace-nowrap font-medium capitalize text-[var(--text-primary)]">
                                        {item.name || "—"}
                                    </td>

                                    {/* Type / Category */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <TypeBadge category={item.category} />
                                    </td>

                                    {/* Supplier / Reason */}
                                    <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                                        {item.supplier && item.supplier !== "-" ? item.supplier : <span className="text-[var(--text-muted)]">—</span>}
                                    </td>

                                    {/* Expiry */}
                                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                                        <ExpiryCell val={item.expiry} />
                                    </td>

                                    {/* Price */}
                                    <td className="px-4 py-3 whitespace-nowrap font-medium text-[var(--text-primary)]">
                                        ₹{Number(item.price ?? 0).toLocaleString("en-IN")}
                                    </td>

                                    {/* Quantity */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <QtyCell qty={item.quantity} />
                                    </td>

                                    {/* Total */}
                                    <td className="px-4 py-3 whitespace-nowrap font-semibold text-emerald-600 dark:text-emerald-400">
                                        ₹{total.toLocaleString("en-IN")}
                                    </td>

                                    {/* Date */}
                                    <td className="px-4 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">
                                        {smartDate(item.createdAt)}
                                    </td>

                                    {/* Note */}
                                    <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[140px]">
                                        <span className="block truncate" title={item.note}>
                                            {item.note && item.note !== "-" ? item.note : <span className="text-[var(--text-muted)]">—</span>}
                                        </span>
                                    </td>

                                    {/* Action */}
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        <Button title="Edit" variant="soft-primary" onClick={() => onEdit(item)} />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
