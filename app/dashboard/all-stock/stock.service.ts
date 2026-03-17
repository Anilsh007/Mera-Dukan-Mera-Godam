import { db } from "@/app/components/client/useClient"
import { Product } from "@/app/lib/db"

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

export async function getProducts(userId: string): Promise<Product[]> {

  return await db.products
    .where("userId")
    .equals(userId)
    .toArray()

}