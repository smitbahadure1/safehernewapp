import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Phone, Timer, Volume2, CreditCard, ShieldCheck, Eye } from 'lucide-react-native';
import { Colors } from '@/constants/colors';

interface ToolItem {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  route: string;
}

const tools: ToolItem[] = [
  {
    id: 'fake-call',
    icon: <Phone size={22} color={Colors.accent} />,
    title: 'Fake Call',
    description: 'Simulate an incoming call to escape uncomfortable situations',
    color: Colors.accent,
    route: '/tools/fake-call',
  },
  {
    id: 'safety-timer',
    icon: <Timer size={22} color={Colors.timerOrange} />,
    title: 'Safety Timer',
    description: 'Set a check-in timer that triggers SOS if not dismissed',
    color: Colors.timerOrange,
    route: '/tools/safety-timer',
  },
  {
    id: 'alarm',
    icon: <Volume2 size={22} color={Colors.danger} />,
    title: 'Personal Alarm',
    description: 'Activate a loud siren to deter threats and attract attention',
    color: Colors.danger,
    route: '/tools/alarm',
  },
  {
    id: 'safety-card',
    icon: <CreditCard size={22} color={Colors.safeGreen} />,
    title: 'Safety Card',
    description: 'Your digital ID with medical info and emergency contacts',
    color: Colors.safeGreen,
    route: '/profile',
  },
];

export default function ToolsScreen() {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <Text style={styles.title}>Safety Tools</Text>
          <View style={styles.shieldBadge}>
            <ShieldCheck size={20} color={Colors.safeGreen} />
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionLabel}>PERSONAL SAFETY</Text>

          {tools.map((tool) => (
            <TouchableOpacity
              key={tool.id}
              style={styles.toolCard}
              onPress={() => router.push(tool.route as any)}
              activeOpacity={0.7}
              testID={`tool-${tool.id}`}
            >
              <View style={[styles.toolIconContainer, { backgroundColor: tool.color + '15' }]}>
                {tool.icon}
              </View>
              <View style={styles.toolInfo}>
                <Text style={styles.toolTitle}>{tool.title}</Text>
                <Text style={styles.toolDescription}>{tool.description}</Text>
              </View>
              <View style={styles.toolArrow}>
                <Text style={styles.toolArrowText}>›</Text>
              </View>
            </TouchableOpacity>
          ))}

          <View style={styles.tipsSection}>
            <Text style={styles.sectionLabel}>SAFETY FEATURES</Text>
            <View style={styles.featureRow}>
              <View style={styles.featureCard}>
                <ShieldCheck size={20} color={Colors.primary} />
                <Text style={styles.featureTitle}>SOS Alert</Text>
                <Text style={styles.featureDesc}>One-tap emergency activation from home</Text>
              </View>
              <View style={styles.featureCard}>
                <Eye size={20} color={Colors.accent} />
                <Text style={styles.featureTitle}>Discreet Mode</Text>
                <Text style={styles.featureDesc}>Fake call works with screen locked</Text>
              </View>
            </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800' as const,
    color: Colors.text,
    letterSpacing: -0.5,
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
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 14,
    marginTop: 4,
  },
  toolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  toolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  toolInfo: {
    flex: 1,
  },
  toolTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 3,
  },
  toolDescription: {
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
  toolArrow: {
    marginLeft: 8,
  },
  toolArrowText: {
    fontSize: 22,
    color: Colors.textMuted,
    fontWeight: '300' as const,
  },
  tipsSection: {
    marginTop: 20,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 12,
  },
  featureCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700' as const,
    color: Colors.text,
    marginTop: 10,
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 11,
    color: Colors.textMuted,
    lineHeight: 16,
  },
});
