"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { autoSyncToDrive } from "@/app/lib/autoSync.service";
import { getGoogleDriveAccessToken } from "@/app/lib/auth.service";
import DriveReconnectModal from "@/app/components/reuseModule/DriveReconnectModal";

// 🔥 NEW IMPORT
import { syncFromDrive } from "@/app/lib/driveDownload.service";

export default function DriveSyncManager() {
  const [showReconnectModal, setShowReconnectModal] = useState(false);

  // ✅ Initial + online sync (UPDATED)
  useEffect(() => {
    async function init() {
      const token = await getGoogleDriveAccessToken(false);

      if (token) {
        await syncFromDrive(token); // 🔥 NEW: Drive → Dexie
        await autoSyncToDrive();    // existing: Dexie → Drive
      }
    }

    init();

    const handleOnline = () => autoSyncToDrive();
    window.addEventListener("online", handleOnline);

    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // Background sync every 5 min
  useEffect(() => {
    const interval = setInterval(() => autoSyncToDrive(), 300000);
    return () => clearInterval(interval);
  }, []);

  // Check token every 5 sec
  useEffect(() => {
    const interval = setInterval(() => {
      const isConnected = localStorage.getItem("drive_connected");
      if (!isConnected || !navigator.onLine) {
        setShowReconnectModal(true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleReconnect = async () => {
    try {
      const token = await getGoogleDriveAccessToken(true);
      if (!token) throw new Error("Connection failed");

      localStorage.setItem("drive_connected", "true");
      setShowReconnectModal(false);
      toast.success("Drive reconnected ✅");

      // 🔥 ALSO SYNC AFTER RECONNECT
      await syncFromDrive(token);
      await autoSyncToDrive();

    } catch {
      toast.error("Connection failed ❌");
    }
  };

  return (
    <DriveReconnectModal
      isOpen={showReconnectModal}
      onClose={() => setShowReconnectModal(false)}
      onConnect={handleReconnect}
    />
  );
}