'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import type { SymptomPayload, TriageResult, UrgencyLevel } from '@/types/triage';
import {
  Send,
  Sparkles,
  Bot,
  User as UserIcon,
  Loader2,
  RotateCcw,
  AlertTriangle,
  HeartPulse,
  FileCheck2,
  ShieldAlert,
  CalendarCheck,
  Home,
  Clock,
  ArrowLeft,
  ChevronRight,
} from 'lucide-react';
import DoctorLetterModal from './DoctorLetterModal';
import BreathingExercise from '@/components/organisms/calm/BreathingExercise';
import RedFlagAlert from '@/components/molecules/triage/RedFlagAlert';
import Logo from '@/components/atoms/brand/Logo';
import { URGENCY_META } from '@/lib/urgency';
import type { DoctorLetterData } from '@/types/letter';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Props {
  result: TriageResult;
  formData: SymptomPayload;
  onReset: () => void;
}

const SUGGESTED_QUESTIONS = [
  'Apa pertolongan pertama yang bisa saya lakukan?',
  'Makanan & minuman apa yang dianjurkan?',
  'Kapan tanda bahaya yang harus segera ke dokter?',
  'Bolehkah minum obat pereda nyeri/demam bebas?',
  'Bagaimana agar tidak cemas dan overthinking?',
];

function UrgencyIcon({ level }: { level: UrgencyLevel }) {
  switch (level) {
    case 'darurat': return <ShieldAlert className="h-5 w-5 text-danger" />;
    case 'segera': return <AlertTriangle className="h-5 w-5 text-warning" />;
    case 'terjadwal': return <CalendarCheck className="h-5 w-5 text-brand-600" />;
    default: return <Home className="h-5 w-5 text-success" />;
  }
}

export default function InteractiveAiChat({ result, formData, onReset }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasResponseStarted, setHasResponseStarted] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [doctorLetter, setDoctorLetter] = useState<DoctorLetterData | null>(null);
  const [isLiveAI, setIsLiveAI] = useState<boolean | null>(null);
  const [sidebarTab, setSidebarTab] = useState<'triase' | 'napas'>('triase');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const meta = URGENCY_META[result.urgencyLevel] ?? URGENCY_META.pantau_di_rumah;

  // Beri tahu ShellLayout/FAB bahwa sesi tanya jawab AI sedang aktif,
  // supaya Navbar/Footer/BottomNav disembunyikan dan posisi FAB digeser.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('medivue:ai-chat', { detail: { active: true } }));
    return () => {
      window.dispatchEvent(new CustomEvent('medivue:ai-chat', { detail: { active: false } }));
    };
  }, []);

  // Pesan sambutan awal
  useEffect(() => {
    const welcome = `Halo! Saya **Medivue AI Companion** 🌿

Saya sudah menerima dan menganalisis keluhan **${formData.mainSymptom}** Anda (durasi: ${formData.duration || 'beberapa hari'}, intensitas: ${formData.severity || 'sedang'}).

**Hasil Penilaian Awal:** Status Anda — **${meta.label}**.
${result.reasoning}

**Langkah Awal yang Disarankan:**
${result.nextSteps?.map((s, i) => `${i + 1}. ${s}`).join('\n')}

${result.calmSupport?.message ? `💡 *${result.calmSupport.message}*` : ''}

Silakan tanyakan apa saja yang masih membuat Anda khawatir. Setelah selesai, klik **"Akhiri & Surat Dokter"** untuk mendapatkan lembar rangkuman resmi bagi dokter.`;

    setMessages([
      {
        id: 'msg-init',
        role: 'assistant',
        content: welcome,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  }, [formData, result, meta]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const next = [...messages, userMsg];
    setMessages(next);
    setInputText('');
    setIsLoading(true);
    setHasResponseStarted(false);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
          triageContext: {
            mainSymptom: formData.mainSymptom,
            duration: formData.duration,
            severity: formData.severity,
            accompanyingSymptoms: formData.accompanyingSymptoms,
            urgencyLevel: result.urgencyLevel,
            reasoning: result.reasoning,
            nextSteps: result.nextSteps,
            doctorSummary: result.doctorSummary,
          },
        }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => null);
        throw new Error(error?.error || 'Gagal mendapat respons AI');
      }

      const isGemini = res.headers.get('x-ai-provider') === 'gemini';
      setIsLiveAI(isGemini);
      if (!res.body) throw new Error('Respons AI kosong');

      const assistantId = `msg-${Date.now()}-ai`;
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      let streamedText = '';
      setMessages((prev) => [...prev, { id: assistantId, role: 'assistant', content: '', timestamp }]);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        if (value?.length) setHasResponseStarted(true);
        streamedText += decoder.decode(value, { stream: true });
        setMessages((prev) => prev.map((message) =>
          message.id === assistantId ? { ...message, content: streamedText } : message
        ));
      }
      streamedText += decoder.decode();
      if (streamedText) {
        setMessages((prev) => prev.map((message) =>
          message.id === assistantId ? { ...message, content: streamedText } : message
        ));
      }
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : 'Gangguan jaringan';
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: 'assistant',
          content: `Maaf, terjadi kendala: ${errText}. Pastikan tubuh Anda beristirahat cukup dan coba kirim ulang pertanyaan.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsLoading(false);
      setHasResponseStarted(false);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  };

  const handleEndChat = async () => {
    setIsGeneratingLetter(true);
    try {
      const res = await fetch('/api/chat/letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: messages.map((m) => ({ role: m.role, content: m.content })),
          triageContext: {
            mainSymptom: formData.mainSymptom,
            duration: formData.duration,
            severity: formData.severity,
            accompanyingSymptoms: formData.accompanyingSymptoms,
            urgencyLevel: result.urgencyLevel,
            reasoning: result.reasoning,
            nextSteps: result.nextSteps,
            doctorSummary: result.doctorSummary,
          },
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Gagal membuat surat');
      setDoctorLetter(json.letter);
    } catch (err) {
      console.error('Letter gen error:', err);
      const now = new Date();
      setDoctorLetter({
        documentId: `TC-${now.getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`,
        generatedAt: now.toLocaleString('id-ID'),
        patientOverview: {
          mainSymptom: formData.mainSymptom,
          duration: formData.duration || 'Beberapa saat',
          severity: formData.severity || 'sedang',
          accompanyingSymptoms: formData.accompanyingSymptoms || [],
          urgencyLevel: result.urgencyLevel,
          urgencyLabel: meta.label,
        },
        clinicalSummary: `Pasien mengalami ${formData.mainSymptom} selama ${formData.duration || 'beberapa hari'}, keparahan ${formData.severity || 'sedang'}. Telah dilakukan pemilahan triase dan konsultasi awal via Medivue.`,
        chatInsights: [
          `Keluhan utama: ${formData.mainSymptom}`,
          `Durasi: ${formData.duration || 'Beberapa hari'}`,
          `Tingkat urgensi: ${meta.label}`,
        ],
        dangerSignsToWatch: [
          'Peningkatan intensitas rasa sakit signifikan',
          'Sesak napas atau demam tinggi berkelanjutan',
        ],
        homeCareTried: ['Istirahat fisik & hidrasi', 'Pemantauan harian tanda eskalasi gejala'],
        suggestedQuestionsForDoctor: [
          'Apakah perlu pemeriksaan laboratorium atau diagnostik penunjang?',
          'Kapan batas aman gejala ini mereda?',
          'Adakah pantangan aktivitas atau makanan?',
        ],
        doctorNoteClosing: 'Catatan mandiri pasien disusun oleh Medivue AI Companion.',
      });
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  // Render teks asisten dengan parser ringan. Tujuannya bukan markdown penuh,
  // tapi memastikan simbol seperti **, ***, dan ## tidak pernah tampil mentah.
  const renderInline = (text: string, keyPrefix: string) => {
    const tokens = text.split(
      /(\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|__[^_]+__|`[^`]+`|\*[^*]+\*|_[^_]+_)/g
    );

    return tokens
      .filter((token) => token !== '')
      .map((token, index) => {
        const key = `${keyPrefix}-${index}`;

        if (token.startsWith('***') && token.endsWith('***')) {
          return (
            <strong key={key} className="font-semibold text-slate-900">
              {token.slice(3, -3)}
            </strong>
          );
        }
        if (token.startsWith('**') && token.endsWith('**')) {
          return (
            <strong key={key} className="font-semibold text-slate-900">
              {token.slice(2, -2)}
            </strong>
          );
        }
        if (token.startsWith('__') && token.endsWith('__')) {
          return (
            <strong key={key} className="font-semibold text-slate-900">
              {token.slice(2, -2)}
            </strong>
          );
        }
        if (token.startsWith('`') && token.endsWith('`')) {
          return (
            <code key={key} className="rounded bg-slate-100 px-1.5 py-0.5 text-[12px] text-slate-700">
              {token.slice(1, -1)}
            </code>
          );
        }
        if (token.startsWith('*') && token.endsWith('*')) {
          return (
            <em key={key} className="italic text-slate-700">
              {token.slice(1, -1)}
            </em>
          );
        }
        if (token.startsWith('_') && token.endsWith('_')) {
          return (
            <em key={key} className="italic text-slate-700">
              {token.slice(1, -1)}
            </em>
          );
        }

        // Bersihkan sisa penanda yang tidak berpasangan (mis. saat streaming).
        return (
          <React.Fragment key={key}>
            {token.replace(/\*{2,}/g, '').replace(/^#{1,6}\s*/, '')}
          </React.Fragment>
        );
      });
  };

  const renderContent = (content: string) => {
    const lines = content.split('\n');
    return (
      <div className="space-y-1.5 text-sm leading-relaxed">
        {lines.map((line, idx) => {
          const trimmed = line.replace(/\r$/, '').trim();
          if (!trimmed) return <div key={idx} className="h-1.5" />;

          // Garis pemisah: ---, ***, ___
          if (/^([-*_])\1{2,}$/.test(trimmed)) {
            return <hr key={idx} className="my-2 border-slate-200" />;
          }

          // Heading markdown: ## Judul, ### **Judul**
          const heading = trimmed.match(/^(#{1,6})\s+(.*)$/);
          if (heading) {
            return (
              <p key={idx} className="pt-2 text-[13px] font-bold uppercase tracking-wide text-brand-700 first:pt-0">
                {renderInline(heading[2].trim(), `h-${idx}`)}
              </p>
            );
          }

          const body = trimmed;

          // Bullet: - teks, * teks, • teks
          const bullet = body.match(/^([-*•])\s+(.*)$/);
          if (bullet) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="mt-[0.15rem] shrink-0 text-xs font-bold text-brand-600">•</span>
                <span className="min-w-0">{renderInline(bullet[2], `b-${idx}`)}</span>
              </div>
            );
          }

          // Daftar bernomor: 1. teks, 1) teks
          const numbered = body.match(/^(\d+)[.)]\s+(.*)$/);
          if (numbered) {
            return (
              <div key={idx} className="flex items-start gap-2 pl-1">
                <span className="mt-[0.05rem] shrink-0 text-xs font-bold text-brand-500">
                  {numbered[1]}.
                </span>
                <span className="min-w-0">{renderInline(numbered[2], `n-${idx}`)}</span>
              </div>
            );
          }

          // Kutipan: > teks
          const quote = body.match(/^>\s?(.*)$/);
          if (quote) {
            return (
              <p key={idx} className="border-l-2 border-brand-300 pl-3 text-slate-600">
                {renderInline(quote[1], `q-${idx}`)}
              </p>
            );
          }

          return <p key={idx}>{renderInline(body, `p-${idx}`)}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-slate-100">

      {/* ══════════════════════════════════════════
          SIDEBAR KIRI — Info Triase
      ══════════════════════════════════════════ */}
      <aside className="hidden lg:flex flex-col w-80 xl:w-96 shrink-0 border-r border-slate-200 bg-white overflow-y-auto">

        {/* Sidebar Header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2 text-slate-500 hover:text-brand-500 transition text-xs mb-4">
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dashboard
          </Link>
          <div className="flex justify-center py-1">
            <Link
              href="/dashboard"
              aria-label="Kembali ke dashboard"
              title="Kembali ke dashboard"
              className="inline-flex rounded-lg transition hover:opacity-80"
            >
              <Logo size="lg" />
            </Link>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-100 shrink-0">
          <button
            type="button"
            onClick={() => setSidebarTab('triase')}
            className={`flex-1 py-2.5 text-xs font-semibold transition ${
              sidebarTab === 'triase'
                ? 'text-brand-500 border-b-2 border-brand-500'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Rincian Triase
          </button>
          <button
            type="button"
            onClick={() => setSidebarTab('napas')}
            className={`flex-1 py-2.5 text-xs font-semibold transition ${
              sidebarTab === 'napas'
                ? 'text-brand-700 border-b-2 border-brand-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Relaksasi Napas
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto">
          {sidebarTab === 'triase' ? (
            <div className="p-4 space-y-4">

              {/* Urgency Badge */}
              <div className={`rounded-xl p-4 ${meta.bgColor} border ${meta.borderColor}`}>
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white shadow-xs">
                    <UrgencyIcon level={result.urgencyLevel} />
                  </div>
                  <div>
                    <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase ${meta.badgeColor}`}>
                      {meta.label}
                    </span>
                    <p className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {meta.timeframe}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-slate-700 font-medium bg-white/80 rounded-lg px-3 py-2">
                  {meta.actionText}
                </p>
              </div>

              {/* Keluhan Pasien */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
                <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wide">Keluhan Pasien</p>
                <div className="space-y-1.5 text-xs text-slate-700">
                  <p><span className="text-slate-400">Gejala:</span> <strong>{formData.mainSymptom}</strong></p>
                  {formData.duration && <p><span className="text-slate-400">Durasi:</span> {formData.duration}</p>}
                  {formData.severity && <p><span className="text-slate-400">Keparahan:</span> {formData.severity}</p>}
                  {formData.accompanyingSymptoms && formData.accompanyingSymptoms.length > 0 && (
                    <p><span className="text-slate-400">Gejala penyerta:</span> {formData.accompanyingSymptoms.join(', ')}</p>
                  )}
                </div>
              </div>

              {/* Alasan */}
              <div>
                <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wide mb-1.5">Analisis AI</p>
                <p className="text-xs text-slate-600 leading-relaxed bg-white border border-slate-200 rounded-xl p-3">
                  {result.reasoning}
                </p>
              </div>

              {/* Langkah Berikutnya */}
              {result.nextSteps && result.nextSteps.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase text-slate-400 tracking-wide mb-1.5">Langkah Berikutnya</p>
                  <div className="space-y-1.5">
                    {result.nextSteps.map((step, i) => (
                      <div key={i} className="flex items-start gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700">
                        <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface text-[10px] font-bold text-brand-500 mt-0.5">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tanda Bahaya */}
              {result.dangerSignsToWatch && result.dangerSignsToWatch.length > 0 && (
                <div>
                  <p className="text-[11px] font-bold uppercase text-danger tracking-wide mb-1.5 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Tanda Bahaya
                  </p>
                  <ul className="space-y-1 rounded-xl bg-danger-soft border border-danger-line p-3 text-xs text-danger-strong">
                    {result.dangerSignsToWatch.map((sign, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-danger shrink-0" />
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Calm Support */}
              {result.calmSupport?.message && (
                <div className="rounded-xl border border-brand-100 bg-brand-50 p-3 text-xs text-brand-900 flex items-start gap-2">
                  <span className="text-base shrink-0">🌿</span>
                  <p className="leading-relaxed">{result.calmSupport.message}</p>
                </div>
              )}

              {/* Engine info */}
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-brand-500" />
                {isLiveAI === true
                  ? 'Medivue AI · mode langsung'
                  : isLiveAI === false
                    ? 'Medivue AI · mode pendamping'
                    : 'Medivue AI'}
              </div>
            </div>
          ) : (
            <div className="p-4">
              <BreathingExercise />
            </div>
          )}
        </div>

        {/* Sidebar Footer Buttons */}
        <div className="shrink-0 border-t border-slate-100 p-4 space-y-2">
          <button
            type="button"
            onClick={handleEndChat}
            disabled={isGeneratingLetter}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50 transition shadow-sm"
          >
            {isGeneratingLetter ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Menyusun Surat...</>
            ) : (
              <><FileCheck2 className="h-4 w-4" />Akhiri & Buat Surat Dokter</>
            )}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Gejala Baru
          </button>
        </div>
      </aside>

      {/* ══════════════════════════════════════════
          CHAT PANEL KANAN — Full Height
      ══════════════════════════════════════════ */}
      <div className="flex flex-1 flex-col overflow-hidden">

        {/* Chat Top Bar */}
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shrink-0">
          {/* Mobile: Back + brand */}
          <div className="flex items-center gap-3 min-w-0">
            <Link
              href="/dashboard"
              className="flex lg:hidden items-center justify-center h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 transition shrink-0"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>

            <Link
              href="/dashboard"
              aria-label="Medivue — kembali ke dashboard"
              title="Kembali ke dashboard"
              className="flex items-center gap-2.5 min-w-0 rounded-lg transition hover:opacity-80"
            >
              <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-500 to-brand-700 text-white shadow-sm">
                <Bot className="h-5 w-5" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success border-2 border-white" />
                </span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900 text-sm truncate">Medivue AI Companion</p>
                  <span className={`hidden sm:inline-block shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${meta.badgeColor}`}>
                    {meta.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {formData.mainSymptom} • {formData.severity ?? 'sedang'} •{' '}
                  <span className="text-brand-500 font-semibold">
                    {isLiveAI === null ? 'Medivue AI' : isLiveAI ? 'AI aktif' : 'Mode pendamping'}
                  </span>
                </p>
              </div>
            </Link>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Mobile: Akhiri & Surat */}
            <button
              type="button"
              onClick={handleEndChat}
              disabled={isGeneratingLetter}
              className="flex items-center gap-1.5 rounded-xl bg-brand-500 px-3 py-2 text-xs font-bold text-white hover:bg-brand-700 disabled:opacity-50 transition"
            >
              {isGeneratingLetter
                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                : <FileCheck2 className="h-3.5 w-3.5" />
              }
              <span className="hidden sm:inline">Akhiri & Surat Dokter</span>
              <span className="sm:hidden">Surat</span>
            </button>
          </div>
        </div>

        {/* Ringkasan triase ringkas untuk mobile */}
        <div className="shrink-0 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
              <span className="flex min-w-0 items-center gap-2">
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${meta.badgeColor}`}>
                  {meta.label}
                </span>
                <span className="truncate text-[11px] text-slate-500">{meta.actionText}</span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-slate-400 transition group-open:rotate-90" />
            </summary>

            <div className="mt-3 space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Analisis</p>
                <p className="mt-1 text-xs leading-5 text-slate-700">{result.reasoning}</p>
              </div>
              {result.nextSteps && result.nextSteps.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Langkah berikutnya</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-slate-700">
                    {result.nextSteps.slice(0, 3).map((step, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-warning" />
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {result.dangerSignsToWatch && result.dangerSignsToWatch.length > 0 && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-danger">Tanda bahaya</p>
                  <ul className="mt-1.5 space-y-1 text-xs text-danger-strong">
                    {result.dangerSignsToWatch.slice(0, 3).map((sign, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-danger" />
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </details>
        </div>

        {/* Red Flag Alert */}
        {result.isRedFlagTriggered && (
          <div className="px-4 py-3 bg-danger-soft border-b border-danger-line shrink-0">
            <RedFlagAlert
              reason={result.reasoning}
              actionText={result.nextSteps?.[0] ?? 'Segera ke IGD atau hubungi 119'}
            />
          </div>
        )}

        {/* ── Chat Messages Area ── */}
        <div className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 space-y-4 bg-slate-50">

          {/* Session start indicator */}
          <div className="text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-xs">
              <HeartPulse className="h-3 w-3 text-brand-600" />
              Sesi Konsultasi Dimulai
            </span>
          </div>

          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-end gap-2.5 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${
                    isUser ? 'bg-brand-500' : 'bg-slate-800'
                  }`}
                >
                  {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[80%] sm:max-w-[72%] rounded-2xl px-4 py-3 shadow-xs ${
                    isUser
                      ? 'bg-brand-500 text-white rounded-br-sm'
                      : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                  }`}
                >
                  {isUser
                    ? <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    : renderContent(msg.content)
                  }
                  <p className={`mt-1.5 text-[10px] text-right ${isUser ? 'text-brand-100' : 'text-slate-400'}`}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isLoading && !hasResponseStarted && (
            <div className="flex items-end gap-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-800 text-white shadow-sm">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-bl-sm bg-white border border-slate-200 shadow-xs px-4 py-3 flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-brand-600 shrink-0" />
                Medivue sedang menyusun jawaban...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Quick Chips ── */}
        <div className="border-t border-slate-200 bg-white px-4 py-2 overflow-x-auto shrink-0">
          <div className="flex items-center gap-2 whitespace-nowrap">
            <span className="text-[11px] font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-brand-500" />
              Tanya cepat:
            </span>
            {SUGGESTED_QUESTIONS.map((q, i) => (
              <button
                key={i}
                type="button"
                disabled={isLoading}
                onClick={() => handleSendMessage(q)}
                className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-600 hover:border-brand-300 hover:bg-surface hover:text-brand-700 disabled:opacity-50 transition"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* ── Input Bar ── */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="border-t border-slate-200 bg-white px-4 py-3 shrink-0"
        >
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              disabled={isLoading}
              placeholder="Tanyakan keluhan Anda (misal: boleh minum es? kapan harus periksa?)..."
              className="flex-1 rounded-2xl border border-slate-300 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 disabled:opacity-60 transition"
            />
            <button
              type="submit"
              disabled={isLoading || !inputText.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white hover:bg-brand-700 disabled:opacity-40 transition shadow-sm"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 px-1">
            <span>Tekan <strong>Enter</strong> untuk kirim</span>
            <button
              type="button"
              onClick={onReset}
              className="hover:text-slate-600 transition flex items-center gap-1"
            >
              <RotateCcw className="h-3 w-3" />
              Reset Gejala
            </button>
          </div>
        </form>
      </div>

      {/* Doctor Letter Modal */}
      {doctorLetter && (
        <DoctorLetterModal
          letter={doctorLetter}
          onClose={() => setDoctorLetter(null)}
        />
      )}
    </div>
  );
}
