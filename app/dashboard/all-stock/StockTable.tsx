"use client"
import TableComponent from "@/app/components/utility/CommonTable"
import useGetStock from "./useGetStock"
import StockFilter from "./StockFilter"
import { useEffect, useState } from "react"
import Button from "@/app/components/utility/Button"

type Filters = {
  name: string
  category: string
  supplier: string
  expiry: string
  createdAt: string
  sku: string
}

export default function StockTable({ showFilter }: { showFilter: boolean }) {
  const { products, loading } = useGetStock()
  const [filteredProducts, setFilteredProducts] = useState<any[]>([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  useEffect(() => {
    setFilteredProducts(products)
    setCurrentPage(1) // reset page when products change
  }, [products])

  // Filter function
  function handleFilter(filters: Filters) {
    const filtered = products.filter(p => {
      const createdDate = new Date(p.createdAt).toISOString().slice(0, 10)
      return (
        (!filters.name || p.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.category || p.category?.toLowerCase().includes(filters.category.toLowerCase())) &&
        (!filters.supplier || p.supplier?.toLowerCase().includes(filters.supplier.toLowerCase())) &&
        (!filters.expiry || p.expiry === filters.expiry) &&
        (!filters.createdAt || createdDate === filters.createdAt) &&
        (!filters.sku || p.sku?.toLowerCase().includes(filters.sku.toLowerCase()))
      )
    })
    setFilteredProducts(filtered)
    setCurrentPage(1) // reset page after filter applied
  }

  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="text-gray-500 dark:text-gray-400 animate-pulse font-medium">
          Loading inventory...
        </p>
      </div>
    )
  }

  // Calculate pagination
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedData = filteredProducts.slice(startIndex, endIndex)

  return (
    <>
      {showFilter && <StockFilter onApply={handleFilter} />}

      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 mt-6">No products found</p>
      ) : (
        <>
          <TableComponent data={paginatedData} />

          <div className="flex justify-between items-center mt-4">
            <div>
              <label>
                Rows per page:{" "}
                <select value={rowsPerPage} onChange={e => {
                  setRowsPerPage(Number(e.target.value))
                  setCurrentPage(1)
                }}
                  className="border border-[var(--border-color)] rounded-xl cursor-pointer bg-[var(--bg-card)] px-2 py-2"
                >
                  {[5, 10, 20, 50].map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-2">
              <Button variant="black" title="Prev" onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1} />
              <span>Page {currentPage} of {totalPages}</span>
              <Button variant="black" title="Next" onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages} />
            </div>
          </div>
        </>
      )}
    </>
  )
}