import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, Save, ChevronDown, User, Droplets, Pill, FileText } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafety } from '@/providers/SafetyProvider';
import { BLOOD_GROUPS } from '@/constants/relationships';
import type { SafetyCard } from '@/types/safety';

export default function ProfileScreen() {
  const { safetyCard, saveSafetyCard, contacts } = useSafety();
  const [form, setForm] = useState<SafetyCard>(safetyCard);
  const [showBloodPicker, setShowBloodPicker] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setForm(safetyCard);
  }, [safetyCard]);

  const updateField = useCallback((field: keyof SafetyCard, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
  }, []);

  const handleSave = useCallback(() => {
    console.log('[Profile] Saving safety card');
    saveSafetyCard(form);
    setHasChanges(false);
    Alert.alert('Saved', 'Your safety card has been updated.');
  }, [form, saveSafetyCard]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Safety Card</Text>
            {hasChanges && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={handleSave}
                testID="save-card-btn"
              >
                <Save size={18} color={Colors.white} />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            )}
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.cardPreview}>
              <View style={styles.cardHeader}>
                <View style={styles.cardIconRow}>
                  <Heart size={16} color={Colors.primary} />
                  <Text style={styles.cardLabel}>DIGITAL SAFETY CARD</Text>
                </View>
                <Text style={styles.cardName}>
                  {form.fullName || 'Your Name'}
                </Text>
              </View>
              <View style={styles.cardGrid}>
                <View style={styles.cardGridItem}>
                  <Text style={styles.cardGridLabel}>Blood Group</Text>
                  <Text style={styles.cardGridValue}>{form.bloodGroup || '—'}</Text>
                </View>
                <View style={styles.cardGridItem}>
                  <Text style={styles.cardGridLabel}>Contacts</Text>
                  <Text style={styles.cardGridValue}>{contacts.length}</Text>
                </View>
                <View style={styles.cardGridItem}>
                  <Text style={styles.cardGridLabel}>Allergies</Text>
                  <Text style={styles.cardGridValue} numberOfLines={1}>
                    {form.allergies || 'None'}
                  </Text>
                </View>
                <View style={styles.cardGridItem}>
                  <Text style={styles.cardGridLabel}>Medications</Text>
                  <Text style={styles.cardGridValue} numberOfLines={1}>
                    {form.medications || 'None'}
                  </Text>
                </View>
              </View>
            </View>

            <Text style={styles.sectionLabel}>PERSONAL INFORMATION</Text>

            <View style={styles.fieldGroup}>
              <View style={styles.fieldHeader}>
                <User size={14} color={Colors.textMuted} />
                <Text style={styles.fieldLabel}>Full Name</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Enter your full name"
                placeholderTextColor={Colors.textMuted}
                value={form.fullName}
                onChangeText={(v) => updateField('fullName', v)}
                testID="card-name-input"
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.fieldHeader}>
                <Droplets size={14} color={Colors.textMuted} />
                <Text style={styles.fieldLabel}>Blood Group</Text>
              </View>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowBloodPicker(!showBloodPicker)}
              >
                <Text style={styles.pickerText}>{form.bloodGroup}</Text>
                <ChevronDown size={16} color={Colors.textSecondary} />
              </TouchableOpacity>
              {showBloodPicker && (
                <View style={styles.pickerOptions}>
                  {BLOOD_GROUPS.map((bg) => (
                    <TouchableOpacity
                      key={bg}
                      style={[
                        styles.pickerOption,
                        form.bloodGroup === bg && styles.pickerOptionActive,
                      ]}
                      onPress={() => {
                        updateField('bloodGroup', bg);
                        setShowBloodPicker(false);
                      }}
                    >
                      <Text style={[
                        styles.pickerOptionText,
                        form.bloodGroup === bg && styles.pickerOptionTextActive,
                      ]}>{bg}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            <Text style={styles.sectionLabel}>MEDICAL INFORMATION</Text>

            <View style={styles.fieldGroup}>
              <View style={styles.fieldHeader}>
                <Pill size={14} color={Colors.textMuted} />
                <Text style={styles.fieldLabel}>Allergies</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="e.g., Penicillin, Peanuts"
                placeholderTextColor={Colors.textMuted}
                value={form.allergies}
                onChangeText={(v) => updateField('allergies', v)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.fieldHeader}>
                <Pill size={14} color={Colors.textMuted} />
                <Text style={styles.fieldLabel}>Medications</Text>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Current medications"
                placeholderTextColor={Colors.textMuted}
                value={form.medications}
                onChangeText={(v) => updateField('medications', v)}
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.fieldHeader}>
                <FileText size={14} color={Colors.textMuted} />
                <Text style={styles.fieldLabel}>Medical Conditions</Text>
              </View>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Any medical conditions"
                placeholderTextColor={Colors.textMuted}
                value={form.medicalConditions}
                onChangeText={(v) => updateField('medicalConditions', v)}
                multiline
              />
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.fieldHeader}>
                <FileText size={14} color={Colors.textMuted} />
                <Text style={styles.fieldLabel}>Address</Text>
              </View>
              <TextInput
                style={[styles.input, styles.multilineInput]}
                placeholder="Home address"
                placeholderTextColor={Colors.textMuted}
                value={form.address}
                onChangeText={(v) => updateField('address', v)}
                multiline
              />
            </View>

            <View style={styles.offlineNote}>
              <Text style={styles.offlineNoteText}>
                Your safety card is stored locally and available offline
              </Text>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  saveButtonText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: '700' as const,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  cardPreview: {
    backgroundColor: Colors.surface,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.primary + '30',
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 10,
    fontWeight: '800' as const,
    color: Colors.primary,
    letterSpacing: 1.5,
  },
  cardName: {
    fontSize: 22,
    fontWeight: '800' as const,
    color: Colors.text,
  },
  cardGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  cardGridItem: {
    width: '45%' as any,
  },
  cardGridLabel: {
    fontSize: 10,
    fontWeight: '700' as const,
    color: Colors.textMuted,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
    marginBottom: 2,
  },
  cardGridValue: {
    fontSize: 15,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '800' as const,
    color: Colors.textMuted,
    letterSpacing: 1.5,
    marginBottom: 14,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.textSecondary,
  },
  input: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top' as const,
  },
  pickerButton: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  pickerText: {
    color: Colors.text,
    fontSize: 15,
  },
  pickerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  pickerOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  pickerOptionActive: {
    backgroundColor: Colors.primary + '20',
    borderColor: Colors.primary,
  },
  pickerOptionText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600' as const,
  },
  pickerOptionTextActive: {
    color: Colors.primary,
  },
  offlineNote: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    alignItems: 'center',
  },
  offlineNoteText: {
    fontSize: 12,
    color: Colors.textMuted,
    fontWeight: '500' as const,
  },
});
