import { supabase } from "./supabase";
import { db } from "./db";
import { auth } from "./firebase";

export async function syncDexieToSupabase() {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  // 1. Local data fetch
  const [products, logs] = await Promise.all([
    db.products.toArray(),
    db.productLogs.toArray(),
  ]);

  if (!products.length && !logs.length) {
    console.log("⚠️ No local data to sync");
    return;
  }

  // 2. Products upload
  const { error: productError } = await supabase
    .from("products")
    .upsert(
      products.map((p) => ({
        id: p.id, // important for upsert
        user_id: user.uid,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
        category: p.category,
        supplier: p.supplier,
        note: p.note,
        expiry: p.expiry,
        sku: p.sku,
        created_at: p.createdAt,
      }))
    );

  if (productError) {
    console.error("❌ Product sync error:", productError);
    throw productError;
  }

  // 3. Logs upload
  const { error: logError } = await supabase
    .from("product_logs")
    .upsert(
      logs.map((l) => ({
        id: l.id,
        product_id: l.productId,
        quantity_added: l.quantityAdded,
        type: l.type,
        reason: l.reason,
        price: l.price,
        expiry: l.expiry,
        date: l.date,
        note: l.note,
      }))
    );

  if (logError) {
    console.error("❌ Log sync error:", logError);
    throw logError;
  }

  console.log(`✅ Synced ${products.length} products & ${logs.length} logs to Supabase`);
}