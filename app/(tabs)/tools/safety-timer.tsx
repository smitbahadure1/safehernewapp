import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Animated, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Timer, X, Play, Pause, RotateCcw, AlertTriangle } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useSafety } from '@/providers/SafetyProvider';

type TimerState = 'setup' | 'running' | 'paused' | 'expired';

export default function SafetyTimerScreen() {
    const router = useRouter();
    const { triggerSOS } = useSafety();
    const [timerState, setTimerState] = useState<TimerState>('setup');
    const [selectedMinutes, setSelectedMinutes] = useState(15);
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    const totalSeconds = selectedMinutes * 60;

    useEffect(() => {
        if (timerState === 'running' && remainingSeconds > 0) {
            const interval = setInterval(() => {
                setRemainingSeconds((prev) => {
                    if (prev <= 1) {
                        setTimerState('expired');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [timerState, remainingSeconds]);

    const resumeTimer = useCallback(() => {
        setTimerState('running');
    }, []);

    const resetTimer = useCallback(() => {
        setTimerState('setup');
        setRemainingSeconds(0);
        pulseAnim.setValue(1);
    }, [pulseAnim]);

    useEffect(() => {
        if (timerState === 'expired') {
            console.log('[SafetyTimer] Timer expired - triggering alert');
            if (Platform.OS !== 'web') {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
            }
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.1, duration: 300, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
                ])
            ).start();

            const timeout = setTimeout(() => {
                Alert.alert(
                    'Timer Expired',
                    'Are you safe? SOS will be triggered if you don\'t respond.',
                    [
                        { text: 'I\'m Safe', style: 'cancel', onPress: () => resetTimer() },
                        { text: 'Trigger SOS', style: 'destructive', onPress: () => { triggerSOS(); router.back(); } },
                    ]
                );
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, [timerState, pulseAnim, resetTimer, router, triggerSOS]);

    const startTimer = useCallback(() => {
        console.log('[SafetyTimer] Starting timer for', selectedMinutes, 'minutes');
        setRemainingSeconds(selectedMinutes * 60);
        setTimerState('running');
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
    }, [selectedMinutes]);

    const pauseTimer = useCallback(() => {
        setTimerState('paused');
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const minuteOptions = [5, 10, 15, 30, 60];

    return (
        <View style={styles.root}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                        <X size={22} color={Colors.textSecondary} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Safety Timer</Text>
                    <View style={{ width: 44 }} />
                </View>

                <View style={styles.content}>
                    {timerState === 'setup' ? (
                        <>
                            <View style={styles.timerDisplay}>
                                <Timer size={32} color={Colors.timerOrange} />
                                <Text style={styles.setupTime}>{selectedMinutes} min</Text>
                                <Text style={styles.setupSubtext}>Check-in timer</Text>
                            </View>

                            <Text style={styles.durationLabel}>SELECT DURATION</Text>
                            <View style={styles.durationOptions}>
                                {minuteOptions.map((m) => (
                                    <TouchableOpacity
                                        key={m}
                                        style={[
                                            styles.durationOption,
                                            selectedMinutes === m && styles.durationOptionActive,
                                        ]}
                                        onPress={() => setSelectedMinutes(m)}
                                    >
                                        <Text style={[
                                            styles.durationOptionText,
                                            selectedMinutes === m && styles.durationOptionTextActive,
                                        ]}>{m === 60 ? '1h' : `${m}m`}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <TouchableOpacity
                                style={styles.startBtn}
                                onPress={startTimer}
                                testID="start-timer"
                            >
                                <Play size={20} color={Colors.white} />
                                <Text style={styles.startBtnText}>Start Timer</Text>
                            </TouchableOpacity>

                            <Text style={styles.hintText}>
                                If you don&apos;t dismiss the timer when it expires, an SOS alert will be sent to your contacts
                            </Text>
                        </>
                    ) : (
                        <>
                            <Animated.View style={[styles.runningDisplay, { transform: [{ scale: pulseAnim }] }]}>
                                <View style={styles.progressRing}>
                                    <View style={[
                                        styles.progressFill,
                                        {
                                            borderColor: timerState === 'expired' ? Colors.danger : Colors.timerOrange,
                                        },
                                    ]} />
                                </View>
                                <Text style={[
                                    styles.runningTime,
                                    timerState === 'expired' && { color: Colors.danger },
                                ]}>
                                    {timerState === 'expired' ? 'EXPIRED' : formatTime(remainingSeconds)}
                                </Text>
                                <Text style={styles.runningSubtext}>
                                    {timerState === 'expired'
                                        ? 'Are you safe?'
                                        : timerState === 'paused'
                                            ? 'Paused'
                                            : 'Time remaining'}
                                </Text>
                            </Animated.View>

                            {timerState === 'expired' && (
                                <View style={styles.expiredWarning}>
                                    <AlertTriangle size={18} color={Colors.danger} />
                                    <Text style={styles.expiredWarningText}>
                                        Timer expired! SOS will be triggered if you don&apos;t respond
                                    </Text>
                                </View>
                            )}

                            <View style={styles.controlRow}>
                                <TouchableOpacity style={styles.resetBtn} onPress={resetTimer}>
                                    <RotateCcw size={20} color={Colors.textSecondary} />
                                </TouchableOpacity>

                                {timerState !== 'expired' && (
                                    <TouchableOpacity
                                        style={[
                                            styles.pauseResumeBtn,
                                            { backgroundColor: timerState === 'paused' ? Colors.safeGreen : Colors.timerOrange },
                                        ]}
                                        onPress={timerState === 'paused' ? resumeTimer : pauseTimer}
                                    >
                                        {timerState === 'paused' ? (
                                            <Play size={24} color={Colors.white} />
                                        ) : (
                                            <Pause size={24} color={Colors.white} />
                                        )}
                                    </TouchableOpacity>
                                )}

                                {timerState === 'expired' && (
                                    <TouchableOpacity
                                        style={[styles.pauseResumeBtn, { backgroundColor: Colors.safeGreen }]}
                                        onPress={resetTimer}
                                    >
                                        <Text style={styles.imSafeText}>I&apos;m Safe</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </>
                    )}
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
    header: {
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
    headerTitle: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: Colors.text,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    timerDisplay: {
        alignItems: 'center',
        marginTop: 50,
        marginBottom: 40,
    },
    setupTime: {
        fontSize: 56,
        fontWeight: '900' as const,
        color: Colors.text,
        marginTop: 12,
        fontVariant: ['tabular-nums'],
    },
    setupSubtext: {
        fontSize: 14,
        color: Colors.textMuted,
        marginTop: 4,
    },
    durationLabel: {
        fontSize: 11,
        fontWeight: '800' as const,
        color: Colors.textMuted,
        letterSpacing: 1.5,
        marginBottom: 12,
    },
    durationOptions: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 40,
    },
    durationOption: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 14,
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    durationOptionActive: {
        backgroundColor: Colors.timerOrange + '20',
        borderColor: Colors.timerOrange,
    },
    durationOptionText: {
        color: Colors.textSecondary,
        fontSize: 16,
        fontWeight: '700' as const,
    },
    durationOptionTextActive: {
        color: Colors.timerOrange,
    },
    startBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.timerOrange,
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        gap: 10,
        marginBottom: 20,
    },
    startBtnText: {
        color: Colors.white,
        fontSize: 17,
        fontWeight: '700' as const,
    },
    hintText: {
        color: Colors.textMuted,
        fontSize: 13,
        textAlign: 'center',
        paddingHorizontal: 20,
        lineHeight: 19,
    },
    runningDisplay: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 40,
    },
    progressRing: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    progressFill: {
        width: 180,
        height: 180,
        borderRadius: 90,
        backgroundColor: Colors.background,
        borderWidth: 4,
    },
    runningTime: {
        fontSize: 48,
        fontWeight: '900' as const,
        color: Colors.text,
        fontVariant: ['tabular-nums'],
        position: 'absolute',
        top: 76,
    },
    runningSubtext: {
        fontSize: 14,
        color: Colors.textMuted,
        marginTop: 0,
    },
    expiredWarning: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 12,
        padding: 14,
        gap: 10,
        marginBottom: 30,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
    },
    expiredWarningText: {
        flex: 1,
        color: Colors.danger,
        fontSize: 13,
        fontWeight: '600' as const,
        lineHeight: 18,
    },
    controlRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    resetBtn: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: Colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.surfaceBorder,
    },
    pauseResumeBtn: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imSafeText: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: '800' as const,
    },
});
