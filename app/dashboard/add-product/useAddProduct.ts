import { db, Product } from "@/app/lib/db";
import { auth } from "@/app/lib/firebase";

export default function useAddProduct() {

  const createProduct = async (product: Omit<Product, "id" | "createdAt">) => {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("User not logged in");

    // check if product with same name + category already exists
    const normalizedName = product.name.trim().toLowerCase();
    const normalizedCategory = (product.category || "").trim().toLowerCase();

    const existing = await db.products
      .where("[userId+name+category]")
      .equals([userId, normalizedName, normalizedCategory])
      .first();

    if (existing) {
      // update existing product quantity & price (avg or latest price)
      const updatedQuantity = existing.quantity + Number(product.quantity);
      const updatedPrice = Number(product.price); // latest price
      await db.products.update(existing.id!, { quantity: updatedQuantity, price: updatedPrice });
    } else {
      // create new product
      await db.products.add({
        ...product,
        userId,
        createdAt: new Date().toISOString(),
      });
    }
  };

  return { createProduct };
}