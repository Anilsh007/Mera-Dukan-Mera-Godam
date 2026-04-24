import { auth } from "./firebase";

const PROFILE_FILE_NAME = "shop-profile-data.json";

export interface ProfileData {
  userId: string;
  updatedAt: string;
  personal: {
    displayName: string;
    email: string;
    photoURL: string;
    phone: string;
    alternateEmail: string;
  };
  business: {
    shopName: string;
    gstNumber: string;
    businessType: string;
    upiId: string;
    invoicePrefix: string;
  };
  address: {
    address: string;
    district: string;
    state: string;
    pincode: string;
  };
  banking: {
    accountHolderName: string;
    accountNumber: string;
    ifscCode: string;
    bankName: string;
  };
  settings: {
    termsAndConditions: string;
  };
}

// Search existing file in Drive (same pattern as drive.service.ts)
async function findProfileFile(accessToken: string): Promise<string | null> {
  const query = encodeURIComponent(`name='${PROFILE_FILE_NAME}' and trashed=false`);

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

// SAVE Profile to Drive (same pattern as drive.service.ts)
export async function saveProfileToDrive(
  profileData: Omit<ProfileData, "userId" | "updatedAt">,
  accessToken: string
): Promise<void> {
  const user = auth.currentUser;
  if (!user) throw new Error("User not authenticated");

  const fullData: ProfileData = {
    ...profileData,
    userId: user.uid,
    updatedAt: new Date().toISOString(),
  };

  const fileContent = JSON.stringify(fullData);
  const fileId = await findProfileFile(accessToken);

  if (fileId) {
    // Update existing
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
      console.error("❌ Profile update failed:", await updateRes.text());
      throw new Error("Update failed");
    }
    console.log("✅ Profile updated on Drive");

  } else {
    // Create new
    const metadata = {
      name: PROFILE_FILE_NAME,
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
      console.error("❌ Profile create failed:", await createRes.text());
      throw new Error("Create failed");
    }
    console.log("✅ New profile created on Drive");
  }
}

// LOAD Profile from Drive (same pattern as driveDownload.service.ts)
export async function loadProfileFromDrive(accessToken: string): Promise<ProfileData | null> {
  const query = encodeURIComponent(`name='${PROFILE_FILE_NAME}' and trashed=false`);

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
    console.error("❌ Profile fetch failed:", await fileRes.text());
    return null;
  }

  return await fileRes.json();
}
