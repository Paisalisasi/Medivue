/**
 * Schema JSON Output untuk Gemini Structured Output
 */

export const TRIAGE_JSON_SCHEMA = {
  type: "object",
  properties: {
    urgencyLevel: {
      type: "string",
      enum: ["darurat", "segera", "terjadwal", "pantau_di_rumah"],
    },
    reasoning: { type: "string" },
    commonCauses: {
      type: "array",
      items: { type: "string" },
    },
    dangerSignsToWatch: {
      type: "array",
      items: { type: "string" },
    },
    nextSteps: {
      type: "array",
      items: { type: "string" },
    },
    doctorSummary: {
      type: "object",
      properties: {
        summary: { type: "string" },
        threeQuestionsForDoctor: {
          type: "array",
          items: { type: "string" },
        },
      },
      required: ["summary", "threeQuestionsForDoctor"],
    },
    calmSupport: {
      type: "object",
      properties: {
        message: { type: "string" },
        suggestBreathingExercise: { type: "boolean" },
      },
      required: ["message", "suggestBreathingExercise"],
    },
  },
  required: [
    "urgencyLevel",
    "reasoning",
    "commonCauses",
    "dangerSignsToWatch",
    "nextSteps",
    "doctorSummary",
    "calmSupport",
  ],
};
