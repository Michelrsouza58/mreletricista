// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyC6A1dwK2AQCkH38eVlu1untRkcpe6zsuQ",
  authDomain: "mreletricista.firebaseapp.com",
  databaseURL: "https://mreletricista-default-rtdb.firebaseio.com", // Link do seu Realtime Database
  projectId: "mreletricista",
  storageBucket: "mreletricista.firebasestorage.app",
  messagingSenderId: "956706155534",
  appId: "1:956706155534:web:1bfe654e35ffdc3faee05f"
};

// Inicializa o aplicativo Firebase
const app = initializeApp(firebaseConfig);

// Exporta a conexão do Realtime Database
export const db = getDatabase(app);