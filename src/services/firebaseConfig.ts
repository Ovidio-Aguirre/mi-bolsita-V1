// src/services/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu configuración personal de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDUZUNjB1CItv4H4Il58H9tjmmAXRihqKs",
  authDomain: "mi-bolsita-v2.firebaseapp.com",
  projectId: "mi-bolsita-v2",
  storageBucket: "mi-bolsita-v2.firebasestorage.app",
  messagingSenderId: "619005768750",
  appId: "1:619005768750:web:3df8f552f90a775d2b9bbf"
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios que usaremos en la aplicación
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
