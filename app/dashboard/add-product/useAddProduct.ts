"use client"

import { useState } from "react"
import { addProduct } from "@/app/dashboard/add-product/product.service"
import { auth } from "@/app/components/client/useClient"
import { syncToDrive } from "@/app/lib/drive.service"
import { toast } from "sonner"

export default function useAddProduct() {
  const [loading, setLoading] = useState(false)

  const createProduct = async (data: {
    name: string
    price: string
    quantity: string
    category?: string
    supplier?: string
    expiry?: string
    note?: string
    sku?: string
  }) => {

    try {
      setLoading(true)
      const userId = auth.currentUser?.email

      if (!userId) {
        toast.error("User not logged in")
        return
      }

      await addProduct({
        name: data.name,
        price: Number(data.price),
        quantity: Number(data.quantity),
        category: data.category,
        supplier: data.supplier,
        expiry: data.expiry,
        note: data.note,
        sku: data.sku,
        userId: userId
      })

      const token = localStorage.getItem("google_drive_token")
      if (token) {
        await syncToDrive(token)
      }

      toast.success("Product added successfully")

    } catch (err) {
      toast.error(`Error: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return { createProduct, loading }
}