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

const columns = ["name", "category", "supplier", "expiry", "price", "quantity", "total", "createdAt", "note"] as const

type Props = {
    data: TableItem[]
    onEdit: (item: TableItem) => void
    columns?: (keyof TableItem | "total")[]
}

export default function TableComponent({ data, onEdit }: Props) {
    return (
        <div className="w-[96.5vw] md:w-auto rounded-xl border bg-[var(--bg-card)] border-[var(--border-card)] shadow-[var(--shadow-card)]">

            <div className="relative overflow-x-auto">
                <table className="w-full text-left border-collapse table-auto">
                    {/* HEADER */}
                    <thead className="bg-black/5 dark:bg-white/5">
                        <tr className="border-b border-[var(--border-card)]">
                            {columns.map(col => (
                                <th key={col} className="px-6 py-4 text-sm font-semibold capitalize whitespace-nowrap" >
                                    {col === "price" ? "Price / Item" : col === "total" ? "Total" : col}
                                </th>
                            ))}
                            <th className="px-6 py-4 text-sm font-semibold">Actions</th>
                        </tr>
                    </thead>

                    {/* BODY */}
                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {data.map((item, index) => {

                            const total = (item.price ?? 0) * (item.quantity ?? 0)

                            return (
                                <tr key={item.id ?? index} className="hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition" >

                                    {columns.map(col => {
                                        if (col === "total") {
                                            return (
                                                <td key={col} className="px-6 py-4 font-semibold text-emerald-600 whitespace-nowrap">
                                                    ₹{total.toLocaleString("en-IN")}
                                                </td>
                                            )
                                        }

                                        // PRICE
                                        if (col === "price") {
                                            return (
                                                <td key={col} className="px-6 py-4 whitespace-nowrap">
                                                    ₹{Number(item.price ?? 0).toLocaleString("en-IN")}
                                                </td>
                                            )
                                        }

                                        // QUANTITY
                                        if (col === "quantity") {
                                            return (
                                                <td key={col} className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`h-2 w-2 rounded-full ${(item.quantity ?? 0) > 5 ? "bg-emerald-500" : "bg-amber-500"}`} />
                                                        {item.quantity ?? 0} units
                                                    </div>
                                                </td>
                                            )
                                        }

                                        // DATE
                                        if (col === "createdAt") {
                                            return (
                                                <td key={col} className="px-6 py-4 text-gray-600 dark:text-gray-400 whitespace-nowrap" >
                                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString(
                                                        "en-IN",
                                                        { day: "2-digit", month: "short", year: "numeric" }
                                                    ) : "N/A"}
                                                </td>
                                            )
                                        }

                                        // DEFAULT TEXT FIELDS
                                        return (
                                            <td key={col} className="px-6 py-4 whitespace-nowrap" >
                                                {(item as any)[col] ?? "N/A"}
                                            </td>
                                        )
                                    })}

                                    {/* ACTION */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <Button title="Edit" variant="primary" onClick={() => onEdit(item)} />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

            </div>

            {/* EMPTY STATE */}
            {data.length === 0 && (
                <div className="py-12 text-center text-gray-500 text-sm">
                    No stock items found.
                </div>
            )}
        </div>
    )
}