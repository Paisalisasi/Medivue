/**
 * Definisi Tipe Data Triage Medivue
 * Berdasarkan Konsep Desain Feedback & Arsitektur IMK (Halaman 3-5)
 */

export type UrgencyLevel = 'darurat' | 'segera' | 'terjadwal' | 'pantau_di_rumah';

export interface UrgencyMeta {
  level: UrgencyLevel;
  label: string;
  badgeColor: string;
  borderColor: string;
  bgColor: string;
  actionText: string;
  timeframe: string;
}

export interface RedFlagRule {
  id: string;
  keywords: string[];
  description: string;
  severity: 'darurat';
  action: string;
}

export interface RedFlagCheckResult {
  hasRedFlag: boolean;
  matchedRule?: RedFlagRule;
  emergencyMessage?: string;
}

export interface SymptomPayload {
  mainSymptom: string;
  duration?: string;
  severity?: 'ringan' | 'sedang' | 'berat';
  accompanyingSymptoms?: string[];
  anxietyBefore?: number; // 1-5
  ageRange?: string;
  specialConditions?: string[];
  tonePreference?: 'santai' | 'formal';
  detailPreference?: 'ringkas' | 'detail';
}

export interface TriageResult {
  urgencyLevel: UrgencyLevel;
  reasoning: string;
  commonCauses: string[];
  dangerSignsToWatch: string[];
  nextSteps: string[];
  doctorSummary: {
    summary: string;
    threeQuestionsForDoctor: string[];
  };
  calmSupport: {
    message: string;
    suggestBreathingExercise: boolean;
  };
  isRedFlagTriggered?: boolean;
  confidenceNotes?: string;
}

export interface ChatStep {
  step: number;
  id: 'main_symptom' | 'duration' | 'severity' | 'accompanying' | 'anxiety';
  question: string;
  helperText?: string;
  quickOptions?: string[];
  type: 'text' | 'options' | 'rating';
}
