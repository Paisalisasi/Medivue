import { NextResponse } from 'next/server';
import { ChatStep } from '@/types/triage';
import { getGeminiClient } from '@/lib/gemini/client';
import { GEMINI_FAST_THINKING, MAX_CHAT_HISTORY } from '@/lib/gemini/config';
import { withModelFallback } from '@/lib/gemini/models';
import { buildChatSystemInstruction } from '@/lib/gemini/prompts';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequestBody {
  messages: ChatMessage[];
  triageContext?: {
    mainSymptom?: string;
    duration?: string;
    severity?: string;
    accompanyingSymptoms?: string[];
    urgencyLevel?: string;
    reasoning?: string;
    nextSteps?: string[];
  };
}

/**
 * GET: Mengembalikan langkah onboarding triase awal (5 pilar)
 */
export async function GET() {
  const steps: ChatStep[] = [
    {
      step: 1,
      id: 'main_symptom',
      question: 'Apa gejala atau keluhan utama yang paling Anda rasakan saat ini?',
      helperText: 'Ceritakan dengan kata-kata santai, atau pilih gejala umum di bawah.',
      quickOptions: ['Sakit Kepala', 'Demam', 'Batuk & Pilek', 'Nyeri Perut', 'Pusing / Kleyengan', 'Mual'],
      type: 'text',
    },
    {
      step: 2,
      id: 'duration',
      question: 'Sudah berapa lama gejala tersebut Anda rasakan?',
      helperText: 'Durasi membantu menentukan seberapa cepat langkah penanganan yang dibutuhkan.',
      quickOptions: ['Baru beberapa jam', '1 - 2 hari', '3 - 5 hari', 'Lebih dari 1 minggu'],
      type: 'options',
    },
    {
      step: 3,
      id: 'severity',
      question: 'Seberapa besar gejala ini mengganggu aktivitas sehari-hari Anda?',
      helperText: 'Pilih tingkat keparahan yang paling menggambarkan kondisi Anda saat ini.',
      quickOptions: [
        'Ringan (masih bisa beraktivitas biasa)',
        'Sedang (cukup mengganggu, butuh istirahat sesekali)',
        'Berat (sangat mengganggu, sulit beraktivitas)',
      ],
      type: 'options',
    },
    {
      step: 4,
      id: 'accompanying',
      question: 'Apakah ada gejala lain yang menyertai keluhan Anda?',
      helperText: 'Tuliskan gejala tambahan jika ada, atau pilih jika tidak ada.',
      quickOptions: ['Tidak ada gejala lain', 'Lemas / lesu', 'Nafsu makan turun', 'Nyeri otot / pegal', 'Sulit tidur'],
      type: 'text',
    },
    {
      step: 5,
      id: 'anxiety',
      question: 'Sebelum melihat hasil, seberapa cemas yang Anda rasakan terkait kondisi ini? (Skala 1 - 5)',
      helperText: '1 = Sangat tenang, 5 = Sangat cemas / overthinking.',
      quickOptions: ['1 - Tenang', '2 - Sedikit khawatir', '3 - Cukup cemas', '4 - Cemas tinggi', '5 - Sangat panik'],
      type: 'rating',
    },
  ];

  return NextResponse.json({ success: true, steps });
}

/**
 * POST: Endpoint percakapan interaktif lanjutan dengan Medivue AI Companion
 */
export async function POST(request: Request) {
  try {
    const body: ChatRequestBody = await request.json();
    const { messages, triageContext } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Pesan percakapan tidak boleh kosong' },
        { status: 400 }
      );
    }

    const latestMessage = messages[messages.length - 1];
    const userPrompt = latestMessage.content?.trim();
    if (!userPrompt) {
      return NextResponse.json(
        { error: 'Pesan percakapan tidak boleh kosong' },
        { status: 400 }
      );
    }

    const history = messages
      .slice(0, messages.length - 1)
      .filter((message) => message.content?.trim())
      .slice(-MAX_CHAT_HISTORY);

    const apiKey = process.env.GEMINI_API_KEY;
    const isApiKeyConfigured = apiKey && apiKey !== 'your_gemini_api_key_here' && apiKey.length > 10;

    // 1. Jika API Key Gemini sudah terpasang, panggil Gemini API
    if (isApiKeyConfigured) {
      try {
        const client = getGeminiClient();
        const systemInstruction = buildChatSystemInstruction(triageContext);

        // Format riwayat chat untuk Gemini SDK. Markdown dari pesan lama
        // dinormalisasi agar model tidak meniru format mentah tersebut.
        const contents = [
          ...history.map((m) => ({
            role: m.role === 'user' ? 'user' : 'model',
            parts: [
              {
                text: m.role === 'assistant' ? toPlainText(m.content) : m.content.trim(),
              },
            ],
          })),
          {
            role: 'user',
            parts: [{ text: userPrompt }],
          },
        ];

        // Jawaban diambil utuh dulu (bukan streaming) supaya kalau model
        // sedang penuh di tengah generasi, kita bisa mencoba model cadangan
        // tanpa pengguna melihat jawaban yang terpotong.
        const response = await withModelFallback((model) =>
          client.models.generateContent({
            model,
            contents,
            config: {
              systemInstruction,
              temperature: 0.45,
              maxOutputTokens: 900,
              thinkingConfig: GEMINI_FAST_THINKING,
            },
          })
        );

        let rawReply = '';
        try {
          rawReply = response.text ?? '';
        } catch (textError) {
          console.warn('Gagal membaca teks jawaban Gemini:', textError);
        }

        const reply = toPlainText(rawReply).trim();
        if (!reply) {
          console.warn('Gemini mengembalikan jawaban kosong:', {
            finishReason: response.candidates?.[0]?.finishReason,
            promptFeedback: response.promptFeedback,
          });
          throw new Error('Gemini mengembalikan jawaban kosong');
        }

        return new Response(reply, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-AI-Provider': 'gemini',
          },
        });
      } catch (geminiError) {
        console.warn('Gagal memanggil Gemini API live, beralih ke Fallback Asisten Medis Medivue:', geminiError);
        // Fallback cerdas jika ada kendala jaringan / kuota
        const fallbackReply = toPlainText(generateFallbackChatReply(userPrompt, triageContext));
        return new Response(fallbackReply, {
          headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'no-cache, no-transform',
            'X-AI-Provider': 'fallback',
          },
        });
      }
    }

    // 2. Jika API Key belum dikonfigurasi, gunakan Asisten Cerdas Medivue (Simulasi Handal)
    const fallbackReply = toPlainText(generateFallbackChatReply(userPrompt, triageContext));
    return new Response(fallbackReply, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'X-AI-Provider': 'fallback',
      },
    });
  } catch (error) {
    console.error('API /api/chat error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan sistem saat memproses chat' },
      { status: 500 }
    );
  }
}

/**
 * Mesin respons cerdas kontekstual ketika Gemini API Key belum dipasang
 */
function generateFallbackChatReply(
  prompt: string,
  context?: ChatRequestBody['triageContext']
): string {
  const p = prompt.toLowerCase();
  const symptom = context?.mainSymptom || 'keluhan kamu';
  const duration = context?.duration || 'beberapa hari';
  const severity = context?.severity || 'sedang';
  const urgency = context?.urgencyLevel || 'pantau_di_rumah';

  // 1. Takut penyakit serius (kanker, tumor, jantung, dll.)
  if (
    ['kanker', 'tumor', 'jantung', 'stroke', 'hiv', 'aids', 'gagal ginjal'].some(
      (keyword) => p.includes(keyword)
    )
  ) {
    return `Wajar banget kalau kamu kepikiran ke arah situ, dan aku nggak akan nyepelein rasa takut kamu. Cuma, dari cerita dan triase awal tadi, keluhan ${symptom} yang kamu alami (${duration}, ${severity}) masih tergolong ${urgency === 'pantau_di_rumah' ? 'ringan dan aman untuk dipantau dulu di rumah' : 'perlu diperiksa lebih lanjut'}.

Yang paling sering bikin gejala seperti ini justru hal-hal biasa: kurang tidur, kelelahan, stres, dehidrasi, atau infeksi ringan. Aku nggak bisa memastikan ada atau nggaknya penyakit tertentu lewat chat, dan kamu juga sebaiknya nggak mendiagnosis diri sendiri dari internet.

Yang bisa kamu lakukan sekarang:
1. Tarik napas pelan 4 detik, tahan 4 detik, buang 4 detik. Ulangi 5 kali.
2. Catat gejala yang kamu rasakan supaya lebih gampang dijelaskan ke dokter.
3. Kalau cemasnya masih mengganggu atau gejala menetap, cek ke dokter umum biar dapat kepastian, bukan sekadar dugaan.

Mau aku temani latihan pernapasan sebentar biar lebih tenang?`;
  }

  // 2. Topik makanan / minuman / pantangan
  if (p.includes('makan') || p.includes('minum') || p.includes('pantang') || p.includes('kopi')) {
    return `Soal asupan saat kamu mengalami ${symptom}:

Yang disarankan:
• Air putih hangat yang cukup, sedikit-sedikit tapi sering.
• Makanan lembut seperti sup, bubur, atau buah yang banyak airnya.

Yang sebaiknya dibatasi dulu:
• Kopi kental, minuman berenergi, dan soda.
• Makanan yang terlalu pedas, berminyak, atau asam.

Kalau mual, makan dalam porsi kecil tapi lebih sering ya. Kamu lagi pengin makan apa sekarang?`;
  }

  // 3. Topik obat
  if (p.includes('obat') || p.includes('parasetamol') || p.includes('panadol') || p.includes('resep')) {
    return `Untuk ${symptom} yang ringan, obat bebas seperti parasetamol boleh dipakai sesuai aturan di kemasan, sesudah makan.

Yang perlu dihindari:
• Antibiotik atau obat resep tanpa anjuran dokter.
• Menggabung beberapa obat yang kandungannya sama.

Kalau kamu punya alergi obat, masalah lambung, atau sedang hamil/menyusui, tanya apoteker dulu ya. Lagi mempertimbangkan obat tertentu?`;
  }

  // 4. Kapan ke dokter / tanda bahaya
  if (p.includes('dokter') || p.includes('igd') || p.includes('rumah sakit') || p.includes('bahaya') || p.includes('parah')) {
    return `Untuk ${symptom} yang sudah ${duration}, sebaiknya ke dokter kalau muncul tanda ini:

• Gejala makin berat atau nggak membaik setelah 2-3 hari.
• Demam tinggi di atas 38,5°C yang sulit turun.
• Sesak napas, nyeri dada menjalar, pusing berat, atau muntah terus-menerus.
• Lemas ekstrem sampai sulit beraktivitas.

Kalau kamu ragu, cek ke Puskesmas atau klinik terdekat itu langkah yang bagus. Mau aku bantu susun hal-hal yang perlu kamu sampaikan ke dokter?`;
  }

  // 5. Cemas / overthinking umum
  if (p.includes('takut') || p.includes('cemas') || p.includes('panik') || p.includes('overthinking')) {
    return `Wajar kok merasa cemas saat tubuh ngasih sinyal aneh. Justru kamu sudah ambil langkah bagus dengan mengecek triase dulu, bukan langsung self-diagnosis.

Beberapa hal yang bisa bantu:
1. Ingat bahwa ${symptom} paling sering muncul karena kelelahan, kurang tidur, stres, atau dehidrasi.
2. Kurangi scroll informasi gejala untuk sementara, karena itu sering bikin makin panik.
3. Coba tarik napas 4-4-4 selama 2 menit.

Aku di sini buat nemenin, tapi kalau cemasnya berat dan berkepanjangan, ngobrol dengan dokter atau tenaga profesional tetap pilihan terbaik. Mau coba latihan napas dulu?`;
  }

  // 6. Pertolongan pertama / perawatan di rumah
  if (p.includes('pertolongan') || p.includes('ngapain') || p.includes('cara mengatasi') || p.includes('tips') || p.includes('istirahat')) {
    return `Langkah awal untuk ${symptom}:

1. Istirahat di ruangan tenang dan redup, kurangi layar gadget sebentar.
2. Minum air putih hangat secara berkala.
3. Kompres hangat atau dingin di area yang tidak nyaman.
4. Catat perubahan gejala dalam 12-24 jam ke depan.

Kalau setelah istirahat gejalanya makin berat, jangan dipaksa ya, langsung cek ke dokter. Ada yang masih mengganggu?`;
  }

  // 7. Respons umum
  return `Aku paham ${symptom} yang kamu rasakan sejak ${duration} itu bikin nggak nyaman.

Yang bisa dicoba dulu:
• Istirahat cukup dan minum air putih lebih sering.
• Kurangi aktivitas berat dan layar gadget sementara.
• Pantau apakah gejalanya membaik dalam 1-2 hari.

Kalau makin parah atau kamu merasa cemas berlebihan, cek ke dokter umum biar lebih tenang. Ada hal spesifik yang mau kamu tanyakan soal ${symptom}?`;
}

/**
 * Normalisasi markdown ringan menjadi teks biasa.
 *
 * Dipakai untuk pesan lama yang dikirim kembali ke model dan untuk fallback,
 * supaya simbol seperti **, ##, atau *** tidak pernah tampil mentah di UI.
 */
function toPlainText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/^\s{0,3}#{1,6}\s*/gm, '')
    .replace(/^\s*>\s?/gm, '')
    .replace(/\*\*\*(.+?)\*\*\*/g, '$1')
    .replace(/___(.+?)___/g, '$1')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(^|[^*])\*([^*\n]+)\*(?!\*)/g, '$1$2')
    .replace(/(^|[^_])_([^_\n]+)_(?!_)/g, '$1$2')
    .replace(/\*{2,}/g, '')
    .replace(/^\s*[-*]\s+/gm, '• ')
    .replace(/[ \t]+\n/g, '\n')
    .trim();
}
