export interface DoctorLetterData {
  documentId: string;
  generatedAt: string;
  patientOverview: {
    mainSymptom: string;
    duration: string;
    severity: string;
    accompanyingSymptoms: string[];
    urgencyLevel: string;
    urgencyLabel: string;
  };
  clinicalSummary: string;
  chatInsights: string[];
  dangerSignsToWatch: string[];
  homeCareTried: string[];
  suggestedQuestionsForDoctor: string[];
  doctorNoteClosing: string;
}
