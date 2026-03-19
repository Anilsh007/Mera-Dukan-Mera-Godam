// lib/backup.service.ts
import { getGoogleDriveAccessToken } from "./auth.service";
import { syncToDrive } from "./drive.service";

export async function backupToDrive() {
    try {
        const accessToken = await getGoogleDriveAccessToken();
        await syncToDrive(accessToken);
        // no major change, just safer logs
        console.log("🔄 Syncing to Google Drive...");
    } catch (error) {
        console.error("❌ Backup failed:", error);
    }
}