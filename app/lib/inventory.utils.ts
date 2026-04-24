import type { Product } from "@/app/lib/db"

export const STOCK_THRESHOLDS = {
  criticalMax: 25,
  lowMax: 50,
} as const

export type StockLevel = "out" | "critical" | "low" | "healthy"
export type StockFilter = "all" | "low" | "critical" | "out"

export function getStockLevel(quantity: number): StockLevel {
  if (quantity === 0) return "out"
  if (quantity <= STOCK_THRESHOLDS.criticalMax) return "critical"
  if (quantity <= STOCK_THRESHOLDS.lowMax) return "low"
  return "healthy"
}

export function getGroupStockLevel(products: Product[]): StockLevel {
  const totalQty = products.reduce((sum, product) => sum + product.quantity, 0)
  if (totalQty === 0) return "out"
  if (products.some((product) => getStockLevel(product.quantity) === "critical")) {
    return "critical"
  }
  if (products.some((product) => getStockLevel(product.quantity) === "low")) {
    return "low"
  }
  return "healthy"
}

export function matchesGroupStockFilter(products: Product[], filter: StockFilter): boolean {
  if (filter === "all") return true
  return getGroupStockLevel(products) === filter
}

export function getGroupStockCounts(groups: Array<{ products: Product[] }>) {
  return groups.reduce(
    (acc, group) => {
      const level = getGroupStockLevel(group.products)
      acc.all += 1
      if (level === "out") acc.out += 1
      if (level === "critical") acc.critical += 1
      if (level === "low") acc.low += 1
      return acc
    },
    { all: 0, low: 0, critical: 0, out: 0 }
  )
}

export function getExpiryInfo(expiry?: string): { label: string; cls: string } | null {
  if (!expiry) return null

  const days = Math.ceil((new Date(expiry).getTime() - Date.now()) / 86400000)

  if (days < 0) {
    return {
      label: "Expired",
      cls: "bg-[var(--out-stock)] text-[var(--out-stock-text)] border border-[var(--out-stock-border)] shadow",
    }
  }

  if (days <= 7) {
    return {
      label: `${days}d left`,
      cls: "bg-[var(--expired)] text-[var(--expired-text)]",
    }
  }

  if (days <= 30) {
    return {
      label: `${days}d left`,
      cls: "bg-[var(--low-expiry)] text-[var(--low-expiry-text)]",
    }
  }

  return null
}
