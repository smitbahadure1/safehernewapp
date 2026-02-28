import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Animated, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Volume2, VolumeX, X, ShieldAlert } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';

export default function AlarmScreen() {
  const router = useRouter();
  const [isActive, setIsActive] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const outerRing1 = useRef(new Animated.Value(0.8)).current;
  const outerRing2 = useRef(new Animated.Value(0.8)).current;
  const opacity1 = useRef(new Animated.Value(0.6)).current;
  const opacity2 = useRef(new Animated.Value(0.6)).current;
  const bgFlash = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isActive) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(outerRing1, { toValue: 2, duration: 1000, useNativeDriver: true }),
            Animated.timing(outerRing1, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(opacity1, { toValue: 0, duration: 1000, useNativeDriver: true }),
            Animated.timing(opacity1, { toValue: 0.6, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();

      setTimeout(() => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(outerRing2, { toValue: 2, duration: 1000, useNativeDriver: true }),
              Animated.timing(outerRing2, { toValue: 0.8, duration: 0, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(opacity2, { toValue: 0, duration: 1000, useNativeDriver: true }),
              Animated.timing(opacity2, { toValue: 0.6, duration: 0, useNativeDriver: true }),
            ]),
          ])
        ).start();
      }, 500);

      Animated.loop(
        Animated.sequence([
          Animated.timing(bgFlash, { toValue: 1, duration: 250, useNativeDriver: false }),
          Animated.timing(bgFlash, { toValue: 0, duration: 250, useNativeDriver: false }),
        ])
      ).start();

      if (Platform.OS !== 'web') {
        const hapticInterval = setInterval(() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        }, 600);
        return () => clearInterval(hapticInterval);
      }
    } else {
      pulseAnim.setValue(1);
      outerRing1.setValue(0.8);
      outerRing2.setValue(0.8);
      opacity1.setValue(0.6);
      opacity2.setValue(0.6);
      bgFlash.setValue(0);
    }
  }, [isActive]);

  const toggleAlarm = useCallback(() => {
    console.log('[Alarm]', isActive ? 'Deactivated' : 'Activated');
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }
    setIsActive(!isActive);
  }, [isActive]);

  const bgColor = bgFlash.interpolate({
    inputRange: [0, 1],
    outputRange: [Colors.background, '#1A0000'],
  });

  return (
    <Animated.View style={[styles.root, isActive && { backgroundColor: bgColor }]}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { setIsActive(false); router.back(); }} style={styles.closeBtn}>
            <X size={22} color={Colors.textSecondary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Personal Alarm</Text>
          <View style={{ width: 44 }} />
        </View>

        <View style={styles.content}>
          {!isActive ? (
            <>
              <View style={styles.infoSection}>
                <ShieldAlert size={28} color={Colors.danger} />
                <Text style={styles.infoTitle}>Personal Siren</Text>
                <Text style={styles.infoSubtext}>
                  Activates a loud alarm with visual flash to deter threats and attract attention
                </Text>
              </View>

              <TouchableOpacity
                style={styles.activateBtn}
                onPress={toggleAlarm}
                testID="activate-alarm"
              >
                <Volume2 size={28} color={Colors.white} />
                <Text style={styles.activateBtnText}>Activate Alarm</Text>
              </TouchableOpacity>

              <Text style={styles.hintText}>
                The alarm will create loud vibrations and visual warnings
              </Text>
            </>
          ) : (
            <>
              <View style={styles.alarmContainer}>
                <Animated.View style={[
                  styles.alarmRing,
                  { transform: [{ scale: outerRing1 }], opacity: opacity1 },
                ]} />
                <Animated.View style={[
                  styles.alarmRing,
                  { transform: [{ scale: outerRing2 }], opacity: opacity2 },
                ]} />
                <Animated.View style={[
                  styles.alarmButton,
                  { transform: [{ scale: pulseAnim }] },
                ]}>
                  <Volume2 size={44} color={Colors.white} />
                </Animated.View>
              </View>

              <Text style={styles.alarmActiveText}>ALARM ACTIVE</Text>
              <Text style={styles.alarmActiveSubtext}>Tap below to deactivate</Text>

              <TouchableOpacity
                style={styles.deactivateBtn}
                onPress={toggleAlarm}
                testID="deactivate-alarm"
              >
                <VolumeX size={24} color={Colors.white} />
                <Text style={styles.deactivateBtnText}>Stop Alarm</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
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
  infoSection: {
    alignItems: 'center',
    marginTop: 80,
    marginBottom: 50,
  },
  infoTitle: {
    fontSize: 24,
    fontWeight: '800' as const,
    color: Colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
  },
  activateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.danger,
    paddingHorizontal: 32,
    paddingVertical: 18,
    borderRadius: 16,
    gap: 12,
    marginBottom: 20,
  },
  activateBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700' as const,
  },
  hintText: {
    color: Colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    paddingHorizontal: 30,
    lineHeight: 19,
  },
  alarmContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 80,
    marginBottom: 40,
    width: 200,
    height: 200,
  },
  alarmRing: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: Colors.danger,
  },
  alarmButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: Colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alarmActiveText: {
    fontSize: 24,
    fontWeight: '900' as const,
    color: Colors.danger,
    letterSpacing: 3,
    marginBottom: 6,
  },
  alarmActiveSubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    marginBottom: 40,
  },
  deactivateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.danger,
  },
  deactivateBtnText: {
    color: Colors.danger,
    fontSize: 17,
    fontWeight: '700' as const,
  },
});
