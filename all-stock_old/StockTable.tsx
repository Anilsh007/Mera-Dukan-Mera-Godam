"use client"

import { useEffect, useState } from "react"
import StockFilter from "./StockFilter"
import TableComponent, { TableItem } from "@/app/components/utility/CommonTable"
import useGetStock from "./useGetStock"
import { updateProduct } from "./stock.service"
import EditProductModal from "./EditProductModal"
import { Product } from "@/app/lib/db"
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
  const { products, loading, reload } = useGetStock()
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [editingProduct, setEditingProduct] = useState<TableItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(10)

  // INITIAL LOAD
  useEffect(() => {
    setFilteredProducts(products)
    setCurrentPage(1)
  }, [products])

  // EDIT CLICK → OPEN MODAL
  const handleEditClick = (product: TableItem) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  // SAVE FROM MODAL
  const handleSaveFromModal = async (updated: TableItem) => {
    if (!updated.id) return
    const { id, ...data } = updated
    try {
      await updateProduct(id, data)
      await reload()
    } catch (err) {
      console.error("Update failed:", err)
    }
    setIsModalOpen(false)
    setEditingProduct(null)
  }

  // FILTER LOGIC
  const handleFilter = (filters: Filters) => {
    const filtered = products.filter(p => {
      const createdDate = new Date(p.createdAt)
        .toISOString()
        .slice(0, 10)

      return (
        (!filters.name ||
          p.name.toLowerCase().includes(filters.name.toLowerCase())) &&
        (!filters.category ||
          p.category?.toLowerCase().includes(filters.category.toLowerCase())) &&
        (!filters.supplier ||
          p.supplier?.toLowerCase().includes(filters.supplier.toLowerCase())) &&
        (!filters.expiry || p.expiry === filters.expiry) &&
        (!filters.createdAt || createdDate === filters.createdAt) &&
        (!filters.sku ||
          (p as any).sku?.toLowerCase().includes(filters.sku.toLowerCase()))
      )
    })
    setFilteredProducts(filtered)
    setCurrentPage(1)
  }

  // PAGINATION LOGIC
  const totalPages = Math.ceil(filteredProducts.length / rowsPerPage)
  const startIndex = (currentPage - 1) * rowsPerPage
  const endIndex = startIndex + rowsPerPage
  const paginatedData = filteredProducts.slice(startIndex, endIndex)

  // LOADING
  if (loading) {
    return (
      <div className="flex h-40 items-center justify-center">
        <p className="animate-pulse text-gray-500">
          Loading inventory...
        </p>
      </div>
    )
  }

  return (
    <>
      {/* FILTER */}
      {showFilter && <StockFilter onApply={handleFilter} />}

      {/* EMPTY */}
      {filteredProducts.length === 0 ? (
        <p className="text-center text-gray-500 mt-6">No products found</p>
      ) : (
        <>
          {/* TABLE */}
          <TableComponent data={paginatedData.map(p => ({ ...p } as TableItem))} onEdit={handleEditClick} />

          {/* PAGINATION */}
          <div className="flex justify-between items-center mt-4">

            <div>
              <label>
                Rows per page:{" "}
                <select value={rowsPerPage}
                  onChange={e => {
                    setRowsPerPage(Number(e.target.value))
                    setCurrentPage(1)
                  }}
                  className="border rounded px-2 py-1"
                >
                  {[5, 10, 20, 50].map(n => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="flex items-center gap-2">
              <Button onClick={()=> setCurrentPage(p=> p-1)} disabled={currentPage === 1} variant="black" title="Prev"/>
              <span>Page {currentPage} of {totalPages || 1}</span>
              <Button onClick={()=> setCurrentPage(p=>p+1)} disabled={currentPage === totalPages} variant="black" title="Next" />
            </div>

          </div>
        </>
      )}

      {/* MODAL */}
      <EditProductModal isOpen={isModalOpen} product={editingProduct}
        onClose={() => {
          setIsModalOpen(false)
          setEditingProduct(null)
        }}
        onSave={handleSaveFromModal}
      />
    </>
  )
}