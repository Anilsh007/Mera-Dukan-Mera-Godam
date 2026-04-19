// lib/auth.service.ts
import { auth, provider } from "./firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

const TOKEN_KEY = "drive_token";
const TOKEN_EXP_KEY = "drive_token_exp";

export async function getGoogleDriveAccessToken(manual = false): Promise<string | null> {
  // Silent/background mode: never open popup
  if (!manual) {
    const token = localStorage.getItem(TOKEN_KEY);
    const exp = Number(localStorage.getItem(TOKEN_EXP_KEY) || 0);

    if (!token || Date.now() > exp) {
      localStorage.setItem("drive_connected", "false");
      return null;
    }

    return token;
  }

  // Manual mode only: popup login
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) throw new Error("No access token");

    const expiresAt = Date.now() + 3600 * 1000;
    localStorage.setItem(TOKEN_KEY, credential.accessToken);
    localStorage.setItem(TOKEN_EXP_KEY, expiresAt.toString());
    localStorage.setItem("drive_connected", "true");

    return credential.accessToken;
  } catch (err) {
    console.error("❌ Firebase popup error:", err);
    localStorage.setItem("drive_connected", "false");
    return null;
  }
}