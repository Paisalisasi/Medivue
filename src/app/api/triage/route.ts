import { NextResponse } from 'next/server';
import { SymptomPayload, TriageResult } from '@/types/triage';
import { checkRedFlags } from '@/lib/rules/redFlags';
import { validateAndEnforceSafety } from '@/lib/rules/safetyLayer';
import { getGeminiClient } from '@/lib/gemini/client';
import { GEMINI_FAST_THINKING } from '@/lib/gemini/config';
import { withModelFallback } from '@/lib/gemini/models';
import { MEDIVUE_SYSTEM_PROMPT, buildTriagePrompt } from '@/lib/gemini/prompts';
import { TRIAGE_JSON_SCHEMA } from '@/lib/gemini/schemas';

export async function POST(request: Request) {
  try {
    const payload: SymptomPayload = await request.json();

    if (!payload.mainSymptom || payload.mainSymptom.trim() === '') {
      return NextResponse.json(
        { error: 'Gejala utama tidak boleh kosong' },
        { status: 400 }
      );
    }

    // 1. RULE-BASED RED FLAG CHECK (Deterministics Cut-off)
    const ruleCheck = checkRedFlags(payload);

    if (ruleCheck.hasRedFlag && ruleCheck.matchedRule) {
      const emergencyResponse: TriageResult = {
        urgencyLevel: 'darurat',
        isRedFlagTriggered: true,
        reasoning: `Gejala yang Anda laporkan cocok dengan tanda bahaya: ${ruleCheck.matchedRule.description}`,
        commonCauses: ['Kondisi darurat yang membutuhkan penanganan medis segera'],
        dangerSignsToWatch: [
          'Sesak napas semakin berat',
          'Penurunan kesadaran atau pingsan',
          'Nyeri yang semakin meluas atau tak tertahankan',
        ],
        nextSteps: [
          ruleCheck.matchedRule.action,
          'Minta bantuan orang di sekitar untuk mendampingi atau mengantar.',
          'Bawa identitas diri (KTP/BPJS) jika memungkinkan.',
        ],
        doctorSummary: {
          summary: `Pasien mengalami gejala berpotensi darurat: ${payload.mainSymptom}. Memicu tanda bahaya ${ruleCheck.matchedRule.description}.`,
          threeQuestionsForDoctor: [
            'Apakah kondisi ini memerlukan observasi rawat inap segera?',
            'Pemeriksaan penunjang (EKG/Lab/Rontgen) apa yang perlu segera dilakukan?',
            'Apa langkah pertolongan pertama selama di ruang observasi?',
          ],
        },
        calmSupport: {
          message:
            'Tarik napas perlahan. Anda mengambil langkah yang tepat dengan mencari tahu sekarang. Fokus utama sekarang adalah tiba di faskes terdekat dengan aman.',
          suggestBreathingExercise: false,
        },
        confidenceNotes: 'Terdeteksi otomatis via Rule-based Red Flag Engine.',
      };

      return NextResponse.json({ success: true, data: emergencyResponse });
    }

    // 2. GEMINI AI TRIAGE (Dengan fallback graceful bila API key belum diset)
    let aiTriageResult: TriageResult;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
      // Fallback cerdas rule-based jika user belum memasukkan Gemini API Key
      aiTriageResult = createFallbackTriageResult(payload);
    } else {
      try {
        const client = getGeminiClient();
        const response = await withModelFallback((model) =>
          client.models.generateContent({
            model,
            contents: [
              { role: 'user', parts: [{ text: buildTriagePrompt(payload) }] },
            ],
            config: {
              systemInstruction: MEDIVUE_SYSTEM_PROMPT,
              responseMimeType: 'application/json',
              responseSchema: TRIAGE_JSON_SCHEMA,
              temperature: 0.2, // Rendah untuk stabilitas & konsistensi medis
              maxOutputTokens: 1200,
              thinkingConfig: GEMINI_FAST_THINKING,
            },
          })
        );

        const rawText = response.text || '{}';
        aiTriageResult = JSON.parse(rawText) as TriageResult;
      } catch (geminiError) {
        console.error('Error memanggil Gemini API, beralih ke fallback cerdas:', geminiError);
        aiTriageResult = createFallbackTriageResult(payload);
      }
    }

    // 3. SAFETY LAYER VALIDATION
    const finalResult = validateAndEnforceSafety(aiTriageResult, ruleCheck);

    return NextResponse.json({
      success: true,
      data: finalResult,
    });
  } catch (error) {
    console.error('API /api/triage error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan dalam memproses triage' },
      { status: 500 }
    );
  }
}

/**
 * Fallback triage cerdas ketika Gemini API key belum dikonfigurasi
 */
function createFallbackTriageResult(payload: SymptomPayload): TriageResult {
  const symptomLower = payload.mainSymptom.toLowerCase();
  const isHighSeverity = payload.severity === 'berat';
  const duration = (payload.duration || '').toLowerCase();
  const isLongDuration = duration.includes('minggu') || duration.includes('bulan') || duration.includes('>3 hari');

  let level: TriageResult['urgencyLevel'] = 'pantau_di_rumah';
  let reason = 'Gejala yang Anda rasakan umumnya dapat membaik dengan istirahat yang cukup dan hidrasi teratur.';
  let causes = ['Kelelahan fisik atau stres pikiran', 'Dehidrasi / kurang minum cairan', 'Pola tidur tidak teratur'];

  if (isHighSeverity || isLongDuration) {
    level = 'segera';
    reason = 'Gejala terasa cukup mengganggu atau sudah berlangsung beberapa hari, sehingga dianjurkan diperiksa oleh dokter umum dalam 24 jam.';
    causes = ['Reaksi infeksi umum ringan-sedang', 'Ketegangan otot atau radang lokal', 'Kelelahan berlebih'];
  } else if (symptomLower.includes('demam') || symptomLower.includes('batuk') || symptomLower.includes('pusing')) {
    level = 'terjadwal';
    reason = 'Gejala umum yang lazim dialami dan biasanya memerlukan istirahat serta konsultasi bila tidak mereda dalam 2-3 hari.';
    causes = ['Infeksi virus pernapasan ringan', 'Kurang istirahat', 'Perubahan cuaca'];
  }

  return {
    urgencyLevel: level,
    reasoning: reason,
    commonCauses: causes,
    dangerSignsToWatch: [
      'Demam tinggi >39°C yang tidak turun dengan pereda demam',
      'Gejala bertambah parah secara drastis dalam 12 jam',
      'Muncul rasa lemas berlebih hingga sulit bangun',
    ],
    nextSteps: [
      'Minum air putih hangat minimal 2 liter per hari.',
      'Istirahatkan tubuh dari aktivitas layar dan tugas berat.',
      'Catat perkembangan gejala di Symptom Diary untuk memantau perbaikan.',
    ],
    doctorSummary: {
      summary: `Pasien mengeluhkan ${payload.mainSymptom} dengan durasi ${payload.duration || 'beberapa saat'}, keparahan ${payload.severity || 'sedang'}.`,
      threeQuestionsForDoctor: [
        'Berapa lama batas wajar gejala ini sebelum perlu pemeriksaan lanjutan?',
        'Apakah ada aktivitas atau makanan tertentu yang perlu saya hindari?',
        'Kapan tanda saya harus segera kembali kontrol?',
      ],
    },
    calmSupport: {
      message:
        'Kekhawatiran Anda sangat wajar, tetapi sebagian besar gejala semacam ini bisa pulih dengan waktu dan istirahat. Tarik napas perlahan, Anda sudah melakukan langkah pencegahan yang tepat.',
      suggestBreathingExercise: true,
    },
    confidenceNotes: 'Saran dihasilkan oleh Medivue Triage Engine.',
  };
}
