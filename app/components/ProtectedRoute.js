"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedRoute({ children, requiredRole }) {
  const router = useRouter();

  useEffect(() => {
    const checkAccess = async () => {
      const user = auth.currentUser;

      // Si el usuario no está autenticado, redirigir al login
      if (!user) {
        router.push("/Login");
        return;
      }

      // Verificar el rol en Firestore si se requiere uno específico
      if (requiredRole) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData.role !== requiredRole) {
            // Si el rol no coincide, redirigir a la página principal
            router.push("/");
          }
        } else {
          // Si no se encuentra el usuario en Firestore, redirigir al login
          router.push("/Login");
        }
      }
    };

    checkAccess();
  }, [router, requiredRole]);

  return children;
}
