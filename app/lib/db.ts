import Dexie, { Table } from "dexie";
import type { ProfileData } from "./profile.service";

export interface Product {
  id: string
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
  id: string
  productId: string
  quantityAdded: number
  type: "in" | "out"
  reason?: string
  price: number
  expiry?: string
  date: string
  note?: string
}

export interface ProfileRecord extends ProfileData {}

class StockDB extends Dexie {

  products!: Table<Product>
  productLogs!: Table<ProductLog>
  profiles!: Table<ProfileRecord>

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

    // version 6 — expiry field add kiya ProductLog mein
    this.version(6).stores({
      products: "id,[userId+name+category],userId,name,category",
      productLogs: "id,productId,date,type"
    });
    this.version(7).stores({
      products: "id,[userId+name+category],userId,name,category",
      productLogs: "id,productId,date,type",
      profiles: "userId,updatedAt"
    });
    // no upgrade needed — expiry optional hai, purane logs mein undefined rahega
  }

}

export const db = new StockDB()
