import { auth, provider } from "./firebase";
import {
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";

export async function getGoogleDriveAccessToken(): Promise<string> {
  try {
    let user = auth.currentUser;

    // ✅ If user not logged in → popup
    if (!user) {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential?.accessToken) {
        throw new Error("No access token");
      }

      return credential.accessToken;
    }

    // ✅ If already logged in → silent re-auth
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error("No access token");
    }

    return credential.accessToken;

  } catch (error) {
    console.error("❌ Token error:", error);
    throw error;
  }
}