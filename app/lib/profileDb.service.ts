import { auth } from "./firebase";
import { db } from "./db";
import type { ProfileData } from "./profile.service";

export async function loadProfileFromDb(userId?: string): Promise<ProfileData | null> {
  const resolvedUserId = userId || auth.currentUser?.uid;
  if (!resolvedUserId) return null;

  return (await db.profiles.get(resolvedUserId)) || null;
}

export async function saveProfileToDb(
  profileData: Omit<ProfileData, "userId" | "updatedAt">,
  userId?: string
): Promise<ProfileData> {
  const resolvedUserId = userId || auth.currentUser?.uid;
  if (!resolvedUserId) throw new Error("User not authenticated");

  const fullData: ProfileData = {
    ...profileData,
    userId: resolvedUserId,
    updatedAt: new Date().toISOString(),
  };

  await db.profiles.put(fullData);
  return fullData;
}
