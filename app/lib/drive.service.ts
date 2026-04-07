// lib/drive.service.ts
import { db } from "@/app/lib/db";

const FILE_NAME = "mera_dukan_mera_godam.json";

// ─────────────────────────────────────────────
// Drive par file dhundho — fileId return karta hai ya null
// ─────────────────────────────────────────────
async function findDriveFile(accessToken: string): Promise<string | null> {
  const query = encodeURIComponent(`name='${FILE_NAME}' and trashed=false`);

  const res = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`,
    { headers: { Authorization: `Bearer ${accessToken}` } }
  );

  if (!res.ok) {
    console.error("❌ Drive search failed:", await res.text());
    return null;
  }

  const { files } = await res.json();
  return files?.length > 0 ? files[0].id : null;
}

// ─────────────────────────────────────────────
// Main sync function — products + logs dono Drive par save karta hai
// ─────────────────────────────────────────────
export async function syncToDrive(accessToken: string) {
  if (!accessToken) {
    console.error("❌ No access token");
    return;
  }

  try {
    // ✅ Dono tables ek saath fetch karo
    const [allProducts, allLogs] = await Promise.all([
      db.products.toArray(),
      db.productLogs.toArray(),
    ]);

    // ✅ Ek structured object mein dono data rakho
    const backup = {
      version: 2,                          // format version — future changes ke liye
      exportedAt: new Date().toISOString(),
      products: allProducts,
      logs: allLogs,
    };

    const fileContent = JSON.stringify(backup);

    const fileId = await findDriveFile(accessToken);

    if (fileId) {
      // ─── EXISTING FILE UPDATE ───
      const updateRes = await fetch(
        `https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: fileContent,
        }
      );

      if (!updateRes.ok) {
        console.error("❌ Update failed:", await updateRes.text());
        return;
      }

      console.log(`✅ Drive backup updated — ${allProducts.length} products, ${allLogs.length} logs`);

    } else {
      // ─── NEW FILE CREATE ───
      const metadata = {
        name: FILE_NAME,
        mimeType: "application/json",
      };

      const formData = new FormData();
      formData.append(
        "metadata",
        new Blob([JSON.stringify(metadata)], { type: "application/json" })
      );
      formData.append(
        "file",
        new Blob([fileContent], { type: "application/json" })
      );

      const createRes = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${accessToken}` },
          body: formData,
        }
      );

      if (!createRes.ok) {
        console.error("❌ Create failed:", await createRes.text());
        return;
      }

      console.log(`✅ New Drive backup created — ${allProducts.length} products, ${allLogs.length} logs`);
    }

  } catch (error) {
    console.error("❌ Sync error:", error);
    throw error; // caller ko pata chale
  }
}
