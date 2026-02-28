import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Vibration,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Phone, PhoneOff, User, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import { Colors } from '@/constants/colors';

type CallState = 'setup' | 'ringing' | 'active' | 'ended';

export default function FakeCallScreen() {
    const router = useRouter();
    const [callState, setCallState] = useState<CallState>('setup');
    const [delay, setDelay] = useState(5);
    const [elapsed, setElapsed] = useState(0);
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    // Cleanup sound on unmount
    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    useEffect(() => {
        if (callState === 'ringing') {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.15, duration: 400, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
                ])
            ).start();

            if (Platform.OS !== 'web') {
                const interval = setInterval(() => {
                    Vibration.vibrate(500);
                }, 1500);
                return () => clearInterval(interval);
            }
        }
    }, [callState, pulseAnim]);

    // Handle ringing sound
    useEffect(() => {
        async function playRingtone() {
            if (callState === 'ringing') {
                try {
                    await Audio.setAudioModeAsync({
                        allowsRecordingIOS: false,
                        playsInSilentModeIOS: true,
                        staysActiveInBackground: true,
                        shouldDuckAndroid: true,
                        playThroughEarpieceAndroid: false,
                    });
                    const { sound: newSound } = await Audio.Sound.createAsync(
                        { uri: 'https://cdn.freesound.org/previews/411/411089_5121236-lq.mp3' },
                        { shouldPlay: true, isLooping: true }
                    );
                    setSound(newSound);
                } catch (error) {
                    console.log('Error playing sound:', error);
                }
            } else if (sound) {
                sound.stopAsync();
            }
        }

        playRingtone();
    }, [callState]);

    useEffect(() => {
        if (callState === 'active') {
            Animated.timing(slideAnim, { toValue: 0, duration: 300, useNativeDriver: true }).start();
            const interval = setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [callState, slideAnim]);

    const startFakeCall = useCallback(() => {
        console.log('[FakeCall] Starting with delay:', delay);

        // Switch to a "waiting" or let setup stay until `delay` finishes
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        // Simulate the real delay before ringing
        setTimeout(() => {
            setCallState('ringing');
        }, delay * 1000);
    }, [delay]);

    const answerCall = useCallback(() => {
        console.log('[FakeCall] Answered');
        setCallState('active');
        setElapsed(0);
        Vibration.cancel();
    }, []);

    const endCall = useCallback(() => {
        console.log('[FakeCall] Ended');
        setCallState('ended');
        Vibration.cancel();
        setTimeout(() => router.back(), 1500);
    }, [router]);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const delayOptions = [3, 5, 10, 15, 30];

    if (callState === 'setup') {
        return (
            <View style={styles.root}>
                <SafeAreaView style={styles.safeArea} edges={['top']}>
                    <View style={styles.setupHeader}>
                        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                            <X size={22} color={Colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={styles.setupTitle}>Fake Call</Text>
                        <View style={{ width: 44 }} />
                    </View>

                    <View style={styles.setupContent}>
                        <View style={styles.callerPreview}>
                            <View style={styles.callerAvatar}>
                                <User size={36} color={Colors.textMuted} />
                            </View>
                            <Text style={styles.callerName}>Mom</Text>
                            <Text style={styles.callerSubtext}>Incoming call simulation</Text>
                        </View>

                        <Text style={styles.delayLabel}>RING DELAY</Text>
                        <View style={styles.delayOptions}>
                            {delayOptions.map((d) => (
                                <TouchableOpacity
                                    key={d}
                                    style={[styles.delayOption, delay === d && styles.delayOptionActive]}
                                    onPress={() => setDelay(d)}
                                >
                                    <Text style={[
                                        styles.delayOptionText,
                                        delay === d && styles.delayOptionTextActive,
                                    ]}>{d}s</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <TouchableOpacity
                            style={styles.startCallBtn}
                            onPress={startFakeCall}
                            testID="start-fake-call"
                        >
                            <Phone size={20} color={Colors.white} />
                            <Text style={styles.startCallBtnText}>Start Fake Call</Text>
                        </TouchableOpacity>

                        <Text style={styles.hintText}>
                            The call will appear as a real incoming call after the selected delay
                        </Text>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    if (callState === 'ringing') {
        return (
            <View style={styles.callRoot}>
                <SafeAreaView style={styles.callSafeArea}>
                    <View style={styles.callerSection}>
                        <Animated.View style={[styles.ringingAvatar, { transform: [{ scale: pulseAnim }] }]}>
                            <User size={40} color={Colors.white} />
                        </Animated.View>
                        <Text style={styles.ringingName}>Mom</Text>
                        <Text style={styles.ringingSubtext}>Incoming Call...</Text>
                    </View>

                    <View style={styles.callActions}>
                        <TouchableOpacity style={styles.declineBtn} onPress={endCall}>
                            <PhoneOff size={28} color={Colors.white} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.answerBtn} onPress={answerCall}>
                            <Phone size={28} color={Colors.white} />
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        );
    }

    if (callState === 'active') {
        return (
            <View style={styles.callRoot}>
                <SafeAreaView style={styles.callSafeArea}>
                    <Animated.View style={[styles.activeCallSection, { transform: [{ translateY: slideAnim }] }]}>
                        <View style={styles.activeAvatar}>
                            <User size={32} color={Colors.white} />
                        </View>
                        <Text style={styles.activeName}>Mom</Text>
                        <Text style={styles.activeTimer}>{formatTime(elapsed)}</Text>
                    </Animated.View>

                    <TouchableOpacity style={styles.endCallBtn} onPress={endCall}>
                        <PhoneOff size={28} color={Colors.white} />
                    </TouchableOpacity>
                </SafeAreaView>
            </View>
        );
    }

    return (
        <View style={styles.callRoot}>
            <SafeAreaView style={styles.callSafeArea}>
                <View style={styles.endedSection}>
                    <Text style={styles.endedText}>Call Ended</Text>
                    <Text style={styles.endedSubtext}>Redirecting...</Text>
                </View>
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
    setupHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
    },
    setupTitle: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: Colors.text,
    },
    setupContent: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    callerPreview: {
        alignItems: 'center',
        marginTop: 40,
        marginBottom: 40,
    },
    callerAvatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        borderWidth: 2,
        borderColor: Colors.surfaceBorder,
    },
    callerName: {
        fontSize: 24,
        fontWeight: '800' as const,
        color: Colors.text,
        marginBottom: 4,
    },
    callerSubtext: {
        fontSize: 14,
        color: Colors.textMuted,
    },
    delayLabel: {
        fontSize: 11,
        fontWeight: '800' as const,
        color: Colors.textMuted,
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    delayOptions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 40,
    },
    delayOption: {
        paddingHorizontal: 18,
        paddingVertical: 10,
        borderRadius: 12,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    delayOptionActive: {
        backgroundColor: Colors.accent + '20',
        borderColor: Colors.accent,
    },
    delayOptionText: {
        color: Colors.textSecondary,
        fontSize: 15,
        fontWeight: '600' as const,
    },
    delayOptionTextActive: {
        color: Colors.accent,
    },
    startCallBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.safeGreen,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
        marginBottom: 20,
    },
    startCallBtnText: {
        color: Colors.white,
        fontSize: 17,
        fontWeight: '700' as const,
    },
    hintText: {
        color: Colors.textMuted,
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 30,
        lineHeight: 19,
    },
    callRoot: {
        flex: 1,
        backgroundColor: '#1A1A2E',
    },
    callSafeArea: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 60,
    },
    callerSection: {
        alignItems: 'center',
        marginTop: 60,
    },
    ringingAvatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        backgroundColor: Colors.safeGreen,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    ringingName: {
        fontSize: 30,
        fontWeight: '800' as const,
        color: Colors.white,
        marginBottom: 6,
    },
    ringingSubtext: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.6)',
    },
    callActions: {
        flexDirection: 'row',
        gap: 60,
    },
    declineBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },
    answerBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.safeGreen,
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeCallSection: {
        alignItems: 'center',
        marginTop: 40,
    },
    activeAvatar: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.safeGreen,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    activeName: {
        fontSize: 26,
        fontWeight: '800' as const,
        color: Colors.white,
        marginBottom: 6,
    },
    activeTimer: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.5)',
        fontWeight: '600' as const,
        fontVariant: ['tabular-nums'],
    },
    endCallBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: Colors.danger,
        alignItems: 'center',
        justifyContent: 'center',
    },
    endedSection: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    endedText: {
        fontSize: 24,
        fontWeight: '800' as const,
        color: Colors.white,
        marginBottom: 8,
    },
    endedSubtext: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
    },
});
