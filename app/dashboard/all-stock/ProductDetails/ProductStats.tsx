import { CalendarClock, IndianRupee, Package2, TrendingDown, TrendingUp, Truck, ScanBarcode, AlertTriangle, } from "lucide-react"
import Button from "@/app/components/utility/Button"
import { Product } from "@/app/lib/db"

type Log = {
    id: string
    quantityAdded: number
    price: number
    expiry?: string
}

export default function ProductStats({
    product,
    logs,
    setModal,
}: {
    product: Product
    logs: Log[]
    setModal: (type: "in" | "out" | null) => void
}) {
    const isOut = product.quantity === 0
    const isCritical = product.quantity > 0 && product.quantity <= 5
    const isLow = product.quantity > 5 && product.quantity <= 10

    const qtyColor = isOut ? "text-red-500" : isCritical ? "text-red-400" : isLow ? "text-amber-500" : "text-emerald-600"

    const totalIn = logs
        .filter((l) => l.quantityAdded > 0)
        .reduce((sum, l) => sum + l.quantityAdded, 0)

    const totalOut = logs
        .filter((l) => l.quantityAdded < 0)
        .reduce((sum, l) => sum + Math.abs(l.quantityAdded), 0)

    const latestPrice =
        logs.find((l) => Number(l.price) > 0)?.price || (product as any).price || 0

    const inventoryValue = Number(product.quantity || 0) * Number(latestPrice || 0)

    const latestExpiry =
        logs
            .filter((l) => l.expiry)
            .map((l) => l.expiry)
            .sort()[0] || (product as any).expiry

    const stockStatus = isOut
        ? {
            label: "Out of stock",
            tone: "bg-red-50 text-red-600 border-red-100",
            icon: AlertTriangle,
        }
        : isCritical
            ? {
                label: "Critical stock",
                tone: "bg-red-50 text-red-500 border-red-100",
                icon: AlertTriangle,
            }
            : isLow
                ? {
                    label: "Low stock",
                    tone: "bg-amber-50 text-amber-600 border-amber-100",
                    icon: AlertTriangle,
                }
                : {
                    label: "Healthy stock",
                    tone: "bg-emerald-50 text-emerald-600 border-emerald-100",
                    icon: Package2,
                }

    const StatusIcon = stockStatus.icon

    const stats = [
        {
            label: "Total In",
            value: totalIn,
            icon: TrendingUp,
            tone: "text-emerald-600 bg-emerald-50",
        },
        {
            label: "Total Out",
            value: totalOut,
            icon: TrendingDown,
            tone: "text-rose-600 bg-rose-50",
        },
        {
            label: "Inventory Value",
            value: inventoryValue ? `₹${inventoryValue.toLocaleString("en-IN")}` : "—",
            icon: IndianRupee,
            tone: "text-sky-600 bg-sky-50",
        },
        {
            label: "Expiry",
            value: latestExpiry || "—",
            icon: CalendarClock,
            tone: "text-violet-600 bg-violet-50",
        },
    ]

    return (
        <div className="space-y-5">
            <div className="grid gap-5 lg:grid-cols-[1.3fr_0.7fr]">
                <div className="overflow-hidden rounded-[28px] border border-[var(--border-card)] bg-[var(--surface-primary)] shadow-[var(--shadow-card)]">
                    <div className="border-b border-[var(--border-card)] p-5 sm:p-6">
                        <div>
                            <h3 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
                                {product.name}
                            </h3>
                        </div>

                        <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${stockStatus.tone}`} ><StatusIcon size={14} /> {stockStatus.label} </div>
                    </div>

                    <div className="p-5 sm:p-6">
                        <div className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
                            <div className="rounded-[24px] bg-gradient-to-br from-[var(--surface-secondary)] to-[var(--surface-primary)] p-5 ring-1 ring-black/5">
                                <p className="text-sm font-medium text-[var(--text-secondary)]">Current Quantity</p>
                                <div className="mt-3 flex items-end justify-between gap-3">
                                    <div>
                                        <p className={`text-4xl font-bold tracking-tight ${qtyColor}`}>
                                            {product.quantity}
                                        </p>
                                        <p className="mt-1 text-sm text-[var(--text-secondary)]">
                                            Available units in stock
                                        </p>
                                    </div>

                                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--btn-primary)]/10 text-[var(--btn-primary)]">
                                        <Package2 size={26} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid gap-3">
                                <InfoMiniCard icon={ScanBarcode} label="SKU" value={product.sku || "—"} />
                                <InfoMiniCard icon={Truck} label="Supplier" value={(product as any).supplier || "—"} />
                            </div>
                        </div>

                        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                            <Button onClick={() => setModal("in")} title="Add Stock" icon={<TrendingUp size={16} />} variant="success" className="w-full sm:w-auto" />

                            <Button onClick={() => setModal("out")} title="Sale Stock" icon={<TrendingDown size={16} />} variant="danger" className="w-full sm:w-auto" />
                        </div>
                    </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                    {stats.map((stat) => (
                        <div
                            key={stat.label}
                            className="rounded-[24px] border border-[var(--border-card)] bg-[var(--surface-primary)] p-4 shadow-[var(--shadow-card)]"
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="text-sm font-medium text-[var(--text-secondary)]">{stat.label}</p>
                                    <p className="mt-2 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                                        {typeof stat.value === "number"
                                            ? stat.value.toLocaleString("en-IN")
                                            : stat.value}
                                    </p>
                                </div>

                                <div
                                    className={`flex h-11 w-11 items-center justify-center rounded-2xl ${stat.tone}`}
                                >
                                    <stat.icon size={18} />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

function InfoMiniCard({
    icon: Icon,
    label,
    value,
}: {
    icon: any
    label: string
    value: string
}) {
    return (
        <div className="rounded-[20px] border border-[var(--border-card)] bg-[var(--surface-secondary)] p-4">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[var(--btn-primary)]/10 text-[var(--btn-primary)]">
                    <Icon size={18} />
                </div>

                <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)]">
                        {label}
                    </p>
                    <p className="truncate text-sm font-semibold text-[var(--text-primary)]">{value || "—"}</p>
                </div>
            </div>
        </div>
    )
}