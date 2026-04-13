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
  productId?: number
}

export default function ProductDetails({
  group,
  activeProductId,
  onChangeProduct,
  onBack,
}: {
  group: CategoryGroup
  activeProductId: number | null
  onChangeProduct: (productId: number | null) => void
  onBack?: () => void
}) {
  const [logs, setLogs] = useState<Log[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState<"in" | "out" | null>(null)

  const activeProduct = useMemo(() => {
    return group.products.find((p) => p.id === activeProductId) ?? group.products[0]
  }, [group.products, activeProductId])

  useEffect(() => {
    if (!activeProduct?.id) return

    setLoading(true)
    getProductLogs(activeProduct.id).then((data) => {
      setLogs(data.map((log: any) => ({ ...log, id: String(log.id) })))
      setLoading(false)
    })
  }, [activeProduct?.id])

  if (!activeProduct) {
    return (
      <div className="rounded-3xl border border-[var(--border-card)] bg-[var(--surface-primary)] p-10 text-center shadow-[var(--shadow-card)]">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--surface-secondary)] text-[var(--text-secondary)]">
          <PackageSearch size={24} />
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">No product found</h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Is category me abhi koi valid product available nahi hai.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-[var(--border-card)] bg-gradient-to-br from-[var(--surface-primary)] via-[var(--surface-primary)] to-[var(--surface-secondary)] shadow-[var(--shadow-card)]">
          <div className="flex flex-col p-5 sm:p-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex items-start w-full">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[var(--btn-primary)]/10 text-[var(--btn-primary)]">
                <LayoutGrid size={26} />
              </div>
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
                  {group.label}
                </h2>
                <div className="flex flex-row mt-1 text-sm text-[var(--text-secondary)]">
                  <p className="border border-[var(--border-card)] px-4 py-1 rounded-lg mr-4">{group.products.length} products</p>
                  <p className="border border-[var(--border-card)] px-4 py-1 rounded-lg mr-4">Total Qty {group.totalQty}</p>
                  <p className="border border-[var(--border-card)] px-4 py-1 rounded-lg">Total Value ₹  {group.totalValue.toLocaleString("en-IN")}</p>
                </div>
              </div>
            </div>

            {onBack && (
              <div className="flex justify-start lg:justify-end">
                <Button onClick={onBack} title="back" variant="black" icon={<ArrowLeft size={16} />}></Button>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--border-card)] bg-[var(--surface-secondary)]/40 p-4 sm:p-5">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold text-[var(--text-primary)]">Select product</h3>
            </div>

            <div className="flex gap-3">
              {group.products.map((product) => {
                const isActive = product.id === activeProduct.id
                const isLowStock = product.quantity <= 10

                return (
                  <Button key={product.id} onClick={() => onChangeProduct(product.id ?? null)} variant={isActive ? "success" : "outline"} className={`min-w-[180px] !px-4 !py-3 ${isActive}`} title={product.name} />
                )
              })}
            </div>
          </div>
        </div>

        <ProductStats product={activeProduct} logs={logs} setModal={setModal} />

        <div className="rounded-[28px] border border-[var(--border-card)] bg-[var(--surface-primary)] p-5 shadow-[var(--shadow-card)] sm:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Stock history</h3>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {activeProduct.name} ke recent stock movements aur updates.
              </p>
            </div>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-dashed border-[var(--border-card)] bg-[var(--surface-secondary)] px-4 py-8 text-center text-sm text-[var(--text-secondary)]">
              History load ho rahi hai...
            </div>
          ) : (
            <StockHistoryTabs logs={logs} products={group.products} />
          )}
        </div>
      </div>

      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
          onClick={() => setModal(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[28px] bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {modal === "in" ? (
              <StockInModal product={activeProduct} onClose={() => setModal(null)} />
            ) : (
              <StockOutModal product={activeProduct} onClose={() => setModal(null)} />
            )}
          </div>
        </div>
      )}
    </>
  )
}