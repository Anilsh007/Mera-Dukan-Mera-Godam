// AllStockPage.tsx
"use client"

import { useState } from "react"
import ProductGrid from "./ProductGrid"
import ProductDetails from "./ProductDetails"
import { Product } from "@/app/lib/db"
import useProducts from "./useProducts" // ✅ import hook here

export default function AllStockPage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  
  const { products } = useProducts() // ✅ get products here

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">All Stock</h1>

      {!selectedProduct ? (
        // ✅ Pass products prop directly
        <ProductGrid onSelect={setSelectedProduct} products={products} loading={false} />
      ) : (
        <ProductDetails
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
        />
      )}
    </div>
  )
}