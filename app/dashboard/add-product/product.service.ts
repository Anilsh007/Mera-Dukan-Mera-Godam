import { db } from "@/app/components/client/useClient"
import { Product } from "@/app/lib/db"
import { scheduleSync } from "@/app/lib/syncManager"

export async function addProduct(data: {
  name: string
  price: number
  quantity: number
  category?: string
  supplier?: string
  expiry?: string
  note?: string
  sku?: string
  userId: string
}) {
  const normalizedName = data.name.trim().toLowerCase()

  // 🔍 check existing product
  const existing = await db.products
    .where("[userId+name+sku]")
    .equals([data.userId, normalizedName, data.sku || ""])
    .first()

  // 🔁 अगर product already hai → update stock
  if (existing) {
    await db.products.update(existing.id!, {
      quantity: existing.quantity + data.quantity,
      price: data.price,
    })

    // 📝 log entry add
    await db.productLogs.add({
      productId: existing.id!,
      quantityAdded: data.quantity,
      price: data.price,
      date: new Date().toISOString(),
      note: data.note
    })

    scheduleSync()
    return "updated"
  }

  // ➕ नया product
  const id = await db.products.add({
    ...data,
    name: normalizedName,
    createdAt: new Date().toISOString()
  })

  // 📝 first log entry
  await db.productLogs.add({
    productId: id,
    quantityAdded: data.quantity,
    price: data.price,
    date: new Date().toISOString(),
    note: data.note
  })

  scheduleSync()
  return "created"
}

// 📦 get all products
export async function getProducts(userId: string): Promise<Product[]> {
  return await db.products
    .where("userId")
    .equals(userId)
    .toArray()
}

// 📊 product history (NEW)
export async function getProductLogs(productId: number) {
  return await db.productLogs
    .where("productId")
    .equals(productId)
    .reverse()
    .toArray()
}