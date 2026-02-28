import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import type { EmergencyContact, SafetyCard, SOSState } from '@/types/safety';

const CONTACTS_KEY = 'safety_contacts';
const CARD_KEY = 'safety_card';

const DEFAULT_CARD: SafetyCard = {
  fullName: '',
  bloodGroup: 'Unknown',
  allergies: '',
  medications: '',
  medicalConditions: '',
  dateOfBirth: '',
  address: '',
};

export const [SafetyProvider, useSafety] = createContextHook(() => {
  const queryClient = useQueryClient();
  const [sosState, setSosState] = useState<SOSState>({
    status: 'idle',
    activatedAt: null,
    countdownSeconds: 5,
  });

  const contactsQuery = useQuery({
    queryKey: ['contacts'],
    queryFn: async (): Promise<EmergencyContact[]> => {
      const stored = await AsyncStorage.getItem(CONTACTS_KEY);
      return stored ? JSON.parse(stored) : [];
    },
  });

  const cardQuery = useQuery({
    queryKey: ['safetyCard'],
    queryFn: async (): Promise<SafetyCard> => {
      const stored = await AsyncStorage.getItem(CARD_KEY);
      return stored ? JSON.parse(stored) : DEFAULT_CARD;
    },
  });

  const contacts = useMemo(() => contactsQuery.data ?? [], [contactsQuery.data]);
  const safetyCard = useMemo(() => cardQuery.data ?? DEFAULT_CARD, [cardQuery.data]);

  const saveContactsMutation = useMutation({
    mutationFn: async (updated: EmergencyContact[]) => {
      await AsyncStorage.setItem(CONTACTS_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['contacts'], data);
    },
  });

  const saveCardMutation = useMutation({
    mutationFn: async (updated: SafetyCard) => {
      await AsyncStorage.setItem(CARD_KEY, JSON.stringify(updated));
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['safetyCard'], data);
    },
  });

  const addContact = useCallback((contact: EmergencyContact) => {
    const updated = [...contacts, contact];
    saveContactsMutation.mutate(updated);
  }, [contacts, saveContactsMutation]);

  const removeContact = useCallback((id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    saveContactsMutation.mutate(updated);
  }, [contacts, saveContactsMutation]);

  const updateContact = useCallback((id: string, data: Partial<EmergencyContact>) => {
    const updated = contacts.map((c) => (c.id === id ? { ...c, ...data } : c));
    saveContactsMutation.mutate(updated);
  }, [contacts, saveContactsMutation]);

  const saveSafetyCard = useCallback((card: SafetyCard) => {
    saveCardMutation.mutate(card);
  }, [saveCardMutation]);

  const triggerSOS = useCallback(() => {
    console.log('[SOS] Triggered - starting countdown');
    setSosState({ status: 'countdown', activatedAt: null, countdownSeconds: 5 });
  }, []);

  const activateSOS = useCallback(() => {
    console.log('[SOS] Activated - sending alerts');
    setSosState({ status: 'active', activatedAt: Date.now(), countdownSeconds: 0 });
  }, []);

  const cancelSOS = useCallback(() => {
    console.log('[SOS] Cancelled');
    setSosState({ status: 'idle', activatedAt: null, countdownSeconds: 5 });
  }, []);

  const resolveSOS = useCallback(() => {
    console.log('[SOS] Resolved');
    setSosState({ status: 'resolved', activatedAt: null, countdownSeconds: 5 });
    setTimeout(() => {
      setSosState({ status: 'idle', activatedAt: null, countdownSeconds: 5 });
    }, 2000);
  }, []);

  useEffect(() => {
    if (sosState.status === 'countdown' && sosState.countdownSeconds > 0) {
      const timer = setTimeout(() => {
        setSosState((prev) => ({ ...prev, countdownSeconds: prev.countdownSeconds - 1 }));
      }, 1000);
      return () => clearTimeout(timer);
    }
    if (sosState.status === 'countdown' && sosState.countdownSeconds === 0) {
      activateSOS();
    }
  }, [sosState.status, sosState.countdownSeconds, activateSOS]);

  return {
    contacts,
    safetyCard,
    sosState,
    isLoading: contactsQuery.isLoading || cardQuery.isLoading,
    addContact,
    removeContact,
    updateContact,
    saveSafetyCard,
    triggerSOS,
    cancelSOS,
    resolveSOS,
    activateSOS,
  };
});
