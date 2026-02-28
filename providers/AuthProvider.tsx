import React, { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { auth } from "@/config/firebase";

type AuthContextType = {
    user: User | null;
    loading: boolean;
    hasViewedOnboarding: boolean;
    completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    hasViewedOnboarding: false,
    completeOnboarding: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [hasViewedOnboarding, setHasViewedOnboarding] = useState(false);

    useEffect(() => {
        let unsubscribed = false;

        const checkInitialState = async () => {
            let onboardingResolved = false;
            try {
                const viewed = await AsyncStorage.getItem("hasViewedOnboarding");
                if (viewed === "true") {
                    setHasViewedOnboarding(true);
                }
            } catch (e) {
                console.error("Failed to fetch onboarding status", e);
            } finally {
                onboardingResolved = true;
                if (!unsubscribed) {
                    // Listen to Firebase Auth
                    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
                        setUser(firebaseUser);
                        setLoading(false); // Only finish loading once both storage & auth complete
                    });

                    return unsubscribeAuth;
                }
            }
        };

        const unsubscribePromise = checkInitialState();

        return () => {
            unsubscribed = true;
            unsubscribePromise.then((unsubscribe) => unsubscribe && unsubscribe());
        };
    }, [auth]);

    const completeOnboarding = async () => {
        try {
            await AsyncStorage.setItem("hasViewedOnboarding", "true");
            setHasViewedOnboarding(true);
        } catch (e) {
            console.error("Failed to save onboarding status", e);
        }
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, hasViewedOnboarding, completeOnboarding }}
        >
            {children}
        </AuthContext.Provider>
    );
};
