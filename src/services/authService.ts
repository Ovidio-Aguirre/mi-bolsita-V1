// src/services/authService.ts
// CÓDIGO ACTUALIZADO Y COMPLETO

import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { auth } from "./firebaseConfig";

const provider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    console.log("Usuario conectado:", user.displayName);
    return user;
  } catch (error) {
    console.error("Error durante el inicio de sesión con Google:", error);
    return null;
  }
};

// --- NUEVA FUNCIÓN ---
export const signOutUser = async () => {
  try {
    await signOut(auth);
    console.log("Usuario ha cerrado sesión.");
  } catch (error) {
    console.error("Error al cerrar sesión:", error);
  }
};