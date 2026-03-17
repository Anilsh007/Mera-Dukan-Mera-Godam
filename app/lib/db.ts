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
  userId: string
  createdAt: string
}

class StockDB extends Dexie {

  products!: Table<Product>

  constructor() {
    super("StockDatabase")

    this.version(1).stores({
      products: "++id,userId,name,price,quantity,category,createdAt"
    })
  }

}

export const db = new StockDB()