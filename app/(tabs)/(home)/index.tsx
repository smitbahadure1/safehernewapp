import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform, Linking, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, Shield, User } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/colors';
import { useSafety } from '@/providers/SafetyProvider';
import SOSButton from '@/components/SOSButton';
import QuickActionCard from '@/components/QuickActionCard';

export default function HomeScreen() {
    const router = useRouter();
    const { contacts, sosState } = useSafety();

    const statusMessage = () => {
        switch (sosState.status) {
            case 'countdown':
                return 'SOS activating...';
            case 'active':
                return 'Emergency alerts sent!';
            case 'resolved':
                return 'You are safe now';
            default:
                return contacts.length > 0
                    ? `${contacts.length} contact${contacts.length > 1 ? 's' : ''} ready`
                    : 'Add emergency contacts';
        }
    };

    const statusColor = () => {
        switch (sosState.status) {
            case 'countdown':
                return Colors.warning;
            case 'active':
                return Colors.danger;
            case 'resolved':
                return Colors.safeGreen;
            default:
                return contacts.length > 0 ? Colors.safeGreen : Colors.textMuted;
        }
    };

    return (
        <View style={styles.root}>
            <LinearGradient
                colors={['#0F0F1A', '#0A0A0F', '#0A0A0F']}
                style={StyleSheet.absoluteFillObject}
            />
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <View style={styles.header}>
                        <View>
                            <Text style={styles.greeting}>SafeHer</Text>
                            <View style={styles.statusRow}>
                                <View style={[styles.statusDot, { backgroundColor: statusColor() }]} />
                                <Text style={[styles.statusText, { color: statusColor() }]}>
                                    {statusMessage()}
                                </Text>
                            </View>
                        </View>
                        <TouchableOpacity style={styles.shieldBadge} onPress={() => router.push('/(home)/profile' as any)}>
                            <User size={20} color={Colors.primary} />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.sosSection}>
                        <SOSButton />
                        <Text style={styles.sosHint}>
                            {sosState.status === 'idle' ? 'Tap to trigger emergency alert' : ''}
                        </Text>
                    </View>

                    <View style={styles.quickActionsSection}>
                        <Text style={styles.sectionTitle}>Quick Actions</Text>
                        <View style={styles.quickActionsRow}>
                            <QuickActionCard
                                icon={<Ionicons name="location" size={24} color={Colors.accent} />}
                                title="Live Track"
                                subtitle="Share location"
                                color={Colors.accent}
                                onPress={() => router.push('/(home)/location' as any)}
                                testID="location-action"
                            />
                            <QuickActionCard
                                icon={<Ionicons name="mic" size={24} color={Colors.timerOrange} />}
                                title="Record"
                                subtitle="Audio evidence"
                                color={Colors.timerOrange}
                                onPress={() => router.push('/(home)/audio-recording' as any)}
                                testID="record-action"
                            />
                        </View>
                        <View style={[styles.quickActionsRow, { marginTop: 12 }]}>
                            <QuickActionCard
                                icon={<Ionicons name="call" size={24} color={Colors.danger} />}
                                title="112"
                                subtitle="Emergency call"
                                color={Colors.danger}
                                onPress={() => {
                                    Linking.openURL('tel:112');
                                }}
                                testID="emergency-call-action"
                            />
                            <QuickActionCard
                                icon={<Ionicons name="book" size={24} color={Colors.safeGreen} />}
                                title="Helplines"
                                subtitle="Local numbers"
                                color={Colors.safeGreen}
                                onPress={() => router.push('/(home)/directory' as any)}
                                testID="directory-action"
                            />
                        </View>
                    </View>

                    {contacts.length === 0 && (
                        <View style={styles.warningCard}>
                            <AlertTriangle size={20} color={Colors.warning} />
                            <View style={styles.warningTextContainer}>
                                <Text style={styles.warningTitle}>Set up emergency contacts</Text>
                                <Text style={styles.warningSubtext}>
                                    Add at least one trusted contact to receive your SOS alerts
                                </Text>
                            </View>
                        </View>
                    )}

                    <View style={styles.tipCard}>
                        <Text style={styles.tipLabel}>SAFETY TIP</Text>
                        <Text style={styles.tipText}>
                            Share your live location with a trusted contact before traveling alone at night.
                        </Text>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    safeArea: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingBottom: 30,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        paddingBottom: 8,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '800' as const,
        color: Colors.text,
        letterSpacing: -0.5,
    },
    statusRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusText: {
        fontSize: 13,
        fontWeight: '600' as const,
    },
    shieldBadge: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sosSection: {
        alignItems: 'center',
        paddingVertical: 16,
    },
    sosHint: {
        color: Colors.textMuted,
        fontSize: 12,
        fontWeight: '500' as const,
        marginTop: 0,
    },
    quickActionsSection: {
        marginTop: 8,
    },
    sectionTitle: {
        fontSize: 17,
        fontWeight: '700' as const,
        color: Colors.text,
        marginBottom: 14,
    },
    quickActionsRow: {
        flexDirection: 'row',
        gap: 12,
    },
    warningCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(251, 191, 36, 0.08)',
        borderRadius: 14,
        padding: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: 'rgba(251, 191, 36, 0.2)',
        gap: 12,
    },
    warningTextContainer: {
        flex: 1,
    },
    warningTitle: {
        color: Colors.warning,
        fontSize: 14,
        fontWeight: '700' as const,
    },
    warningSubtext: {
        color: Colors.textSecondary,
        fontSize: 12,
        marginTop: 2,
    },
    tipCard: {
        backgroundColor: Colors.surface,
        borderRadius: 14,
        padding: 16,
        marginTop: 20,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    tipLabel: {
        color: Colors.primary,
        fontSize: 10,
        fontWeight: '800' as const,
        letterSpacing: 1.5,
        marginBottom: 6,
    },
    tipText: {
        color: Colors.textSecondary,
        fontSize: 13,
        lineHeight: 19,
        fontWeight: '500' as const,
    },
});
