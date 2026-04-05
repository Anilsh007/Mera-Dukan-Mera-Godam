"use client";

import { Product } from "@/app/lib/db";

type SuggestionsProps = {
  products: Product[];
  type: "product" | "category";
};

export default function Suggestions({ products, type }: SuggestionsProps) {
  const uniqueValues = Array.from(
    new Set(
      products
        .map(p => (type === "product" ? p.name : p.category))
        .filter(Boolean)
    )
  );

  const listId = type === "product" ? "productNames" : "categories";

  return (
    <datalist id={listId}>
      {uniqueValues.map((val, idx) => (
        <option key={idx} value={val} />
      ))}
    </datalist>
  );
}