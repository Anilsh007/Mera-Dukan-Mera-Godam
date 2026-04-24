// lib/profileSyncManager.ts
let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export function scheduleProfileSync(profileData: any) {
  if (syncTimeout) {
    clearTimeout(syncTimeout);
  }

  // syncTimeout = setTimeout(async () => {
  //   try {
  //     const { autoSyncProfileToDrive } = await import("./autoProfileSync.service");
  //     await autoSyncProfileToDrive(profileData);
  //   } catch (err) {
  //     console.error("❌ Scheduled profile sync failed:", err);
  //   }
  // }, 5000); // 5 sec debounce
}
