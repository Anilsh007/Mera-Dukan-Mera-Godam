import Dexie, { Table } from "dexie";

export interface Product {
  id?: number
  name: string
  price: number
  quantity: number
  category?: string
  supplier?: string
  note?: string
  expiry?: string
  sku?: string
  userId: string
  createdAt: string
}

export interface ProductLog {
  id?: number
  productId: number
  quantityAdded: number  // positive = in, negative = out
  type: "in" | "out"
  reason?: string
  price: number
  expiry?: string        // ✅ NEW — us batch ki expiry
  date: string
  note?: string
}

class StockDB extends Dexie {

  products!: Table<Product>
  productLogs!: Table<ProductLog>

  constructor() {
    super("StockDatabase")

    this.version(3).stores({
      products: "++id,[userId+name+category],userId,name,price,quantity,category,sku,createdAt",
      productLogs: "++id,productId,date"
    })

    this.version(4).stores({
      products: "++id,[userId+name+category],userId,name,price,quantity,category,sku,createdAt",
      productLogs: "++id,productId,date,type"
    }).upgrade(tx => {
      return tx.table("productLogs").toCollection().modify(log => {
        if (!log.type) log.type = "in"
      })
    })

    // version 5 — expiry field add kiya ProductLog mein
    this.version(5).stores({
      products: "++id,[userId+name+category],userId,name,price,quantity,category,sku,createdAt",
      productLogs: "++id,productId,date,type"
    })
    // no upgrade needed — expiry optional hai, purane logs mein undefined rahega
  }

}

export const db = new StockDB()
