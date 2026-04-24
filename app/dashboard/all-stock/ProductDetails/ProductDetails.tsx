"use client"

import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, LayoutGrid, PackageSearch } from "lucide-react"
import { Product } from "@/app/lib/db"
import { getProductLogs } from "@/app/dashboard/add-product/product.service"
import Button from "@/app/components/utility/Button"
import StockHistoryTabs from "../StockHistoryTabs"
import StockInModal from "../StockInModal"
import StockOutModal from "../StockOutModal"
import ProductStats from "./ProductStats"

type CategoryGroup = {
  key: string
  label: string
  products: Product[]
  totalQty: number
  totalValue: number
}

type Log = {
  id: string
  date: string
  quantityAdded: number
  type?: "in" | "out"
  reason?: string
  price: number
  expiry?: string
  note?: string
  productId?: string
}

export default function ProductDetails({
  group,
  activeProductId,
  onChangeProduct,
  onBack,
}: {
  group: CategoryGroup
  activeProductId: string | null
  onChangeProduct: (productId: string | null) => void
  onBack?: () => void
}) {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<"in" | "out" | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const activeProduct = useMemo(() => {
    return (
      group.products.find((p) => p.id === activeProductId) ??
      group.products[0]
    )
  }, [group.products, activeProductId])

  // refreshTrigger badalne par logs dobara fetch honge (Stock In/Out ke baad)
  useEffect(() => {
    if (!activeProduct?.id) return

    setLoading(true)
    getProductLogs(activeProduct.id).then((data) => {
      setLogs(data.map((log: any) => ({ ...log, id: String(log.id) })))
      setLoading(false)
    })
  }, [activeProduct?.id, refreshTrigger])

  // Modal close hone par logs auto-refresh ho jayenge
  const handleModalClose = () => {
    setModal(null)
    setRefreshTrigger((t) => t + 1)
  }

  if (!activeProduct) {
    return (
      <div className="rounded-3xl border border-[var(--border-card)] bg-[var(--surface-primary)] p-8 sm:p-10 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto mb-4 flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
          <PackageSearch size={22} />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">
          No product found
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Is category me abhi koi valid product available nahi hai.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4 sm:space-y-6">
        {/* Header Card */}
        <div className="overflow-hidden rounded-[24px] sm:rounded-[28px]shadow-[var(--shadow-card)]">

          <div className="flex items-center gap-1 p-4 sm:p-6 lg:flex-row lg:items-start lg:justify-between bg-[var(--bg-card)]">

            {/* Left Section */}
            <div className="flex items-start gap-1 sm:gap-4 w-full">
              <div className="flex h-5 w-5 sm:h-14 sm:w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--btn-primary)]/10 text-[var(--btn-primary)]">
                <LayoutGrid size={22} />
              </div>

              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--text-primary)] truncate">
                  {group.label}
                </h2>

                {/* Stats */}
                <div className="mt-2 flex flex-wrap gap-1 sm:gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
                  <span className="rounded-lg border border-[var(--border-card)] px-3 py-1">
                    {group.products.length} products
                  </span>
                  <span className="rounded-lg border border-[var(--border-card)] px-3 py-1">
                    Qty {group.totalQty}
                  </span>
                  <span className="rounded-lg border border-[var(--border-card)] px-3 py-1">
                    ₹ {group.totalValue.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>

            {/* Back Button */}
            {onBack && (
              <div className="flex justify-start lg:justify-end">
                <Button onClick={onBack} title="Back" variant="black" icon={<ArrowLeft size={16} />}
                />
              </div>
            )}
          </div>
          
          {/* Product Selector */}
          <div className="border-t border-zinc-400/40 bg-[var(--bg-card)] p-4 sm:p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
              Select product
            </h3>

            <div className="flex gap-2 sm:gap-3 overflow-x-auto pb-1">
              {group.products.map((product) => {
                const isActive = product.id === activeProduct.id

                return (
                  <Button key={product.id} onClick={() => onChangeProduct(product.id ?? null)} variant={isActive ? "success" : "outline"} className="min-w-[140px] sm:min-w-[180px] !px-3 sm:!px-4 !py-2.5 sm:!py-3 text-xs sm:text-sm" title={product.name} />
                )
              })}
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <ProductStats product={activeProduct} logs={logs} setModal={setModal} />

        {/* History */}
        <div className="rounded-[24px] sm:rounded-[28px] border border-[var(--border-card)] bg-[var(--bg-card)] p-4 sm:p-5 shadow-[var(--shadow-card)]">
          <div className="mb-4">
            <h3 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
              Stock history
            </h3>
            <p className="mt-1 text-xs sm:text-sm text-[var(--text-secondary)]">Activity of <b>{activeProduct.name}</b>.</p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-card)] bg-[var(--surface-secondary)] px-4 py-6 sm:py-8 text-center text-sm text-[var(--text-secondary)]">History is loading...</div>
          ) : (
            <StockHistoryTabs logs={logs} products={group.products} />
          )}
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 backdrop-blur-sm"
          onClick={handleModalClose}
        >
          <div
            className="w-full max-w-lg sm:max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl sm:rounded-[28px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {modal === "in" ? (
              <StockInModal
                product={activeProduct}
                onClose={handleModalClose}
              />
            ) : (
              <StockOutModal
                product={activeProduct}
                onClose={handleModalClose}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}
