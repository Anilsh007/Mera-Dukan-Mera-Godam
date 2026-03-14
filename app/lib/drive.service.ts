import { db } from "@/app/lib/db";

const FILE_NAME = "stock_data_backup.json";

export async function syncToDrive(accessToken: string) {

  if (!accessToken) {
    console.error("❌ No Google Drive access token provided");
    return;
  }

  try {

    const allProducts = await db.products.toArray();
    const fileContent = JSON.stringify(allProducts);

    // 🔎 Check if file already exists
    const searchResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=name='${FILE_NAME}' and trashed=false&fields=files(id,name)`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!searchResponse.ok) {
      const error = await searchResponse.text();
      console.error("Drive search error:", error);
      return;
    }

    const searchData = await searchResponse.json();
    const files = searchData.files;

    // ✏️ UPDATE EXISTING FILE
    if (files && files.length > 0) {

      const fileId = files[0].id;

      const updateResponse = await fetch(
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

      if (!updateResponse.ok) {
        const error = await updateResponse.text();
        console.error("Drive update error:", error);
        return;
      }

      console.log("✅ Drive backup updated");
    }

    // 📁 CREATE NEW FILE
    else {

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

      const createResponse = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: formData,
        }
      );

      if (!createResponse.ok) {
        const error = await createResponse.text();
        console.error("Drive create error:", error);
        return;
      }

      console.log("✅ New Drive backup created");
    }

  } catch (error) {
    console.error("❌ Drive sync error:", error);
  }
}