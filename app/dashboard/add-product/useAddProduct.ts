"use client"

import { useState } from "react"
import { addProduct } from "@/app/dashboard/add-product/product.service"
import { auth } from "@/app/components/client/useClient"
import { syncToDrive } from "@/app/lib/drive.service"
import { toast } from "sonner"

export default function useAddProduct() {
  const [loading, setLoading] = useState(false)

  const createProduct = async (
    data: {
      name: string
      price: string
      quantity: string
      category?: string
    },
    resetForm: () => void
  ) => {

    try {
      setLoading(true)
      const userId = auth.currentUser?.email

      if (!userId) {
        toast.success("User not logged in");
        return
      }

      // 2. Pehle Local Database (Dexie) mein save karein
      await addProduct({
        name: data.name,
        price: Number(data.price),
        quantity: Number(data.quantity),
        category: data.category
      }, userId)

      // 3. Drive Sync Logic
      const token = localStorage.getItem("google_drive_token")
      if (token) {
        await syncToDrive(token) // Local save ke baad Drive par sync
        console.log("Drive synced!")
      }
      toast.success("Data submitted successfully");
      resetForm()

    } catch (err) {
      toast.error(`Error adding product or syncing: ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setLoading(false)
    }
  }

  return { createProduct, loading }
}