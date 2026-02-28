import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, signOut } from 'firebase/auth';
import { Colors } from '@/constants/colors';
import { LogOut, User, ChevronLeft, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';
import { app } from '@/config/firebase';

export default function ProfileScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);

    const isAdmin = user?.email === "shradhasavartkar03@gmail.com";

    const handleLogout = async () => {
        Alert.alert(
            "Log Out",
            "Are you sure you want to log out?",
            [
                {
                    text: "Cancel",
                    style: "cancel"
                },
                {
                    text: "Log Out",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            const auth = getAuth(app);
                            await signOut(auth);
                            router.replace('/auth' as any);
                        } catch (error) {
                            console.error("Logout error", error);
                            Alert.alert("Error", "Failed to log out");
                        } finally {
                            setLoading(false);
                        }
                    }
                }
            ]
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft color={Colors.text} size={28} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Profile</Text>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatar}>
                        <User size={40} color={Colors.background} />
                    </View>
                    <Text style={styles.emailText}>{user?.email || "User"}</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>

                    {isAdmin && (
                        <TouchableOpacity
                            style={[styles.logoutButton, { marginBottom: 15, borderColor: Colors.accent }]}
                            onPress={() => router.push('/(home)/admin' as any)}
                        >
                            <ShieldAlert size={20} color={Colors.accent} />
                            <Text style={[styles.logoutText, { color: Colors.accent }]}>Admin Dashboard</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity style={styles.logoutButton} onPress={handleLogout} disabled={loading}>
                        <LogOut size={20} color={Colors.danger} />
                        <Text style={styles.logoutText}>{loading ? "Logging out..." : "Log Out"}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 30,
    },
    avatarContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: Colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 15,
    },
    emailText: {
        fontSize: 18,
        fontWeight: '600',
        color: Colors.text,
    },
    section: {
        marginTop: 20,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: Colors.textSecondary,
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    logoutButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    logoutText: {
        color: Colors.danger,
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 12,
    },
});
