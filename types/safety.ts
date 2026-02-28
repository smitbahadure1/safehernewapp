export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
  avatar?: string;
}

export interface SafetyCard {
  fullName: string;
  bloodGroup: string;
  allergies: string;
  medications: string;
  medicalConditions: string;
  dateOfBirth: string;
  address: string;
}

export interface SafetyTimerConfig {
  duration: number;
  isActive: boolean;
  startedAt: number | null;
  message: string;
}

export type SOSStatus = 'idle' | 'countdown' | 'active' | 'resolved';

export interface SOSState {
  status: SOSStatus;
  activatedAt: number | null;
  countdownSeconds: number;
}
