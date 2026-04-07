// lib/driveDownload.service.ts
import { db } from "@/app/lib/db";

const FILE_NAME = "mera_dukan_mera_godam.json";

// ─────────────────────────────────────────────
// Drive se raw data fetch karo
// ─────────────────────────────────────────────
export async function loadFromDrive(accessToken: string) {
  const query = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);

  const searchRes = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!searchRes.ok) {
    console.error("❌ Drive search failed:", await searchRes.text());
    return null;
  }

  const { files } = await searchRes.json();
  if (!files?.length) return null;

  const fileId = files[0].id;

  const fileRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!fileRes.ok) {
    console.error("❌ Drive file fetch failed:", await fileRes.text());
    return null;
  }

  return await fileRes.json();
}

// ─────────────────────────────────────────────
// Drive → Dexie restore
// Old format (plain array) bhi handle hota hai — backward compatible
// ─────────────────────────────────────────────
export async function syncFromDrive(accessToken: string) {
  try {
    const data = await loadFromDrive(accessToken);

    if (!data) {
      console.log("⚠️ Drive par koi backup nahi mila");
      return;
    }

    // ─── FORMAT DETECT ───
    // Version 2 (new): { version, products, logs }
    // Version 1 (old): plain array of products (logs nahi the)
    const isNewFormat = data.version === 2 && Array.isArray(data.products);
    const isOldFormat = Array.isArray(data);

    if (!isNewFormat && !isOldFormat) {
      console.error("❌ Drive backup format unknown, restore cancelled");
      return;
    }

    const products = isNewFormat ? data.products : data;
    const logs     = isNewFormat ? (data.logs ?? []) : []; // old format mein logs nahi the

    if (!products.length && !logs.length) {
      console.log("⚠️ Drive backup empty hai");
      return;
    }

    // ─── ATOMIC RESTORE — dono tables ek transaction mein update ───
    await db.transaction("rw", db.products, db.productLogs, async () => {
      // Products restore
      await db.products.clear();
      if (products.length) {
        await db.products.bulkPut(products);
      }

      // Logs restore
      await db.productLogs.clear();
      if (logs.length) {
        await db.productLogs.bulkPut(logs);
      }
    });

    console.log(
      `✅ Drive → Dexie restore complete — ` +
      `${products.length} products, ${logs.length} logs` +
      (isOldFormat ? " (old format — logs nahi the)" : "")
    );

  } catch (err) {
    console.error("❌ Drive restore failed:", err);
    throw err;
  }
}
