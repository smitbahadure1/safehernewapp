import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
import { auth, db } from "@/config/firebase";
import { Shield } from "lucide-react-native";

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const router = useRouter();

    const saveUserToFirestore = async (user: any) => {
        try {
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                lastSeen: new Date().toISOString(),
                createdAt: user.metadata.creationTime,
            }, { merge: true });
        } catch (error) {
            console.error("Error saving user to Firestore", error);
        }
    };

    const handleAuth = async () => {
        if (!email || !password) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        setLoading(true);
        try {
            if (isLogin) {
                const userCredential = await signInWithEmailAndPassword(auth, email, password);
                await saveUserToFirestore(userCredential.user);
                router.replace('/(tabs)' as any);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                await saveUserToFirestore(userCredential.user);
                router.replace('/(tabs)' as any);
            }
        } catch (error: any) {
            Alert.alert("Authentication Error", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <View style={styles.header}>
                <View style={styles.iconContainer}>
                    <Shield size={60} color={Colors.primary} />
                </View>
                <Text style={styles.title}>SafeHer</Text>
                <Text style={styles.subtitle}>
                    {isLogin ? "Welcome back to your safe space" : "Join our secure community"}
                </Text>
            </View>

            <View style={styles.formContainer}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Email address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={Colors.text + "50"}
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Password</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your password"
                        placeholderTextColor={Colors.text + "50"}
                        value={password}
                        onChangeText={setPassword}
                        secureTextEntry
                    />
                </View>

                <TouchableOpacity
                    style={styles.mainButton}
                    onPress={handleAuth}
                    disabled={loading}
                >
                    <Text style={styles.mainButtonText}>
                        {loading ? "Please wait..." : (isLogin ? "Sign In" : "Create Account")}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.switchButton}
                    onPress={() => setIsLogin(!isLogin)}
                >
                    <Text style={styles.switchText}>
                        {isLogin
                            ? "Don't have an account? Sign up"
                            : "Already have an account? Sign in"}
                    </Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: "center",
    },
    header: {
        alignItems: "center",
        marginBottom: 50,
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary + "15",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 20,
    },
    title: {
        fontSize: 40,
        fontWeight: "800",
        color: Colors.text,
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: Colors.text + "80",
    },
    formContainer: {
        paddingHorizontal: 30,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: "600",
        color: Colors.text,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: Colors.surface,
        borderRadius: 15,
        padding: 18,
        fontSize: 16,
        color: Colors.text,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    mainButton: {
        backgroundColor: Colors.primary,
        borderRadius: 15,
        padding: 20,
        alignItems: "center",
        marginTop: 10,
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    mainButtonText: {
        color: "white",
        fontSize: 18,
        fontWeight: "700",
    },
    switchButton: {
        marginTop: 25,
        alignItems: "center",
    },
    switchText: {
        color: Colors.primary,
        fontSize: 15,
        fontWeight: "600",
    },
});
