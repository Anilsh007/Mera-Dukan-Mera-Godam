"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { autoSyncToDrive } from "@/app/lib/autoSync.service";
import { getGoogleDriveAccessToken } from "@/app/lib/auth.service";
import { syncFromDrive } from "@/app/lib/driveDownload.service";
import DriveReconnectModal from "@/app/components/reuseModule/DriveReconnectModal";

export default function DriveSyncManager() {
  const [showReconnectModal, setShowReconnectModal] = useState(false);
  const initialSyncDone = useRef(false); // double-run guard (React StrictMode)

  // ─── App open hone par: Drive → Local, phir Local → Drive ───
  useEffect(() => {
    if (initialSyncDone.current) return;
    initialSyncDone.current = true;

    async function init() {
      try {
        const isConnected = localStorage.getItem("drive_connected");
        if (!isConnected || !navigator.onLine) return;

        const token = await getGoogleDriveAccessToken(false);
        if (!token) return;

        // Step 1: Drive se latest data lo (products + logs)
        await syncFromDrive(token);

        // Step 2: Local data wapas Drive par push karo
        // (agar Drive data local se zyada purana tha toh update ho jayega)
        await autoSyncToDrive();

      } catch (err) {
        console.error("❌ Initial sync failed:", err);
      }
    }

    init();

    // Internet aane par turant sync
    const handleOnline = () => autoSyncToDrive();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  // ─── Background sync har 5 minute mein ───
  useEffect(() => {
    const interval = setInterval(() => autoSyncToDrive(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // ─── Drive connection check har 5 second mein ───
  useEffect(() => {
    const interval = setInterval(() => {
      const isConnected = localStorage.getItem("drive_connected");
      if (!isConnected || !navigator.onLine) {
        setShowReconnectModal(true);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // ─── Reconnect handler ───
  const handleReconnect = async () => {
    try {
      const token = await getGoogleDriveAccessToken(true);
      if (!token) throw new Error("Token nahi mila");

      localStorage.setItem("drive_connected", "true");
      setShowReconnectModal(false);
      toast.success("Drive reconnected ✅");

      // Reconnect ke baad bhi full sync: Drive → Local → Drive
      await syncFromDrive(token);
      await autoSyncToDrive();

    } catch {
      toast.error("Drive connection failed ❌");
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
