"use client"

import { useEffect, useState } from "react"
import { db } from "@/app/lib/db"
import { auth } from "@/app/lib/firebase"
import { onAuthStateChanged } from "firebase/auth"
import { useRouter } from "next/navigation"

function StatCard({ label, value, sub, icon, color, loading, onClick }) {
  return (
    <div onClick={onClick} className={`p-5 rounded-2xl flex items-center gap-4 bg-[var(--bg-card)] border border-[var(--border-card)] shadow-[var(--shadow-card)] transition-all duration-200 ${onClick ? "cursor-pointer hover:-translate-y-1 hover:shadow-lg" : ""}`} >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-2xl" style={{ background: color + "18" }}>{icon}</div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">{label}</p>
        {loading
          ? <div className="skeleton h-7 w-24 mt-1" />
          : <p className="text-2xl font-bold mt-0.5 text-[var(--text-primary)] truncate">{value}</p>
        }
        {sub && !loading && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{sub}</p>
        )}
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const router = useRouter()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [userName, setUserName] = useState("")

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (u) setUserName(u.displayName?.split(" ")[0] || "")
    })
    return () => unsub()
  }, [])

  useEffect(() => {
    async function load() {
      try {
        const [products, logs] = await Promise.all([
          db.products.toArray(),
          db.productLogs.toArray(),
        ])

        const totalProducts = products.length
        const lowStock = products.filter(p => p.quantity > 0 && p.quantity <= 10).length
        const outOfStock = products.filter(p => p.quantity === 0).length
        const totalStockValue = products.reduce((s, p) => s + p.price * p.quantity, 0)

        const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0)
        const todayOut = logs.filter(l => l.type === "out" && new Date(l.date) >= todayStart)
        const salesToday = todayOut.reduce((s, l) => s + Math.abs(l.quantityAdded) * l.price, 0)
        const unitsSold = todayOut.reduce((s, l) => s + Math.abs(l.quantityAdded), 0)

        // Near-expiry (within 30 days)
        const soon = new Date(); soon.setDate(soon.getDate() + 30)
        const nearExpiry = products.filter(p => p.expiry && new Date(p.expiry) <= soon && new Date(p.expiry) >= new Date()).length

        setStats({ totalProducts, lowStock, outOfStock, totalStockValue, salesToday, unitsSold, nearExpiry })
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const cards = [
    { label: "Total Products", value: stats ? stats.totalProducts : "—", icon: "📦", color: "#3b82f6", sub: stats?.outOfStock > 0 ? `${stats.outOfStock} out of stock` : "Sab in-stock", onClick: () => router.push("/dashboard/all-stock"), },
    { label: "Low Stock", value: stats ? stats.lowStock : "—", icon: "⚠️", color: "#f59e0b", sub: stats?.lowStock > 0 ? "Restocking zaroori" : "Stock theek hai", onClick: () => router.push("/dashboard/all-stock"), },
    { label: "Aaj ki Bikri", value: stats ? `₹${stats.salesToday.toLocaleString("en-IN")}` : "—", icon: "💰", color: "#10b981", sub: stats ? `${stats.unitsSold} units biche` : "",  onClick: () => router.push("/dashboard/all-stock"), },
    { label: "Stock Value", value: stats ? `₹${stats.totalStockValue.toLocaleString("en-IN")}` : "—", icon: "🏦", color: "#8b5cf6", sub: "Current inventory value", onClick: () => router.push("/dashboard/all-stock"), },
  ]

  return (
    <div className="space-y-6">

      {/* Greeting */}
      <div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          {userName ? `Namaste, ${userName} 👋` : "Overview"}
        </h2>
        <p className="text-sm mt-1 text-[var(--text-secondary)]">The current state of my shop today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {cards.map(c => <StatCard key={c.label} {...c} loading={loading} />)}
      </div>

      {/* Near Expiry Alert */}
      {!loading && stats?.nearExpiry > 0 && (
        <div onClick={() => router.push("/dashboard/all-stock")} className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 border border-amber-200 dark:bg-amber-900/20 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/30 transition" >
          <span className="text-2xl">⏰</span>
          <div>
            <p className="font-semibold text-amber-700 dark:text-amber-400">
              {stats.nearExpiry} product{stats.nearExpiry > 1 ? "s" : ""} agle 30 din mein expire ho raha hai
            </p>
            <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">All Stock mein check karo →</p>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button onClick={() => router.push("/dashboard/add-product")} className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-400/30 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 transition-all duration-200 group text-left">
            <p className="text-2xl mb-2">➕</p>
            <p className="font-semibold text-emerald-700 dark:text-emerald-400 group-hover:text-white">Naya Stock Add Karo</p>
            <p className="text-xs text-emerald-600 dark:text-emerald-500 group-hover:text-emerald-100 mt-1">Products add karo ya restock karo</p>
          </button>
          <button onClick={() => router.push("/dashboard/all-stock")} className="p-5 rounded-2xl bg-blue-500/10 border border-blue-400/30 hover:bg-blue-500 hover:text-white hover:border-blue-500 transition-all duration-200 group text-left">
            <p className="text-2xl mb-2">📋</p>
            <p className="font-semibold text-blue-700 dark:text-blue-400 group-hover:text-white">Saara Stock Dekho</p>
            <p className="text-xs text-blue-600 dark:text-blue-500 group-hover:text-blue-100 mt-1">Inventory manage karo, stock in/out karo</p>
          </button>
        </div>
      </div>

    </div>
  )
}
