import { supabase } from "./supabase";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

export function testInsertProduct() {
    onAuthStateChanged(auth, async (user) => {
        if (!user) {
            console.error("❌ User still not logged in");
            return;
        }

        const { data, error } = await supabase.from("products").insert([
            {
                user_id: user.uid,
                name: "Test Product",
                price: 100,
                quantity: 5,
                category: "test",
            },
        ]);

        if (error) {
            console.error("❌ Insert error:", error);
        } else {
            console.log("✅ Insert success:", data);
        }
    });
}