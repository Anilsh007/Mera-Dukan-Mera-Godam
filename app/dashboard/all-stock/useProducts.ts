import { useEffect, useState } from "react";
import { liveQuery } from "dexie";
import { db, Product } from "@/app/lib/db";
import { auth } from "@/app/lib/firebase";

export default function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        setProducts([]);
        setLoading(false);
        return;
      }

      // ✅ liveQuery — Dexie ka sahi tarika hai changes sunne ka
      // hooks ki zaroorat nahi, aur Promise return karne wala bug bhi nahi
      const subscription = liveQuery(() =>
        db.products.where("userId").equals(user.uid).toArray()
      ).subscribe({
        next: (data) => {
          setProducts(data);
          setLoading(false);
        },
        error: (err) => {
          console.error("Products fetch error:", err);
          setLoading(false);
        },
      });

      return () => subscription.unsubscribe();
    });

    return () => unsubscribe();
  }, []);

  return { products, loading };
}
