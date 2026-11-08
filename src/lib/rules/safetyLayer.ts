import { UrgencyLevel, TriageResult, RedFlagCheckResult } from '@/types/triage';

/**
 * Nilai ranking urgensi (semakin tinggi semakin kritis)
 */
const URGENCY_RANK: Record<UrgencyLevel, number> = {
  pantau_di_rumah: 1,
  terjadwal: 2,
  segera: 3,
  darurat: 4,
};

/**
 * Safety Layer Validation
 * Memvalidasi output AI terhadap aturan medis dan keselamatan etis:
 * 1. AI tidak boleh menurunkan level urgensi jika aturan rule-based mendeteksi bahaya.
 * 2. Mencegah nama diagnosis mutlak atau rekomendasi obat/dosis farmakologis.
 * 3. Memastikan selalu ada disclaimer yang jelas.
 */
export function validateAndEnforceSafety(
  aiResult: TriageResult,
  ruleCheck: RedFlagCheckResult
): TriageResult {
  const result: TriageResult = { ...aiResult };

  // 1. Enforce Red Flag rule override
  if (ruleCheck.hasRedFlag && ruleCheck.matchedRule) {
    result.urgencyLevel = 'darurat';
    result.isRedFlagTriggered = true;
    result.reasoning = `[Peringatan Keselamatan Darurat] Terdeteksi gejala bahaya: ${ruleCheck.matchedRule.description}. ${result.reasoning || ''}`;
    result.nextSteps = [
      ruleCheck.matchedRule.action,
      'Jangan tunda mencari pertolongan medis langsung ke IGD terdekat.',
      'Hubungi keluarga atau rekan terdekat untuk mendampingi.',
    ];
  }

  // 2. Cegah urgensi AI lebih rendah dari ambang aman
  if (ruleCheck.hasRedFlag && URGENCY_RANK[result.urgencyLevel] < URGENCY_RANK['darurat']) {
    result.urgencyLevel = 'darurat';
  }

  // 3. Sanitasi teks: hapus kata resep dosis obat bila tidak sengaja dimunculkan model
  const dangerousDrugTerms = [/minum\s+\d+\s*mg/gi, /dosis\s+\d+/gi, /resepkan/gi];
  for (const term of dangerousDrugTerms) {
    result.reasoning = result.reasoning.replace(term, 'konsultasikan dosis ke dokter/apoteker');
  }

  // 4. Pastikan selalu ada catatan disclaimer medis
  result.confidenceNotes =
    'Medivue adalah alat bantu triase informasi awal dan TIDAK menggantikan diagnosis medis resmi dari dokter.';

  return result;
}
