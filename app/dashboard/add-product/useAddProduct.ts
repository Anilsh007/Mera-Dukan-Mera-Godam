import { useState } from "react";
import { addProduct } from "./product.service";

export default function useAddProduct() {
  const [loading, setLoading] = useState(false);

  const createProduct = async (product: any, onSuccess?: () => void) => {
    setLoading(true);
    try {
      await addProduct(product);
      alert("✅ Product Added Successfully!");
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      alert("❌ Error adding product");
    } finally {
      setLoading(false);
    }
  };

  return { createProduct, loading };
}
