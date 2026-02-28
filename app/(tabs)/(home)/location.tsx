import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as Location from 'expo-location';
import * as SMS from 'expo-sms';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { Colors } from '@/constants/colors';
import { useSafety } from '@/providers/SafetyProvider';

export default function LocationScreen() {
    const router = useRouter();
    const { contacts } = useSafety();
    const [isSharing, setIsSharing] = useState(false);
    const [location, setLocation] = useState<Location.LocationObject | null>(null);

    useEffect(() => {
        let subscriber: Location.LocationSubscription;
        (async () => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert("Permission Denied", "Location permissions are required to share your live location.");
                return;
            }

            let loc = await Location.getCurrentPositionAsync({});
            setLocation(loc);

            subscriber = await Location.watchPositionAsync(
                { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
                (newLoc) => {
                    setLocation(newLoc);
                }
            );
        })();
        return () => {
            if (subscriber) {
                subscriber.remove();
            }
        };
    }, []);

    const toggleSharing = async () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        if (!isSharing) {
            if (!location) {
                Alert.alert("Locating...", "Still acquiring your GPS signal. Please try again in a few seconds.");
                return;
            }
            if (contacts.length === 0) {
                Alert.alert("No Contacts", "Please add emergency contacts in the Contacts tab before sharing your location.");
                router.push('/contacts');
                return;
            }

            const isAvailable = await SMS.isAvailableAsync();
            if (isAvailable) {
                const phoneNumbers = contacts.map(c => c.phone);
                const message = `I'm sending you my live location for my safety. My coordinates are: https://maps.google.com/?q=${location.coords.latitude},${location.coords.longitude}`;

                const { result } = await SMS.sendSMSAsync(phoneNumbers, message);
                if (result === 'sent' || result === 'unknown') {
                    setIsSharing(true);
                }
            } else {
                Alert.alert("SMS Unavailable", "SMS service is not available on this device.");
            }
        } else {
            setIsSharing(false);
        }
    };

    return (
        <View style={styles.root}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Live Location</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.mapContainer}>
                    {location ? (
                        <MapView
                            style={styles.map}
                            provider={PROVIDER_DEFAULT}
                            initialRegion={{
                                latitude: location.coords.latitude,
                                longitude: location.coords.longitude,
                                latitudeDelta: 0.01,
                                longitudeDelta: 0.01,
                            }}
                            showsUserLocation={true}
                            followsUserLocation={true}
                        >
                            <Marker
                                coordinate={{
                                    latitude: location.coords.latitude,
                                    longitude: location.coords.longitude
                                }}
                                title="Your Location"
                                description="This is what your contacts will see"
                            />
                        </MapView>
                    ) : (
                        <View style={styles.loadingMap}>
                            <Ionicons name="location-outline" size={48} color={Colors.textMuted} />
                            <Text style={styles.mapText}>Finding your location...</Text>
                        </View>
                    )}
                </View>

                <View style={styles.bottomCard}>
                    <View style={styles.infoRow}>
                        <View style={[styles.statusDot, { backgroundColor: isSharing ? Colors.safeGreen : Colors.textMuted }]} />
                        <Text style={styles.statusText}>
                            {isSharing
                                ? `Sharing with ${contacts.length} contact${contacts.length > 1 ? 's' : ''}`
                                : 'Location sharing paused'}
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: isSharing ? Colors.surfaceLight : Colors.primary }]}
                        onPress={toggleSharing}
                    >
                        <Ionicons name={isSharing ? "pause" : "paper-plane"} size={20} color={isSharing ? Colors.text : Colors.white} />
                        <Text style={[styles.btnText, { color: isSharing ? Colors.text : Colors.white }]}>
                            {isSharing ? 'Pause Sharing' : 'Start Live Tracking'}
                        </Text>
                    </TouchableOpacity>
                </View>
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
        backgroundColor: Colors.surface, zIndex: 10,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surfaceLight,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
    mapContainer: {
        flex: 1, backgroundColor: '#0a0a0f',
    },
    map: {
        width: '100%',
        height: '100%',
    },
    loadingMap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapText: { color: Colors.textMuted, marginTop: 16, fontWeight: '600', fontSize: 16 },
    bottomCard: {
        backgroundColor: Colors.surface, padding: 24, paddingBottom: 34, borderTopLeftRadius: 30,
        borderTopRightRadius: 30, shadowColor: '#000', shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.2, shadowRadius: 20, elevation: 20,
    },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, justifyContent: 'center' },
    statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
    statusText: { color: Colors.text, fontSize: 15, fontWeight: '600' },
    actionBtn: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
        paddingVertical: 18, borderRadius: 16, gap: 10,
    },
    btnText: { fontSize: 16, fontWeight: '800' },
});
