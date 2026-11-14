'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  BookHeart,
  CalendarCheck,
  Check,
  ChevronDown,
  ClipboardList,
  FileCheck2,
  HeartPulse,
  Home,
  MessageCircleHeart,
  PhoneCall,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Wind,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { URGENCY_META, URGENCY_ORDER } from '@/lib/urgency';
import type { UrgencyLevel } from '@/types/triage';

const STEPS = [
  {
    number: '01',
    title: 'Ceritakan yang kamu rasakan',
    text: 'Jawab lima pertanyaan singkat tentang gejala, durasi, keparahan, dan seberapa cemas kamu dibuatnya.',
    icon: MessageCircleHeart,
  },
  {
    number: '02',
    title: 'Lihat tingkat urgensinya',
    text: 'Medivue memeriksa tanda bahaya lebih dulu, lalu membantu memetakan apakah kamu perlu ke IGD, dokter, atau istirahat di rumah.',
    icon: Sparkles,
  },
  {
    number: '03',
    title: 'Ambil langkah berikutnya',
    text: 'Dapatkan saran praktis, latihan napas, dan ringkasan siap bawa ke dokter saat kamu berkonsultasi.',
    icon: FileCheck2,
  },
];

const FEATURES = [
  {
    icon: ClipboardList,
    title: 'Terarah, tidak melelahkan',
    text: 'Pertanyaan dibuat bertahap dan bisa dilewati sesuai kebutuhan. Tidak ada istilah medis yang bikin tambah bingung.',
  },
  {
    icon: BookHeart,
    title: 'Pantau dari hari ke hari',
    text: 'Catat perubahan gejala di symptom diary pribadi dan lihat kembali riwayat pengecekanmu kapan saja.',
  },
  {
    icon: FileCheck2,
    title: 'Siap sebelum ke dokter',
    text: 'Bawa ringkasan keluhan dan pertanyaan penting agar waktu konsultasi terasa lebih efisien dan terfokus.',
  },
];

const LEVEL_ICONS: Record<UrgencyLevel, typeof HeartPulse> = {
  darurat: ShieldAlert,
  segera: AlertTriangle,
  terjadwal: CalendarCheck,
  pantau_di_rumah: Home,
};

const FAQS = [
  {
    q: 'Apakah Medivue memberi diagnosis?',
    a: 'Tidak. Medivue membantu memahami tingkat urgensi dan langkah awal. Hasilnya bukan diagnosis resmi dan tetap perlu dikonfirmasi tenaga medis.',
  },
  {
    q: 'Apakah harus punya akun?',
    a: 'Tidak. Kamu bisa langsung mulai cek gejala sebagai tamu. Akun hanya diperlukan jika ingin menyimpan riwayat secara lebih teratur.',
  },
  {
    q: 'Di mana data saya disimpan?',
    a: 'Riwayat pengecekan dan surat dokter saat ini tersimpan di browser perangkatmu. Kamu bisa menghapusnya dengan membersihkan data browser.',
  },
  {
    q: 'Bagaimana kalau gejalanya terasa darurat?',
    a: 'Jangan menunggu hasil aplikasi. Segera ke IGD terdekat atau hubungi 119. Medivue akan menampilkan peringatan darurat jika mendeteksi tanda bahaya.',
  },
];

export default function HomePage() {
  const { user } = useAuth();
  const primaryHref = user ? '/dashboard' : '/checkin';

  return (
    <div className="overflow-hidden bg-surface text-slate-900">
      {/* ============================= HERO (Slide 1) ============================= */}
      <section className="relative overflow-hidden section-transition-light">
        <Image
          src="/Hero.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-40"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-8 sm:px-8 sm:py-12 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-brand-700/20 bg-white/40 px-3.5 py-2 text-xs font-semibold text-brand-700">
              <span className="h-2 w-2 rounded-full bg-brand-500" />
              Pendamping triase kesehatan, bukan pengganti dokter
            </div>

            <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-brand-700 sm:text-5xl lg:text-[3.65rem]">
              Bingung harus ke IGD, dokter, atau{' '}
              <span className="text-brand-500">istirahat di rumah?</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-slate-700/80 sm:text-lg">
              Medivue membantumu memetakan tingkat urgensi keluhan dengan bahasa yang menenangkan —
              tanpa menebak-nebak penyakit dari internet.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/checkin"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-brand-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-500/20 transition hover:bg-brand-700"
              >
                Mulai cek gejala
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#cara-kerja"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-brand-700/10 bg-white/75 px-5 py-3 text-sm font-semibold text-brand-700 transition hover:bg-white"
              >
                Lihat cara kerjanya <ArrowDown className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Preview Hasil Card */}
          <div className="relative mx-auto w-full max-w-md lg:ml-auto">
             <div className="relative rounded-[1.75rem] border border-brand-700/5 bg-white/90 backdrop-blur-sm p-6 shadow-xl">
               <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-brand-500">Contoh Hasil</p>
                    <h2 className="mt-1 text-lg font-semibold text-brand-700">Sakit kepala & badan pegal</h2>
                  </div>
                  <span className="shrink-0 rounded-full bg-surface px-3 py-1 text-[11px] font-bold text-brand-700">
                    Pantau di rumah
                  </span>
               </div>
               <div className="mt-4 space-y-2 text-sm text-slate-600">
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-500" /> Istirahat cukup</div>
                  <div className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-500" /> Pantau suhu tubuh</div>
               </div>
             </div>
          </div>
        </div>
      </section>

      {/* ======================== TINGKAT URGENSI (Slide 2) ======================== */}
      <section id="tingkat-urgensi" className="section-transition-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-500">Empat Tingkat Urgensi</p>
            <h2 className="mt-3 text-3xl font-semibold text-brand-700 sm:text-4xl">Satu hasil yang jelas.</h2>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {URGENCY_ORDER.map((level) => {
              const meta = URGENCY_META[level];
              const Icon = LEVEL_ICONS[level];
              return (
                <div key={level} className="rounded-2xl bg-white p-4 shadow-sm border border-line transition hover:shadow-md sm:p-6">
                  <div className={`inline-flex p-2.5 rounded-xl bg-brand-50 mb-3 sm:p-3 sm:mb-4 ${meta.level === 'darurat' ? 'text-danger' : 'text-brand-500'}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <h3 className="text-base font-bold text-brand-700 sm:text-lg">{meta.label}</h3>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed sm:mt-2 sm:text-sm">{meta.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ CARA KERJA (Slide 3) ============================ */}
      <section id="cara-kerja" className="section-transition-gray">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-500">Alurnya Sederhana</p>
          <h2 className="mt-3 text-3xl font-semibold text-brand-700 sm:text-4xl mb-12">Dari bingung jadi tahu mau ngapain.</h2>

          <div className="grid grid-cols-2 gap-3 sm:gap-6 lg:grid-cols-3">
            {STEPS.map(({ number, title, text, icon: Icon }, index) => (
              <div
                key={number}
                className={`bg-white/70 backdrop-blur-sm rounded-2xl p-4 border border-line sm:p-8 ${
                  index === 2 ? 'col-span-2 lg:col-span-1' : ''
                }`}
              >
                <span className="text-2xl font-bold text-brand-700/10 block mb-2 sm:text-4xl sm:mb-4">{number}</span>
                <Icon className="h-7 w-7 text-brand-500 mx-auto mb-3 sm:h-10 sm:w-10 sm:mb-6" />
                <h3 className="text-sm font-semibold text-brand-700 mb-1.5 sm:text-xl sm:mb-3">{title}</h3>
                <p className="text-xs text-slate-600 sm:text-sm">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ CALM SUPPORT (Slide 4) ============================ */}
      <section className="bg-gradient-to-b from-brand-700 to-brand-900 py-20 text-white">
        <div className="mx-auto max-w-6xl px-5 flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full text-center lg:w-2/3 lg:text-left">
             <h2 className="text-3xl font-bold mb-6">Cemas itu wajar. Kamu tidak menebak sendirian.</h2>
             <p className="mx-auto max-w-xl text-white/80 leading-relaxed mb-8 lg:mx-0">
               Medivue dirancang untuk mengurangi overthinking dengan menampilkan kemungkinan paling lazim dan latihan napas saat pikiran mulai penuh.
             </p>
             <Link href="/checkin" className="inline-flex items-center gap-2 bg-white px-8 py-3 rounded-full font-bold text-brand-700 transition hover:bg-brand-100">
               Cek gejala sekarang
             </Link>
          </div>
          <div className="relative h-64 w-64 flex items-center justify-center">
             <div className="animate-breathe absolute inset-0 rounded-full opacity-20" />
             <Wind className="h-12 w-12 text-brand-100" />
          </div>
        </div>
      </section>

      {/* ============================= FINAL CTA ============================= */}
      <section className="bg-surface py-16 text-center">
        <div className="mx-auto max-w-2xl px-5">
           <h2 className="text-3xl font-bold text-brand-700 mb-4">Mulai dari yang kamu rasakan hari ini.</h2>
           <p className="text-slate-600 mb-8">Lima pertanyaan singkat untuk membantu memutuskan langkah berikutnya.</p>
           <Link href="/checkin" className="bg-brand-700 text-white px-10 py-4 rounded-full font-bold shadow-xl transition hover:scale-105">
             Mulai sekarang
           </Link>
        </div>
      </section>
    </div>
  );
}
