import { GEMINI_MODEL } from './config';

/**
 * Daftar model yang dicoba berurutan.
 *
 * Model utama bisa dioverride lewat GEMINI_MODEL. Sisanya adalah cadangan saat
 * model utama sedang penuh (503/429) atau tidak tersedia untuk API key ini (404).
 */
export const GEMINI_MODEL_CHAIN: string[] = Array.from(
  new Set([
    GEMINI_MODEL,
    'gemini-3.8-flash',
    'gemini-3.7-flash',
    'gemini-3.1-flash-lite',
  ])
);

/**
 * Hanya error yang sifatnya sementara / model tidak tersedia yang layak
 * dicoba ulang dengan model lain. Error konfigurasi (API key salah, payload
 * invalid) langsung dilempar supaya tidak menutupi masalah sebenarnya.
 */
export function isRetryableModelError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : typeof error === 'string' ? error : JSON.stringify(error);

  return /UNAVAILABLE|high demand|overloaded|timeout|timed out|aborted|abort|fetch failed|network|ECONNRESET|ECONNREFUSED|ENOTFOUND|EAI_AGAIN|socket hang up|other side closed|terminated|NOT_FOUND|no longer available|RESOURCE_EXHAUSTED|rate limit|code":\s*(429|500|502|503|504)|status":\s*"(UNAVAILABLE|RESOURCE_EXHAUSTED|NOT_FOUND)/i.test(
    message
  );
}

const RETRY_DELAY_MS = 300;

/**
 * Menjalankan pemanggilan Gemini dengan rantai model cadangan.
 * `run` dipanggil ulang dengan nama model berikutnya jika model sebelumnya gagal.
 */
export async function withModelFallback<T>(run: (model: string) => Promise<T>): Promise<T> {
  let lastError: unknown;

  for (let index = 0; index < GEMINI_MODEL_CHAIN.length; index += 1) {
    const model = GEMINI_MODEL_CHAIN[index];

    try {
      return await run(model);
    } catch (error) {
      lastError = error;
      if (!isRetryableModelError(error)) throw error;

      const isLastModel = index === GEMINI_MODEL_CHAIN.length - 1;
      if (!isLastModel) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      }
    }
  }

  throw lastError;
}
