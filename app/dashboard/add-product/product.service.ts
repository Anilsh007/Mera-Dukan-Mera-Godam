import { db } from "@/app/components/client/useClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export const addProduct = async (product: any) => {
    // Conversion logic yahan rakhna best hai taaki components clean rahein
    const productData = {
        ...product,
        price: Number(product.price) || 0,
        quantity: Number(product.quantity) || 0,
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, "products"), productData);
    return docRef.id;
};
