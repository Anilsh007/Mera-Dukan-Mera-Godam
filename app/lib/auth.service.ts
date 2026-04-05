// lib/auth.service.ts
import { auth, provider } from "./firebase";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";

// Token storage keys
const TOKEN_KEY = "drive_token";
const TOKEN_EXP_KEY = "drive_token_exp";

export async function getGoogleDriveAccessToken(manual = false): Promise<string | null> {
  const user = auth.currentUser;

  // Manual login → popup
  if (manual || !user) {
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (!credential?.accessToken) throw new Error("No access token");

      // Save token + expiry (Google tokens usually valid 1h)
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

  // Background: check stored token + expiry
  const token = localStorage.getItem(TOKEN_KEY);
  const exp = Number(localStorage.getItem(TOKEN_EXP_KEY) || 0);

  if (!token || Date.now() > exp) {
    // Token missing or expired → ask user to reconnect
    localStorage.setItem("drive_connected", "false");
    return null;
  }

  return token;
}