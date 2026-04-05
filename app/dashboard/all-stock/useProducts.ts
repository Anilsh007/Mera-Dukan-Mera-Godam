import { useEffect, useState } from "react";
import { db, Product } from "@/app/lib/db";
import { auth } from "@/app/lib/firebase";

export default function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const fetchProducts = async () => {
        const data = await db.products.toArray(); // ✅ no user filter
        console.log("🟢 Fetched products:", data);
        setProducts(data);
        setLoading(false);
      };

      await fetchProducts();

      const onChange = () => fetchProducts();
      db.products.hook("creating", onChange);
      db.products.hook("updating", onChange);
      db.products.hook("deleting", onChange);

      return () => {
        db.products.hook("creating").unsubscribe(onChange);
        db.products.hook("updating").unsubscribe(onChange);
        db.products.hook("deleting").unsubscribe(onChange);
      };
    });

    return () => unsubscribe();
  }, []);

  return { products, loading };
}