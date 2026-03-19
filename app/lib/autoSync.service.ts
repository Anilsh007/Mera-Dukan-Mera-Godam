import { getGoogleDriveAccessToken } from "./auth.service";
import { syncToDrive } from "./drive.service";

let isSyncing = false;

export async function autoSyncToDrive() {
  // ✅ Prevent multiple parallel syncs
  if (isSyncing) return;

  try {
    isSyncing = true;

    const isConnected = localStorage.getItem("drive_connected");

    if (!isConnected) return;

    console.log("🔄 Auto syncing...");

    const token = await getGoogleDriveAccessToken();

    await syncToDrive(token);

    console.log("✅ Auto sync success");

  } catch (error) {
    console.error("❌ Auto sync failed:", error);
  } finally {
    isSyncing = false;
  }
}