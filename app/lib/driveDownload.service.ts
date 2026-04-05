import { db } from "@/app/lib/db";

const FILE_NAME = "mera_dukan_mera_godam.json";

export async function loadFromDrive(accessToken: string) {
  const query = encodeURIComponent(
    `name='${FILE_NAME}' and trashed=false`
  );

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  const { files } = await res.json();

  if (!files?.length) return [];

  const fileId = files[0].id;

  const fileRes = await fetch(
    `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  );

  return await fileRes.json();
}

export async function syncFromDrive(accessToken: string) {
  try {
    const data = await loadFromDrive(accessToken);

    if (!data?.length) {
      console.log("⚠️ No data in Drive");
      return;
    }

    // 🔥 IMPORTANT: overwrite local DB
    await db.products.clear();
    await db.products.bulkPut(data);

    console.log("✅ Drive → Dexie sync complete");
  } catch (err) {
    console.error("❌ Drive sync failed:", err);
  }
}