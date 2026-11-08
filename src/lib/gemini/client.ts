import { GoogleGenAI } from '@google/genai';

/**
 * Inisialisasi Google GenAI SDK (Server-Side Only)
 * API Key diambil dari environment variable GEMINI_API_KEY
 */
const apiKey = process.env.GEMINI_API_KEY || '';

export const getGeminiClient = () => {
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY belum diset di .env.local');
  }

  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      /**
       * Batasi satu request supaya tidak menggantung. Kalau model lambat /
       * sedang penuh, lebih cepat pindah ke model cadangan.
       */
      timeout: 25_000,
      /**
       * Retry bawaan SDK memakai exponential backoff hingga 5 percobaan dan
       * bisa terasa sangat lama di UI. Retry kita tangani sendiri lewat
       * withModelFallback() di src/lib/gemini/models.ts.
       */
      retryOptions: { attempts: 1 },
    },
  });
};
