import { db } from "@/app/components/client/useClient"
import { Product } from "@/app/lib/db"
import { autoSyncToSupabase } from "@/app/lib/autoSupabaseSync.service"
import { v4 as uuidv4 } from "uuid";

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
      supplier: data.supplier || existing.supplier,
      sku: data.sku || existing.sku,
      note: data.note || existing.note,
    })

    await db.productLogs.add({
      id: uuidv4(),
      productId: existing.id!,
      quantityAdded: Number(data.quantity),
      type: "in",
      price: Number(data.price),
      expiry: data.expiry || undefined,
      date: new Date().toISOString(),
      note: data.note || undefined,
    });

    await autoSyncToSupabase()
    return "updated"
  }

  // naya product
  const newId = uuidv4();

  await db.products.add({
    id: newId,
    name: normalizedName,
    price: Number(data.price),
    quantity: Number(data.quantity),
    category: normalizedCategory || undefined,
    supplier: data.supplier || undefined,
    expiry: data.expiry || undefined,
    sku: data.sku || undefined,
    note: data.note || undefined,
    userId: data.userId,
    createdAt: new Date().toISOString(),
  });

  await db.productLogs.add({
    id: uuidv4(), // 🔥 NEW
    productId: newId,
    quantityAdded: Number(data.quantity),
    type: "in",
    price: Number(data.price),
    expiry: data.expiry || undefined,
    date: new Date().toISOString(),
    note: data.note || undefined,
  });

  await autoSyncToSupabase()
  return "created"
}

// ➖ Stock Out
export async function stockOut(data: {
  productId: string
  quantity: number
  salePrice: number   // ✅ kis price par becha
  expiry?: string     // ✅ kaunsi batch out ki
  reason?: string
  note?: string
}) {
  const product = await db.products.get(data.productId)
  if (!product) throw new Error("Product not found")
  const normalizedReason = data.reason || "Sold"
  const normalizedSalePrice = Number(data.salePrice || 0)

  if (data.quantity > product.quantity) {
    throw new Error(`Only ${product.quantity} available, cannot stock out ${data.quantity}`)
  }

  await db.products.update(data.productId, {
    quantity: product.quantity - data.quantity,
  })

  await db.productLogs.add({
    id: uuidv4(), // 🔥 NEW
    productId: data.productId,
    quantityAdded: -Number(data.quantity),
    type: "out",
    reason: normalizedReason,
    price: normalizedSalePrice,   // sale price log mein
    expiry: data.expiry,     // batch expiry log mein
    date: new Date().toISOString(),
    note: data.note,
  });

  await autoSyncToSupabase()
  return "stocked-out"
}

// 📦 Sab products
export async function getProducts(userId: string): Promise<Product[]> {
  return await db.products.where("userId").equals(userId).toArray()
}

// 📊 Product history
export async function getProductLogs(productId: string) {
  return await db.productLogs
    .where("productId")
    .equals(productId)
    .reverse()
    .toArray()
}
