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
  quantityAdded: number
  price: number
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
  }

}


export const db = new StockDB()