"use client"

import { CalendarClock, IndianRupee, Package2, TrendingDown, TrendingUp, Truck, ScanBarcode, AlertTriangle, } from "lucide-react"
import Button from "@/app/components/utility/Button"
import { Product } from "@/app/lib/db"

type Log = {
    id: string
    quantityAdded: number
    price: number
    expiry?: string
    type?: "in" | "out"
}

export default function ProductStats({ product, logs, setModal, }: {
    product: Product
    logs: Log[]
    setModal: (type: "in" | "out" | null) => void
}) {
    const isOut = product.quantity === 0
    const isCritical = product.quantity > 0 && product.quantity <= 5
    const isLow = product.quantity > 5 && product.quantity <= 10

    // ─── Quantities ───────────────────────────────────────────────
    const totalInQty = logs
        .filter((l) => l.quantityAdded > 0)
        .reduce((sum, l) => sum + l.quantityAdded, 0)

    const totalOutQty = logs
        .filter((l) => l.quantityAdded < 0)
        .reduce((sum, l) => sum + Math.abs(l.quantityAdded), 0)

    // ─── Values (rupees) ─────────────────────────────────────────
    // Total kitna kharch hua (stock khareedne par)
    const totalInValue = logs
        .filter((l) => l.quantityAdded > 0)
        .reduce((sum, l) => sum + l.quantityAdded * Number(l.price || 0), 0)

    // Total kitna kamaya (sale se)
    const totalOutValue = logs
        .filter((l) => l.quantityAdded < 0)
        .reduce((sum, l) => sum + Math.abs(l.quantityAdded) * Number(l.price || 0), 0)

    // Bacha hua stock ki value = current qty x current price
    const inventoryValue = Number(product.quantity || 0) * Number(product.price || 0)

    // Net Profit = sale revenue - (avg purchase cost x sold qty)
    const avgPurchasePrice = totalInQty > 0 ? totalInValue / totalInQty : Number(product.price || 0)
    const costOfSoldGoods = totalOutQty * avgPurchasePrice
    const netProfit = totalOutValue - costOfSoldGoods

    // ─── Nearest Expiry ───────────────────────────────────────────
    const latestExpiry =
        logs
            .filter((l) => l.quantityAdded > 0 && l.expiry)
            .map((l) => l.expiry as string)
            .sort((a, b) => new Date(a).getTime() - new Date(b).getTime())[0]
        || (product as any).expiry

    const stockStatus = isOut
        ? { label: "Out of stock", tone: "bg-[var(--out-stock)] text-[var(--out-stock-text)] border-[var(--out-stock-border)]", icon: AlertTriangle }
        : isCritical
            ? { label: "Critical stock", tone: "bg-[var(--critical-stock)] text-[var(--critical-stock-text)] border-[var(--critical-stock-border)]", icon: AlertTriangle }
            : isLow
                ? { label: "Low stock", tone: "bg-[var(--low-stock)] text-[var(--low-stock-text)] border-[var(--low-stock-border)]", icon: AlertTriangle }
                : { label: "Healthy stock", tone: "bg-[var(--all-stock)] text-[var(--all-stock-text)] border-[var(--all-stock-border)]", icon: Package2 }

    const StatusIcon = stockStatus.icon

    const cardClass = "rounded-xl sm:rounded-2xl border border-[var(--border-card)] bg-[var(--surface-primary)] p-3 sm:p-4 shadow-[var(--shadow-card)]"

    const stats: {
        label: string
        value: string | number
        sub?: string | null
        icon: any
        tone: string
    }[] = [
            {
                label: "Net Qty",
                value: product.quantity,
                sub: "abhi available",
                icon: Package2,
                tone: "text-var(--all-stock-text) bg-var(--all-stock)",
            },
            {
                label: "Total Out",
                value: totalOutQty,
                sub: totalOutValue > 0 ? `+₹${totalOutValue.toLocaleString("en-IN")} mila` : null,
                icon: TrendingDown,
                tone: "text-[var(--out-stock-text)] bg-[var(--out-stock)]",
            },
            {
                label: "Inventory Value",
                value: inventoryValue > 0 ? `₹${inventoryValue.toLocaleString("en-IN")}` : "—",
                sub: product.quantity > 0
                    ? `${product.quantity} × ₹${Number(product.price).toLocaleString("en-IN")}`
                    : null,
                icon: IndianRupee,
                tone: "text-[var(--all-stock-text)] bg-[var(--all-stock)]",
            },
            {
                label: "Net Profit",
                value: totalOutQty > 0
                    ? `${netProfit >= 0 ? "+" : ""}₹${Math.round(netProfit).toLocaleString("en-IN")}`
                    : "—",
                sub: totalOutQty > 0
                    ? netProfit >= 0 ? "faayda hua" : "nuksaan hua"
                    : "Abhi koi sale nahi",
                icon: IndianRupee,
                tone: totalOutQty > 0
                    ? netProfit >= 0
                        ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-900/20"
                        : "text-red-700 bg-red-50 dark:text-red-400 dark:bg-red-900/20"
                    : "text-[var(--all-stock-text)] bg-[var(--all-stock)]",
            },
            {
                label: "Expiry (Nearest)",
                value: latestExpiry || "—",
                sub: null,
                icon: CalendarClock,
                tone: "text-[var(--all-stock-text)] bg-[var(--all-stock)]",
            },
        ]

    return (
        <div className="space-y-4 sm:space-y-5">
            <div className="overflow-hidden rounded-2xl sm:rounded-[28px]">

                {/* Header */}
                <div className="border-b border-[var(--border-card)] p-4 sm:p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border border-[var(--border-card)] bg-[var(--bg-card)] shadow-[var(--shadow-card)]">
                    <div className="min-w-0">
                        <h3 className="text-lg sm:text-xl font-bold truncate">{product.name}</h3>
                        <div className={`mt-2 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${stockStatus.tone}`}>
                            <StatusIcon size={14} />
                            {stockStatus.label}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 sm:gap-3 w-full md:w-auto">
                        <Button onClick={() => setModal("in")} title="Add Stock" icon={<TrendingUp size={16} />} variant="success" className="w-full sm:w-auto text-xs sm:text-sm" />
                        <Button onClick={() => setModal("out")} title="Sale Stock" icon={<TrendingDown size={16} />} variant="danger" className="w-full sm:w-auto text-xs sm:text-sm" />
                    </div>
                </div>

                {/* Grid */}
                <div className="grid gap-3 p-4 sm:p-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-t border-zinc-400/40 bg-[var(--bg-card)]">
                    <InfoMiniCard icon={ScanBarcode} label="SKU" value={product.sku || "—"} className={cardClass} />
                    <InfoMiniCard icon={Truck} label="Supplier" value={(product as any).supplier || "—"} className={cardClass} />

                    {stats.map((stat) => (
                        <div key={stat.label} className="rounded-xl sm:rounded-2xl border border-[var(--border-card)] bg-[var(--surface-primary)] p-3 sm:p-4 shadow-[var(--shadow-card)]">
                            <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{stat.label}</p>
                                    <p className="mt-1 text-base sm:text-xl font-bold truncate">
                                        {typeof stat.value === "number"
                                            ? stat.value.toLocaleString("en-IN")
                                            : stat.value}
                                    </p>
                                    {stat.sub && (
                                        <p className="mt-0.5 text-[11px] text-[var(--text-secondary)] truncate">{stat.sub}</p>
                                    )}
                                </div>
                                <div className={`flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl shrink-0 ml-2 ${stat.tone}`}>
                                    <stat.icon size={16} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function InfoMiniCard({ icon: Icon, label, value, className }: {
    icon: any
    label: string
    value: string
    className?: string
}) {
    return (
        <div className={className}>
            <div className="flex items-center justify-between">
                <div className="min-w-0">
                    <p className="text-xs sm:text-sm text-[var(--text-secondary)]">{label}</p>
                    <p className="mt-1 text-base sm:text-xl font-bold truncate">{value || "—"}</p>
                </div>
                <div className="flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-xl bg-[var(--btn-primary)]/10 text-[var(--btn-primary)]">
                    <Icon size={16} />
                </div>
            </div>
        </div>
    )
}
