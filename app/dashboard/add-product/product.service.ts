import { db } from "@/app/components/client/useClient"

export async function addProduct(
  data: {
    name: string
    price: number
    quantity: number
    category?: string
  },
  userId: string
) {

  await db.products.add({
    ...data,
    userId,
    createdAt: new Date().toISOString()
  })

}