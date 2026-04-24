let syncTimeout: ReturnType<typeof setTimeout>;

export function scheduleSync() {
  if (syncTimeout) clearTimeout(syncTimeout);

  syncTimeout = setTimeout(async () => {
    try {
      const { autoSyncToSupabase } = await import("./autoSupabaseSync.service");
      await autoSyncToSupabase();
    } catch (err) {
      console.error("❌ Scheduled sync failed:", err);
    }
  }, 5000);
}