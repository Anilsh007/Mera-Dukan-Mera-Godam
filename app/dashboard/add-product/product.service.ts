import { db } from "@/app/components/client/useClient"
import { Product } from "@/app/lib/db"
import { scheduleSync } from "@/app/lib/syncManager"

// ➕ Stock In
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
  const normalizedCategory = (data.category || "").trim().toLowerCase()

  const existing = await db.products
    .where("[userId+name+category]")
    .equals([data.userId, normalizedName, normalizedCategory])
    .first()

  if (existing) {
    // ✅ quantity + price + expiry teen update hote hain
    // latest batch ki price aur expiry card pe dikhegi
    await db.products.update(existing.id!, {
      quantity: existing.quantity + data.quantity,
      price: data.price,
      expiry: data.expiry,
    })

    await db.productLogs.add({
      productId: existing.id!,
      quantityAdded: data.quantity,
      type: "in",
      price: data.price,
      expiry: data.expiry,     // ✅ us batch ki expiry log mein save
      date: new Date().toISOString(),
      note: data.note,
    })

    scheduleSync()
    return "updated"
  }

  // naya product
  const id = await db.products.add({
    name: normalizedName,
    price: data.price,
    quantity: data.quantity,
    category: normalizedCategory || undefined,
    supplier: data.supplier || undefined,
    expiry: data.expiry || undefined,
    sku: data.sku || undefined,
    note: data.note || undefined,
    userId: data.userId,
    createdAt: new Date().toISOString(),
  })

  await db.productLogs.add({
    productId: id as number,
    quantityAdded: data.quantity,
    type: "in",
    price: data.price,
    expiry: data.expiry,       // ✅ pehli entry ki expiry bhi log mein
    date: new Date().toISOString(),
    note: data.note,
  })

  scheduleSync()
  return "created"
}

// ➖ Stock Out
export async function stockOut(data: {
  productId: number
  quantity: number
  salePrice: number   // ✅ kis price par becha
  expiry?: string     // ✅ kaunsi batch out ki
  reason?: string
  note?: string
}) {
  const product = await db.products.get(data.productId)
  if (!product) throw new Error("Product nahi mila")

  if (data.quantity > product.quantity) {
    throw new Error(`Sirf ${product.quantity} available hai`)
  }

  await db.products.update(data.productId, {
    quantity: product.quantity - data.quantity,
  })

  await db.productLogs.add({
    productId: data.productId,
    quantityAdded: -data.quantity,
    type: "out",
    reason: data.reason,
    price: data.salePrice,   // sale price log mein
    expiry: data.expiry,     // batch expiry log mein
    date: new Date().toISOString(),
    note: data.note,
  })

  scheduleSync()
  return "stocked-out"
}

// 📦 Sab products
export async function getProducts(userId: string): Promise<Product[]> {
  return await db.products.where("userId").equals(userId).toArray()
}

// 📊 Product history
export async function getProductLogs(productId: number) {
  return await db.productLogs
    .where("productId")
    .equals(productId)
    .reverse()
    .toArray()
}
