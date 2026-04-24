import { getGoogleDriveAccessToken } from "./auth.service";
import { saveProfileToDrive, type ProfileData } from "./profile.service";

export async function autoSyncProfileToDrive(
  profileData: Omit<ProfileData, "userId" | "updatedAt">
): Promise<boolean> {
  try {
    const token = await getGoogleDriveAccessToken(false);
    if (!token) return false;

    await saveProfileToDrive(profileData, token);
    return true;
  } catch (err) {
    console.error("Auto profile sync failed:", err);
    return false;
  }
}
