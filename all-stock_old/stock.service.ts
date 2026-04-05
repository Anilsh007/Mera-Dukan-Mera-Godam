import { db } from "@/app/components/client/useClient"
import { Product } from "@/app/lib/db"

/** Add a new product */
export async function addProduct(data: {
  name: string
  price: number
  quantity: number
  category?: string
  supplier?: string
  expiry?: string
  userId: string
  note?: string
}) {
  await db.products.add({
    ...data,
    createdAt: new Date().toISOString()
  })
}

/** Get all products for a user */
export async function getProducts(userId: string): Promise<Product[]> {
  return await db.products
    .where("userId")
    .equals(userId)
    .toArray()
}

/** Update an existing product by ID */
export async function updateProduct(
  id: string | number,
  data: Partial<Product>
) {
  // Dexie update returns number of rows updated
  const updated = await db.products.update(id, data)
  if (!updated) {
    throw new Error(`Product with id ${id} not found`)
  }
  return updated
}