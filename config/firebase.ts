import { initializeApp, getApp, getApps } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
// @ts-expect-error - Typed incorrectly in some Firebase versions but works at runtime as directed by Firebase.
import { initializeAuth, getAuth, getReactNativePersistence, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

// New Firebase project configuration (replaced per request)
const firebaseConfig = {
    apiKey: "AIzaSyAwuvJmJhGx9NkcGCNTlDFnwDR6JVDqJG0",
    authDomain: "safeher-23a18.firebaseapp.com",
    projectId: "safeher-23a18",
    storageBucket: "safeher-23a18.firebasestorage.app",
    messagingSenderId: "768436219552",
    appId: "1:768436219552:web:5a0b4bd3f0d517cb7ca3c5",
    measurementId: "G-1D3ZDVBCE4"
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistense (handling hot reloads)
let auth: Auth;
try {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
} catch (e) {
    auth = getAuth(app);
}

// Initialize Firestore
const db = getFirestore(app);

// Analytics is only available in environments that support it (like web).
// We'll wrap it in a mock or conditional check for React Native.
let analytics;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
}).catch(console.error);

export { app, auth, db, analytics };
