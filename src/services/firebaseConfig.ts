// src/services/firebaseConfig.ts

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu configuración personal de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBP--Oxg8ZGf-tpWDLspGXKB1F178SPtMI",
  authDomain: "mi-bolsita.firebaseapp.com",
  projectId: "mi-bolsita",
  storageBucket: "mi-bolsita.firebasestorage.app",
  messagingSenderId: "368435767199",
  appId: "1:368435767199:web:511de2d0ca82bd662abfaa"
};

// Inicializar la aplicación de Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios que usaremos en la aplicación
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);