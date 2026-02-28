import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Colors } from '@/constants/colors';
import { useSafety } from '@/providers/SafetyProvider';

export default function SOSButton() {
  const { sosState, triggerSOS, cancelSOS, resolveSOS } = useSafety();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const outerPulse1 = useRef(new Animated.Value(0.8)).current;
  const outerPulse2 = useRef(new Animated.Value(0.8)).current;
  const opacityPulse1 = useRef(new Animated.Value(0.4)).current;
  const opacityPulse2 = useRef(new Animated.Value(0.4)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (sosState.status === 'idle') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.05, duration: 1200, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 1200, useNativeDriver: true }),
        ])
      ).start();

      Animated.loop(
        Animated.parallel([
          Animated.sequence([
            Animated.timing(outerPulse1, { toValue: 1.6, duration: 2400, useNativeDriver: true }),
            Animated.timing(outerPulse1, { toValue: 0.8, duration: 0, useNativeDriver: true }),
          ]),
          Animated.sequence([
            Animated.timing(opacityPulse1, { toValue: 0, duration: 2400, useNativeDriver: true }),
            Animated.timing(opacityPulse1, { toValue: 0.4, duration: 0, useNativeDriver: true }),
          ]),
        ])
      ).start();

      const delay = setTimeout(() => {
        Animated.loop(
          Animated.parallel([
            Animated.sequence([
              Animated.timing(outerPulse2, { toValue: 1.6, duration: 2400, useNativeDriver: true }),
              Animated.timing(outerPulse2, { toValue: 0.8, duration: 0, useNativeDriver: true }),
            ]),
            Animated.sequence([
              Animated.timing(opacityPulse2, { toValue: 0, duration: 2400, useNativeDriver: true }),
              Animated.timing(opacityPulse2, { toValue: 0.4, duration: 0, useNativeDriver: true }),
            ]),
          ])
        ).start();
      }, 1200);

      return () => clearTimeout(delay);
    }

    if (sosState.status === 'countdown' || sosState.status === 'active') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue: 5, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -5, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 3, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -3, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true }),
          Animated.delay(500),
        ])
      ).start();
    }
  }, [sosState.status]);

  const handlePress = () => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    }

    if (sosState.status === 'idle') {
      triggerSOS();
    } else if (sosState.status === 'countdown') {
      cancelSOS();
    } else if (sosState.status === 'active') {
      resolveSOS();
    }
  };

  const getButtonContent = () => {
    switch (sosState.status) {
      case 'countdown':
        return (
          <View style={styles.buttonInner}>
            <Text style={styles.countdownNumber}>{sosState.countdownSeconds}</Text>
            <Text style={styles.countdownLabel}>TAP TO CANCEL</Text>
          </View>
        );
      case 'active':
        return (
          <View style={styles.buttonInner}>
            <Text style={styles.sosText}>ACTIVE</Text>
            <Text style={styles.sosSubtext}>Tap to resolve</Text>
          </View>
        );
      case 'resolved':
        return (
          <View style={styles.buttonInner}>
            <Text style={styles.resolvedText}>SAFE</Text>
          </View>
        );
      default:
        return (
          <View style={styles.buttonInner}>
            <Text style={styles.sosText}>SOS</Text>
            <Text style={styles.sosSubtext}>Hold or Tap</Text>
          </View>
        );
    }
  };

  const isActive = sosState.status === 'active' || sosState.status === 'countdown';
  const bgColor = sosState.status === 'resolved' ? Colors.safeGreen : Colors.sosRed;

  return (
    <View style={styles.container}>
      {sosState.status === 'idle' && (
        <>
          <Animated.View
            style={[
              styles.pulseRing,
              { transform: [{ scale: outerPulse1 }], opacity: opacityPulse1, borderColor: Colors.sosRed },
            ]}
          />
          <Animated.View
            style={[
              styles.pulseRing,
              { transform: [{ scale: outerPulse2 }], opacity: opacityPulse2, borderColor: Colors.sosRed },
            ]}
          />
        </>
      )}
      <Animated.View
        style={[
          styles.buttonShadow,
          {
            transform: [
              { scale: sosState.status === 'idle' ? pulseAnim : 1 },
              { translateX: isActive ? shakeAnim : 0 },
            ],
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.button, { backgroundColor: bgColor }]}
          onPress={handlePress}
          activeOpacity={0.8}
          testID="sos-button"
        >
          {getButtonContent()}
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const BUTTON_SIZE = 160;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    height: BUTTON_SIZE + 80,
    width: BUTTON_SIZE + 80,
  },
  pulseRing: {
    position: 'absolute',
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    borderWidth: 2,
  },
  buttonShadow: {
    shadowColor: Colors.sosRed,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 15,
  },
  button: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  buttonInner: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  sosText: {
    color: Colors.white,
    fontSize: 32,
    fontWeight: '900' as const,
    letterSpacing: 4,
  },
  sosSubtext: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    fontWeight: '600' as const,
    marginTop: 4,
    letterSpacing: 1,
  },
  countdownNumber: {
    color: Colors.white,
    fontSize: 48,
    fontWeight: '900' as const,
  },
  countdownLabel: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    fontWeight: '700' as const,
    letterSpacing: 1,
  },
  resolvedText: {
    color: Colors.white,
    fontSize: 28,
    fontWeight: '900' as const,
    letterSpacing: 3,
  },
});
