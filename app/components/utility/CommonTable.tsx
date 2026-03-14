interface TableItem {
    id?: number | string | null;
    name?: string;
    category?: string;
    price?: number;
    quantity?: number;
    createdAt?: string;
}

export default function TableComponent({ data }: { data: TableItem[] }) {
    return (
        <div className="overflow-hidden rounded-xl border bg-[var(--bg-card)] border-[var(--border-card)] shadow-[var(--shadow-card)]">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-black-90/90 dark:bg-white/5">
                        <tr className="border-b border-[var(--border-card)]">
                            {data.length > 0 && Object.keys(data[0])
                                .filter(key => key !== 'id' && key !== 'UserId' && key !== 'userId')
                                .map((key) => (
                                    <th key={key} className="px-6 py-4 text-sm font-semibold text-[var(--text-primary)] capitalize">
                                        {key}
                                    </th>
                                ))
                            }
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                        {data.map((item, index) => (
                            <tr key={item.id ?? index} className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors duration-150">
                                <td className="px-6 py-4 text-sm font-medium text-[var(--text-primary)]">
                                    {item.name || "N/A"}
                                </td>
                                <td className="px-6 py-4 text-sm">
                                    <span className="inline-flex items-center rounded-md bg-gray-100 dark:bg-gray-800 px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                                        {item.category || "General"}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400 font-mono">
                                    ${item.price?.toLocaleString() ?? '0'}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                                    <div className="flex items-center gap-2">
                                        <span className={`h-2 w-2 rounded-full ${(item.quantity ?? 0) > 5 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                        {item.quantity ?? 0} units
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {data.length === 0 && (
                <div className="py-12 text-center text-gray-500 dark:text-gray-400 text-sm">
                    No stock items found.
                </div>
            )}
        </div>
    )
}
