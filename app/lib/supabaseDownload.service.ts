import { supabase } from "./supabase";
import { db } from "./db";
import { auth } from "./firebase";

export async function syncSupabaseToDexie() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  // 1. Supabase se data lao
  const { data: products, error: pError } = await supabase
    .from("products")
    .select("*")
    .eq("user_id", user.uid);

  if (pError) {
    console.error("❌ Fetch products error:", pError);
    throw pError;
  }

  const { data: logs, error: lError } = await supabase
    .from("product_logs").select("*")
    .select("*");

  if (lError) {
    console.error("❌ Fetch logs error:", lError);
    throw lError;
  }

  // 2. Empty check
  if (!products?.length && !logs?.length) {
    console.log("⚠️ No cloud data found");
    return;
  }

  // 3. Dexie restore (atomic)
  await db.transaction("rw", db.products, db.productLogs, async () => {
    await db.products.clear();
    await db.productLogs.clear();

    if (products?.length) {
      await db.products.bulkPut(
        products.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          quantity: Number(p.quantity),
          category: p.category,
          supplier: p.supplier,
          note: p.note,
          expiry: p.expiry,
          sku: p.sku,
          userId: p.user_id,
          createdAt: p.created_at,
        }))
      );
    }

    if (logs?.length) {
      await db.productLogs.bulkPut(
        logs.map((l: any) => ({
          id: l.id,
          productId: l.product_id,
          quantityAdded: Number(l.quantity_added),
          type: l.type,
          reason: l.reason,
          price: Number(l.price),
          expiry: l.expiry,
          date: l.date,
          note: l.note,
        }))
      );
    }
  });

  console.log(`✅ Supabase → Dexie sync complete`);
}