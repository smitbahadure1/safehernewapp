import React, { useState, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, Alert, Platform, KeyboardAvoidingView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { UserPlus, Trash2, Star, Phone, ChevronDown } from 'lucide-react-native';
import { Colors } from '@/constants/colors';
import { useSafety } from '@/providers/SafetyProvider';
import { RELATIONSHIPS } from '@/constants/relationships';
import type { EmergencyContact } from '@/types/safety';

export default function ContactsScreen() {
  const { contacts, addContact, removeContact, updateContact } = useSafety();
  const [isAdding, setIsAdding] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [relationship, setRelationship] = useState('Friend');
  const [showRelPicker, setShowRelPicker] = useState(false);

  const handleAdd = useCallback(() => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Missing Info', 'Please enter both name and phone number.');
      return;
    }
    const newContact: EmergencyContact = {
      id: Date.now().toString(),
      name: name.trim(),
      phone: phone.trim(),
      relationship,
      isPrimary: contacts.length === 0,
    };
    console.log('[Contacts] Adding contact:', newContact.name);
    addContact(newContact);
    setName('');
    setPhone('');
    setRelationship('Friend');
    setIsAdding(false);
  }, [name, phone, relationship, contacts.length, addContact]);

  const handleRemove = useCallback((id: string, contactName: string) => {
    Alert.alert(
      'Remove Contact',
      `Remove ${contactName} from emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeContact(id) },
      ]
    );
  }, [removeContact]);

  const togglePrimary = useCallback((id: string) => {
    const contact = contacts.find((c) => c.id === id);
    if (contact) {
      updateContact(id, { isPrimary: !contact.isPrimary });
    }
  }, [contacts, updateContact]);

  return (
    <View style={styles.root}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Emergency Contacts</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setIsAdding(!isAdding)}
              testID="add-contact-btn"
            >
              <UserPlus size={18} color={Colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {isAdding && (
              <View style={styles.formCard}>
                <Text style={styles.formTitle}>New Contact</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Full Name"
                  placeholderTextColor={Colors.textMuted}
                  value={name}
                  onChangeText={setName}
                  testID="contact-name-input"
                />
                <TextInput
                  style={styles.input}
                  placeholder="Phone Number"
                  placeholderTextColor={Colors.textMuted}
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                  testID="contact-phone-input"
                />
                <TouchableOpacity
                  style={styles.pickerButton}
                  onPress={() => setShowRelPicker(!showRelPicker)}
                >
                  <Text style={styles.pickerText}>{relationship}</Text>
                  <ChevronDown size={16} color={Colors.textSecondary} />
                </TouchableOpacity>
                {showRelPicker && (
                  <View style={styles.pickerOptions}>
                    {RELATIONSHIPS.map((rel) => (
                      <TouchableOpacity
                        key={rel}
                        style={[
                          styles.pickerOption,
                          relationship === rel && styles.pickerOptionActive,
                        ]}
                        onPress={() => { setRelationship(rel); setShowRelPicker(false); }}
                      >
                        <Text style={[
                          styles.pickerOptionText,
                          relationship === rel && styles.pickerOptionTextActive,
                        ]}>{rel}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
                <View style={styles.formActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => setIsAdding(false)}
                  >
                    <Text style={styles.cancelBtnText}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.saveBtn}
                    onPress={handleAdd}
                    testID="save-contact-btn"
                  >
                    <Text style={styles.saveBtnText}>Save Contact</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {contacts.length === 0 && !isAdding && (
              <View style={styles.emptyState}>
                <View style={styles.emptyIcon}>
                  <UserPlus size={32} color={Colors.textMuted} />
                </View>
                <Text style={styles.emptyTitle}>No contacts yet</Text>
                <Text style={styles.emptySubtext}>
                  Add trusted people who will be notified in emergencies
                </Text>
                <TouchableOpacity
                  style={styles.emptyAddBtn}
                  onPress={() => setIsAdding(true)}
                >
                  <Text style={styles.emptyAddBtnText}>Add First Contact</Text>
                </TouchableOpacity>
              </View>
            )}

            {contacts.map((contact) => (
              <View key={contact.id} style={styles.contactCard}>
                <View style={styles.contactAvatar}>
                  <Text style={styles.contactInitial}>
                    {contact.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.contactInfo}>
                  <View style={styles.contactNameRow}>
                    <Text style={styles.contactName}>{contact.name}</Text>
                    {contact.isPrimary && (
                      <View style={styles.primaryBadge}>
                        <Text style={styles.primaryBadgeText}>PRIMARY</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.contactPhone}>{contact.phone}</Text>
                  <Text style={styles.contactRelation}>{contact.relationship}</Text>
                </View>
                <View style={styles.contactActions}>
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => togglePrimary(contact.id)}
                  >
                    <Star
                      size={18}
                      color={contact.isPrimary ? Colors.warning : Colors.textMuted}
                      fill={contact.isPrimary ? Colors.warning : 'transparent'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionIcon}
                    onPress={() => handleRemove(contact.id, contact.name)}
                  >
                    <Trash2 size={18} color={Colors.danger} />
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.infoCard}>
              <Phone size={16} color={Colors.primary} />
              <Text style={styles.infoText}>
                Primary contacts receive alerts first. All contacts get notified during SOS.
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
  addButton: {
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
  formCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  formTitle: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 16,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    color: Colors.text,
    fontSize: 15,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  pickerButton: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
    marginBottom: 12,
  },
  pickerText: {
    color: Colors.text,
    fontSize: 15,
  },
  pickerOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  pickerOption: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: Colors.background,
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
  formActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  cancelBtnText: {
    color: Colors.textSecondary,
    fontSize: 15,
    fontWeight: '600' as const,
  },
  saveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.text,
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  emptyAddBtn: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 12,
  },
  emptyAddBtnText: {
    color: Colors.white,
    fontSize: 15,
    fontWeight: '700' as const,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  contactAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  contactInitial: {
    fontSize: 20,
    fontWeight: '700' as const,
    color: Colors.primary,
  },
  contactInfo: {
    flex: 1,
  },
  contactNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '700' as const,
    color: Colors.text,
  },
  primaryBadge: {
    backgroundColor: Colors.warning + '20',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  primaryBadgeText: {
    fontSize: 9,
    fontWeight: '800' as const,
    color: Colors.warning,
    letterSpacing: 0.5,
  },
  contactPhone: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  contactRelation: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 1,
  },
  contactActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 14,
    marginTop: 10,
    borderWidth: 1,
    borderColor: Colors.surfaceBorder,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: Colors.textMuted,
    lineHeight: 17,
  },
});
