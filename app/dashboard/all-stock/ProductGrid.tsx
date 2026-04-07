"use client"

import { useState, useMemo } from "react"
import ProductCard from "./ProductCard"
import { Product } from "@/app/lib/db"
import { useRouter } from "next/navigation"
import Button from "@/app/components/utility/Button"
import { Search, SlidersHorizontal, X } from "lucide-react"

export default function ProductGrid({
  onSelect,
  products,
  loading,
}: {
  onSelect: (p: Product) => void
  products: Product[]
  loading: boolean
}) {
  const router = useRouter()
  const [search, setSearch]       = useState("")
  const [category, setCategory]   = useState("all")
  const [stockFilter, setStockFilter] = useState("all") // all | low | out

  // Unique categories from products
  const categories = useMemo(() => {
    const cats = [...new Set(products.map(p => p.category).filter(Boolean))] as string[]
    return cats.sort()
  }, [products])

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchSearch   = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku || "").toLowerCase().includes(search.toLowerCase())
      const matchCategory = category === "all" || p.category === category
      const matchStock    = stockFilter === "all" ? true
                          : stockFilter === "out" ? p.quantity === 0
                          : p.quantity > 0 && p.quantity <= 10
      return matchSearch && matchCategory && matchStock
    })
  }, [products, search, category, stockFilter])

  const hasFilters = search || category !== "all" || stockFilter !== "all"

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map(n => (
          <div key={n} className="rounded-2xl border border-[var(--border-card)] bg-[var(--bg-card)] p-5 space-y-3">
            <div className="skeleton h-5 w-3/4" />
            <div className="skeleton h-4 w-1/3" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-9 w-full" />
          </div>
        ))}
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="h-16 w-16 rounded-full bg-[var(--bg-card)] border border-[var(--border-card)] flex items-center justify-center mb-4 text-2xl shadow">
          📦
        </div>
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Koi product nahi hai</h3>
        <p className="text-sm text-[var(--text-muted)] mt-1 max-w-xs">
          Abhi tak koi product add nahi kiya. Pehla item add karo stock manage karne ke liye.
        </p>
        <Button
          variant="primary"
          onClick={() => router.push("/dashboard/add-product")}
          title="Product Add Karo"
          className="mt-5"
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">

      {/* Search + Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">

        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
          <input
            type="text"
            placeholder="Product name ya SKU search karo..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-9 py-2 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:ring-2 focus:ring-emerald-400 outline-none transition-all text-sm"
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)]">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Category filter */}
        {categories.length > 0 && (
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            className="py-2 px-3 rounded-xl border border-[var(--border-input)] bg-[var(--bg-input)] text-[var(--text-primary)] text-sm outline-none focus:ring-2 focus:ring-emerald-400 transition-all"
          >
            <option value="all">Sab Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}

        {/* Stock filter */}
        <div className="flex gap-2">
          {[
            { key: "all", label: "Sab" },
            { key: "low", label: "⚠ Low" },
            { key: "out", label: "✕ Out" },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setStockFilter(f.key)}
              className={`px-3 py-2 rounded-xl text-sm font-medium border transition-all whitespace-nowrap ${
                stockFilter === f.key
                  ? "bg-emerald-500 text-white border-emerald-500 shadow"
                  : "border-[var(--border-input)] text-[var(--text-secondary)] bg-[var(--bg-input)] hover:border-emerald-400"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Results count + clear */}
      <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
        <span>
          {filtered.length} / {products.length} products
          {hasFilters ? " (filtered)" : ""}
        </span>
        {hasFilters && (
          <button
            onClick={() => { setSearch(""); setCategory("all"); setStockFilter("all") }}
            className="flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <X size={12} /> Filter hatao
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[var(--text-muted)]">
          <p className="text-3xl mb-3">🔍</p>
          <p className="font-medium text-[var(--text-primary)]">Koi product nahi mila</p>
          <p className="text-sm mt-1">Search ya filter change karo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} onClick={() => onSelect(p)} />
          ))}
        </div>
      )}

    </div>
  )
}
