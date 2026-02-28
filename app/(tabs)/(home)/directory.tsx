import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/colors';

const helplines = [
    { title: "National Emergency", number: "112", icon: "warning", color: Colors.danger },
    { title: "Police", number: "100", icon: "shield", color: Colors.primary },
    { title: "Women Helpline", number: "1091", icon: "woman", color: Colors.accent },
    { title: "Ambulance", number: "102", icon: "medical", color: Colors.safeGreen },
    { title: "Domestic Abuse", number: "181", icon: "home", color: Colors.timerOrange },
];

export default function DirectoryScreen() {
    const router = useRouter();

    const handleCall = (number: string) => {
        Linking.openURL(`tel:${number}`);
    };

    return (
        <View style={styles.root}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>1-Tap Helplines</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.list}>
                    {helplines.map((item, index) => (
                        <TouchableOpacity
                            key={index}
                            style={styles.card}
                            onPress={() => handleCall(item.number)}
                        >
                            <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
                                <Ionicons name={item.icon as any} size={28} color={item.color} />
                            </View>
                            <View style={styles.textContainer}>
                                <Text style={styles.title}>{item.title}</Text>
                                <Text style={styles.subtitle}>{item.number}</Text>
                            </View>
                            <View style={styles.callCircle}>
                                <Ionicons name="call" size={20} color={Colors.white} />
                            </View>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
        paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16,
        borderBottomWidth: 1, borderBottomColor: Colors.surfaceBorder,
        backgroundColor: Colors.surface,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceLight,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
    list: { padding: 20, gap: 16 },
    card: {
        backgroundColor: Colors.surface, borderRadius: 20, padding: 16,
        flexDirection: 'row', alignItems: 'center', gap: 16,
    },
    iconContainer: {
        width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    },
    textContainer: { flex: 1 },
    title: { color: Colors.text, fontSize: 16, fontWeight: '800', marginBottom: 4 },
    subtitle: { color: Colors.textMuted, fontSize: 15, fontWeight: '600' },
    callCircle: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.safeGreen,
        alignItems: 'center', justifyContent: 'center',
    },
});
