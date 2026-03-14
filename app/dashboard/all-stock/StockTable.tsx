"use client"

import TableComponent from "@/app/components/utility/CommonTable"
import useGetStock from "./useGetStock"

export default function StockTable() {
  const { products, loading } = useGetStock()

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 animate-pulse font-medium">
          Loading inventory...
        </p>
      </div>
    )
  }

  return (
    <>
      <TableComponent data={products as any} />
    </>
  )
}
