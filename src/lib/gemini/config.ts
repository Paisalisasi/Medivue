/**
 * Konfigurasi Gemini terpusat.
 *
 * Satu model dipakai di seluruh route agar perilaku konsisten. Bisa dioverride
 * lewat GEMINI_MODEL jika ingin memakai model lain tanpa mengubah kode.
 */
export const GEMINI_MODEL =
  process.env.GEMINI_MODEL?.trim() || 'gemini-3.5-flash';

/**
 * Thinking dimatikan untuk percakapan agar jawaban terasa lebih cepat.
 * Triase tetap memakai structured output sehingga hasilnya stabil.
 */
export const GEMINI_FAST_THINKING = { thinkingBudget: 0 } as const;

/** Batas riwayat yang dikirim ulang supaya prompt tidak membengkak. */
export const MAX_CHAT_HISTORY = 12;
