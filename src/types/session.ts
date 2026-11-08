import type { UrgencyLevel } from './triage';

export interface SessionHistoryItem {
  id: string;
  symptomName: string;
  duration?: string;
  urgencyLevel: UrgencyLevel;
  reasoning: string;
  createdAt: string;
  doctorSummary?: {
    summary: string;
    threeQuestionsForDoctor: string[];
  };
}
