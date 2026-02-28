import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from '@/constants/colors';

const RECORDINGS_KEY = 'safety_audio_recordings';

interface SavedRecording {
    id: string;
    uri: string;
    durationInSeconds: number;
    timestamp: number;
}

export default function AudioRecordingScreen() {
    const router = useRouter();
    const [isRecording, setIsRecording] = useState(false);
    const [elapsed, setElapsed] = useState(0);
    const [recordings, setRecordings] = useState<SavedRecording[]>([]);
    const [playingUri, setPlayingUri] = useState<string | null>(null);
    const recordingRef = useRef<Audio.Recording | null>(null);
    const soundRef = useRef<Audio.Sound | null>(null);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        loadRecordings();
    }, []);

    const loadRecordings = async () => {
        try {
            const stored = await AsyncStorage.getItem(RECORDINGS_KEY);
            if (stored) setRecordings(JSON.parse(stored));
        } catch (e) {
            console.error('Failed to load recordings', e);
        }
    };

    const saveRecordingMetadata = async (newRecording: SavedRecording) => {
        try {
            const updated = [newRecording, ...recordings];
            setRecordings(updated);
            await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save recording metadata', e);
        }
    };

    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;
        if (isRecording) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, { toValue: 1.2, duration: 800, useNativeDriver: true }),
                    Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
                ])
            ).start();

            interval = setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);
        } else {
            pulseAnim.setValue(1);
            pulseAnim.stopAnimation();
        }
        return () => clearInterval(interval);
    }, [isRecording, pulseAnim]);

    const startRecording = async () => {
        try {
            const permission = await Audio.requestPermissionsAsync();
            if (permission.status !== 'granted') return;

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
            });

            const { recording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );
            recordingRef.current = recording;
            setIsRecording(true);
        } catch (err) {
            console.error('Failed to start recording', err);
        }
    };

    const stopRecording = async () => {
        setIsRecording(false);
        try {
            if (!recordingRef.current) return;
            await recordingRef.current.stopAndUnloadAsync();
            const uri = recordingRef.current.getURI();
            if (uri) {
                const newRecording: SavedRecording = {
                    id: Date.now().toString(),
                    uri,
                    durationInSeconds: elapsed,
                    timestamp: Date.now(),
                };
                await saveRecordingMetadata(newRecording);
            }
            recordingRef.current = null;
            setElapsed(0);
        } catch (err) {
            console.error('Failed to stop recording', err);
        }
    };

    const toggleRecording = () => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    };

    const deleteRecording = async (id: string) => {
        const updated = recordings.filter(r => r.id !== id);
        setRecordings(updated);
        await AsyncStorage.setItem(RECORDINGS_KEY, JSON.stringify(updated));
    };

    const playRecording = async (uri: string) => {
        try {
            // If already playing this one, stop it
            if (playingUri === uri && soundRef.current) {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
                soundRef.current = null;
                setPlayingUri(null);
                return;
            }

            // If playing something else, stop that first
            if (soundRef.current) {
                await soundRef.current.stopAsync();
                await soundRef.current.unloadAsync();
            }

            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,
                playsInSilentModeIOS: true,
                staysActiveInBackground: true,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false, // Ensure it's on speaker
            });

            const { sound } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: true }
            );
            soundRef.current = sound;
            setPlayingUri(uri);

            sound.setOnPlaybackStatusUpdate((status) => {
                if (status.isLoaded && status.didJustFinish) {
                    setPlayingUri(null);
                    sound.unloadAsync();
                    soundRef.current = null;
                }
            });
        } catch (err) {
            console.error('Failed to play sound', err);
            setPlayingUri(null);
        }
    };

    // Cleanup sound on unmount
    useEffect(() => {
        return () => {
            if (soundRef.current) {
                soundRef.current.unloadAsync();
            }
        };
    }, []);

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <View style={styles.root}>
            <SafeAreaView style={styles.safeArea} edges={['top']}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
                        <Ionicons name="arrow-back" size={24} color={Colors.text} />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Audio Evidence</Text>
                    <View style={{ width: 44 }} />
                </View>

                <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                    <View style={styles.content}>
                        <Text style={styles.disclaimer}>
                            Discreetly record audio evidence. Recordings are securely encrypted and automatically uploaded to the cloud when complete.
                        </Text>

                        <View style={styles.visualizerContainer}>
                            <Animated.View
                                style={[
                                    styles.pulseCircle,
                                    {
                                        transform: [{ scale: pulseAnim }],
                                        backgroundColor: isRecording ? Colors.danger + '30' : Colors.surfaceBorder,
                                    },
                                ]}
                            />
                            <View style={[styles.micContainer, { backgroundColor: isRecording ? Colors.danger : Colors.surfaceLight }]}>
                                <Ionicons name="mic" size={48} color={isRecording ? Colors.white : Colors.textMuted} />
                            </View>
                        </View>

                        <Text style={styles.timerText}>
                            {isRecording ? formatTime(elapsed) : 'Ready'}
                        </Text>

                        <Text style={[styles.statusText, { color: isRecording ? Colors.danger : Colors.textMuted }]}>
                            {isRecording ? 'Recording in progress...' : 'Tap to start recording'}
                        </Text>

                        <TouchableOpacity
                            style={[styles.recordButton, { backgroundColor: isRecording ? Colors.surfaceLight : Colors.danger }]}
                            onPress={toggleRecording}
                        >
                            <Ionicons name={isRecording ? "stop" : "radio-button-on"} size={24} color={isRecording ? Colors.danger : Colors.white} />
                            <Text style={[styles.recordButtonText, { color: isRecording ? Colors.danger : Colors.white }]}>
                                {isRecording ? 'Stop Recording' : 'Start Recording'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.historySection}>
                            <Text style={styles.historyTitle}>Recent Evidence</Text>
                            {recordings.length === 0 ? (
                                <Text style={styles.emptyText}>No recordings yet</Text>
                            ) : (
                                recordings.map((item) => (
                                    <View key={item.id} style={styles.recordingItem}>
                                        <TouchableOpacity
                                            style={styles.playInfo}
                                            onPress={() => playRecording(item.uri)}
                                        >
                                            <View style={[styles.playIcon, playingUri === item.uri && { backgroundColor: Colors.danger + '20' }]}>
                                                <Ionicons name={playingUri === item.uri ? "stop" : "play"} size={20} color={playingUri === item.uri ? Colors.danger : Colors.primary} />
                                            </View>
                                            <View>
                                                <Text style={styles.itemName}>Recording {new Date(item.timestamp).toLocaleDateString()}</Text>
                                                <Text style={styles.itemTime}>{formatTime(item.durationInSeconds)} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => deleteRecording(item.id)}>
                                            <Ionicons name="trash-outline" size={20} color={Colors.textMuted} />
                                        </TouchableOpacity>
                                    </View>
                                ))
                            )}
                        </View>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: Colors.background },
    safeArea: { flex: 1 },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.surfaceBorder,
    },
    backBtn: {
        width: 44, height: 44, borderRadius: 22, backgroundColor: Colors.surface,
        alignItems: 'center', justifyContent: 'center',
    },
    headerTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
    content: { flex: 1, alignItems: 'center', paddingHorizontal: 24, paddingTop: 40 },
    disclaimer: {
        color: Colors.textSecondary, textAlign: 'center', fontSize: 14,
        lineHeight: 22, marginBottom: 60,
    },
    visualizerContainer: {
        alignItems: 'center', justifyContent: 'center', height: 200, width: 200, marginBottom: 20,
    },
    pulseCircle: {
        position: 'absolute', width: 160, height: 160, borderRadius: 80,
    },
    micContainer: {
        width: 100, height: 100, borderRadius: 50,
        alignItems: 'center', justifyContent: 'center', zIndex: 10,
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
    },
    timerText: {
        fontSize: 42, fontWeight: '800', fontVariant: ['tabular-nums'],
        color: Colors.text, marginBottom: 8,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    statusText: { fontSize: 15, fontWeight: '600', marginBottom: 60 },
    recordButton: {
        flexDirection: 'row', alignItems: 'center', paddingHorizontal: 32,
        paddingVertical: 18, borderRadius: 20, gap: 12, width: '100%', justifyContent: 'center',
        shadowColor: '#000', shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2, shadowRadius: 8, elevation: 4,
    },
    recordButtonText: { fontSize: 18, fontWeight: '700' },
    historySection: { width: '100%', marginTop: 40, paddingBottom: 20 },
    historyTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginBottom: 16 },
    emptyText: { color: Colors.textMuted, fontSize: 14, textAlign: 'center', marginTop: 10 },
    recordingItem: {
        flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
        backgroundColor: Colors.surface, borderRadius: 16, padding: 12, marginBottom: 10,
        borderWidth: 1, borderColor: Colors.surfaceBorder,
    },
    playInfo: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    playIcon: {
        width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.primary + '20',
        alignItems: 'center', justifyContent: 'center', marginRight: 12,
    },
    itemName: { color: Colors.text, fontSize: 14, fontWeight: '600' },
    itemTime: { color: Colors.textMuted, fontSize: 12, marginTop: 2 },
});
