import { db, Product } from "@/app/lib/db";
import { auth } from "@/app/lib/firebase";
import { scheduleSync } from "@/app/lib/syncManager";

export default function useAddProduct() {

  const createProduct = async (product: Omit<Product, "id" | "createdAt">) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in");

    const normalizedName = product.name.trim().toLowerCase();
    const normalizedCategory = (product.category || "").trim().toLowerCase();

    const existing = await db.products
      .where("[userId+name+category]")
      .equals([userId, normalizedName, normalizedCategory])
      .first();

    if (existing) {
      await db.products.update(existing.id!, {
        quantity: existing.quantity + Number(product.quantity),
        price: Number(product.price),
      });

      await db.productLogs.add({
        productId: existing.id!,
        quantityAdded: Number(product.quantity),
        type: "in",
        price: Number(product.price),
        date: new Date().toISOString(),
        note: product.note || undefined,
      });

    } else {
      // ✅ FIX: ...spread nahi, explicit fields —
      // agar koi bhi extra value (JSX, Promise) product object mein thi,
      // ab wo IndexedDB mein nahi jayegi → DataCloneError khatam
      const newId = await db.products.add({
        name: normalizedName,
        price: Number(product.price),
        quantity: Number(product.quantity),
        category: normalizedCategory || undefined,
        supplier: product.supplier || undefined,
        expiry: product.expiry || undefined,
        sku: product.sku || undefined,
        note: product.note || undefined,
        userId,
        createdAt: new Date().toISOString(),
      });

      await db.productLogs.add({
        productId: newId as number,
        quantityAdded: Number(product.quantity),
        type: "in",
        price: Number(product.price),
        date: new Date().toISOString(),
        note: product.note || undefined,
      });
    }

    scheduleSync();
  };

  return { createProduct };
}