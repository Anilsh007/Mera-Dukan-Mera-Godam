// ProductGrid.tsx
"use client"
import ProductCard from "./ProductCard"
import { Product } from "@/app/lib/db"
import { useRouter } from "next/navigation"
import Button from "@/app/components/utility/Button"

export default function ProductGrid({
    onSelect,
    products,
    loading
}: {
    onSelect: (p: Product) => void
    products: Product[]
    loading: boolean
}) {

    const router = useRouter()

    if (loading) {
        return (
            <div className="flex justify-center py-20 text-gray-500 text-sm">
                Loading products...
            </div>
        )
    }

    if (!loading && products.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-neutral-800 flex items-center justify-center mb-4 text-xl">
                    📦
                </div>
                <h3 className="text-lg font-semibold">No Products Yet</h3>
                <p className="text-sm text-gray-500 mt-1 max-w-xs">
                    You haven't added any products yet. Start by adding your first item to manage stock.
                </p>
                <Button
                    variant="primary"
                    onClick={() => router.push("/dashboard/add-product")}
                    title="Add Product"
                    className="mt-4"
                />
            </div>
        )
    }

    return (
        <div className="grid md:grid-cols-3 gap-4">
            {products.map(p => (
                <ProductCard key={p.id} product={p} onClick={() => onSelect(p)} />
            ))}
        </div>
    )
}