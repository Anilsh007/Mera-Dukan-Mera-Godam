"use client";

import { useEffect, useRef } from "react";
import { autoSyncToSupabase } from "./autoSupabaseSync.service";
import { syncSupabaseToDexie } from "./supabaseDownload.service";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";
import { syncDexieToSupabase } from "./supabaseSync.service";

export default function SupabaseSyncManager() {
    const initialSyncDone = useRef(false);

    // App open → cloud → local
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (!user) return; // 🔥 wait until login

            try {
                await syncSupabaseToDexie();
                await syncDexieToSupabase();

            } catch (err) {
                console.error("❌ Initial Supabase sync failed:", err);
            }
        });

        return () => unsubscribe();
    }, []);
    // background sync
    useEffect(() => {
        const interval = setInterval(() => {
            autoSyncToSupabase();
        }, 5 * 60 * 1000);

        return () => clearInterval(interval);
    }, []);

    return null;
}