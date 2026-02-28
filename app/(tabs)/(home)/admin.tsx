import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, Dimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { Colors } from '@/constants/colors';
import { db } from '@/config/firebase';
import { ChevronLeft, Users, Mail, Clock, ShieldAlert } from 'lucide-react-native';
import { useAuth } from '@/providers/AuthProvider';

const { width } = Dimensions.get('window');

type UserData = {
    id: string;
    email: string;
    createdAt?: string;
    lastSeen?: string;
};

export default function AdminScreen() {
    const router = useRouter();
    const { user } = useAuth();
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    const isAdmin = user?.email === "shradhasavartkar03@gmail.com";

    useEffect(() => {
        if (!isAdmin) {
            router.back();
            return;
        }

        const fetchUsers = async () => {
            try {
                // Fetch users from the 'users' collection
                const usersRef = collection(db, "users");
                const q = query(usersRef, orderBy("lastSeen", "desc"));
                const querySnapshot = await getDocs(q);

                const loadedUsers: UserData[] = [];
                querySnapshot.forEach((doc) => {
                    loadedUsers.push({
                        id: doc.id,
                        ...doc.data()
                    } as UserData);
                });
                setUsers(loadedUsers);
            } catch (error) {
                console.error("Error fetching users: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [isAdmin]);

    if (!isAdmin) return null;

    const formatDate = (isoString?: string) => {
        if (!isoString) return 'Never';
        try {
            const date = new Date(isoString);
            return date.toLocaleString(undefined, {
                month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            });
        } catch {
            return 'Unknown';
        }
    };

    const renderItem = ({ item }: { item: UserData }) => (
        <View style={styles.userCard}>
            <View style={styles.cardHeader}>
                <View style={[styles.avatarIcon, { backgroundColor: item.email === "shradhasavartkar03@gmail.com" ? Colors.accent + '20' : Colors.primary + '20' }]}>
                    {item.email === "shradhasavartkar03@gmail.com" ? (
                        <ShieldAlert size={20} color={Colors.accent} />
                    ) : (
                        <Users size={20} color={Colors.primary} />
                    )}
                </View>
                <Text style={styles.emailText} numberOfLines={1}>{item.email}</Text>

                {item.email === "shradhasavartkar03@gmail.com" && (
                    <View style={styles.adminBadge}>
                        <Text style={styles.adminBadgeText}>ADMIN</Text>
                    </View>
                )}
            </View>

            <View style={styles.cardDetails}>
                <View style={styles.detailRow}>
                    <Clock size={14} color={Colors.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.detailLabel}>Last active:</Text>
                    <Text style={styles.detailValue}>{formatDate(item.lastSeen)}</Text>
                </View>
                <View style={styles.detailRow}>
                    <Mail size={14} color={Colors.textSecondary} style={{ marginRight: 6 }} />
                    <Text style={styles.detailLabel}>Joined:</Text>
                    <Text style={styles.detailValue}>{formatDate(item.createdAt)}</Text>
                </View>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <ChevronLeft color={Colors.text} size={28} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <ShieldAlert size={20} color={Colors.accent} style={{ marginRight: 8 }} />
                    <Text style={styles.headerTitle}>Admin Dashboard</Text>
                </View>
                <View style={{ width: 28 }} />
            </View>

            <View style={styles.content}>
                <View style={styles.statContainer}>
                    <View style={styles.statBox}>
                        <Text style={styles.statNumber}>{users.length}</Text>
                        <Text style={styles.statLabel}>Total Users</Text>
                    </View>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={Colors.accent} style={{ marginTop: 50 }} />
                ) : (
                    <FlatList
                        data={users}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={() => (
                            <View style={styles.emptyContainer}>
                                <Text style={styles.emptyText}>No users found in database.</Text>
                            </View>
                        )}
                    />
                )}
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
        backgroundColor: Colors.background,
    },
    backButton: {
        padding: 4,
        marginLeft: -8,
    },
    headerTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.text,
    },
    content: {
        flex: 1,
    },
    statContainer: {
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
    },
    statBox: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.accent + '30',
    },
    statNumber: {
        fontSize: 36,
        fontWeight: '800',
        color: Colors.accent,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 14,
        color: Colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    listContent: {
        padding: 20,
        paddingBottom: 40,
    },
    userCard: {
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 18,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 16,
    },
    avatarIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    emailText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: Colors.text,
    },
    adminBadge: {
        backgroundColor: Colors.accent + '20',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginLeft: 8,
    },
    adminBadgeText: {
        color: Colors.accent,
        fontSize: 10,
        fontWeight: '800',
        letterSpacing: 0.5,
    },
    cardDetails: {
        backgroundColor: Colors.background,
        borderRadius: 10,
        padding: 12,
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 13,
        color: Colors.textSecondary,
        width: 80,
    },
    detailValue: {
        fontSize: 13,
        color: Colors.text,
        fontWeight: '500',
        flex: 1,
    },
    emptyContainer: {
        alignItems: 'center',
        marginTop: 40,
    },
    emptyText: {
        color: Colors.textSecondary,
        fontSize: 15,
    },
});
