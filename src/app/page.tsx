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
import { useAuth } from '@/contexts/AuthContext';
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
    <div className="overflow-hidden bg-[#f6f8f4] text-slate-900">
      {/* ============================= HERO ============================= */}
      <section className="relative overflow-hidden border-b border-emerald-950/5 bg-[#fbfcf8]">
        {/* Background image */}
        <Image
          src="/Hero.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-14 sm:px-8 sm:py-20 lg:grid-cols-[1.05fr_.95fr] lg:gap-16 lg:py-24">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-900/10 bg-[#f4f8ec] px-3.5 py-2 text-xs font-semibold text-emerald-950">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Pendamping triase kesehatan, bukan pengganti dokter
            </div>

            <h1 className="mt-6 max-w-2xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-emerald-950 sm:text-5xl lg:text-[3.65rem]">
              Bingung harus ke IGD, dokter, atau{' '}
              <span className="text-emerald-700">istirahat di rumah?</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-emerald-950/65 sm:text-lg">
              Medivue membantumu memetakan tingkat urgensi keluhan dengan bahasa yang menenangkan —
              tanpa menebak-nebak penyakit dari internet.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/checkin"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-emerald-950 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-950/10 transition hover:bg-emerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
              >
                Mulai cek gejala
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#cara-kerja"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-emerald-950/10 bg-white/75 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-white"
              >
                Lihat cara kerjanya <ArrowDown className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-emerald-950/65">
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-700" /> Gratis untuk mulai</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-700" /> Tanpa akun</span>
              <span className="inline-flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-emerald-700" /> Riwayat di perangkatmu</span>
            </div>
          </div>

          {/* Preview hasil */}
          <div className="relative mx-auto w-full max-w-md lg:ml-auto">
            <div className="absolute -left-6 top-8 h-28 w-28 rounded-full border border-emerald-900/10" />
            <div className="absolute -right-4 bottom-16 h-16 w-16 rounded-2xl border border-emerald-900/10" />

            <div className="relative rounded-[1.75rem] border border-emerald-900/10 bg-[#fffefa] p-5 shadow-[0_24px_70px_-42px_rgba(6,78,59,.34)] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.16em] text-emerald-700">Contoh hasil triase</p>
                  <h2 className="mt-1.5 text-lg font-semibold tracking-tight text-emerald-950">Sakit kepala & badan pegal</h2>
                  <p className="mt-1 text-xs text-slate-500">1–2 hari · keparahan sedang</p>
                </div>
                <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-800 ring-1 ring-emerald-200">
                  Pantau di rumah
                </span>
              </div>

              <div className="mt-5 rounded-2xl bg-[#f3f6ee] p-4">
                <p className="text-xs font-semibold text-emerald-900">Langkah yang disarankan</p>
                <div className="mt-3 space-y-2.5">
                  {['Istirahat dan cukupi cairan', 'Catat perubahan gejala hari ini', 'Ke dokter bila memberat dalam 2–3 hari'].map((item) => (
                    <div key={item} className="flex items-start gap-2.5 text-xs leading-5 text-slate-700">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                        <Check className="h-2.5 w-2.5" />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-teal-100 bg-teal-50/70 p-3 text-[11px] leading-5 text-teal-900">
                <Wind className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Kalau cemas, ada latihan napas 1 menit untuk membantu menenangkan diri.</p>
              </div>

              <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3.5 text-[11px] text-slate-500">
                <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-700" />
                Informasi awal, bukan pengganti tenaga medis
              </div>
            </div>

            <div className="absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-xl border border-emerald-950/10 bg-white px-4 py-3 text-xs font-medium text-emerald-950 shadow-lg sm:flex">
              <Wind className="h-4 w-4 text-emerald-700" />
              Ada ruang untuk tarik napas.
            </div>
          </div>
        </div>
      </section>

      {/* ======================== TINGKAT URGENSI ======================== */}
      <section id="tingkat-urgensi" className="border-b border-emerald-950/10 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-xl">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Empat tingkat urgensi</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-[-.035em] text-emerald-950 sm:text-3xl">
                Satu hasil yang jelas, tanpa istilah rumit.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-600">
              Setiap hasil selalu disertai alasan dan tanda yang perlu kamu waspadai.
            </p>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {URGENCY_ORDER.map((level) => {
              const meta = URGENCY_META[level];
              const Icon = LEVEL_ICONS[level];
              return (
                <div
                  key={level}
                  className={`rounded-2xl border p-5 ${meta.borderColor} ${meta.bgColor}`}
                >
                  <div className="flex items-center justify-between">
                    <span className={`flex h-9 w-9 items-center justify-center rounded-xl bg-white ${meta.level === 'darurat' ? 'text-rose-600' : meta.level === 'segera' ? 'text-amber-600' : meta.level === 'terjadwal' ? 'text-sky-600' : 'text-emerald-600'}`}>
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className={`h-2 w-2 rounded-full ${meta.dotClass}`} />
                  </div>
                  <h3 className="mt-4 text-sm font-bold text-emerald-950">{meta.label}</h3>
                  <p className="mt-1.5 text-xs leading-5 text-slate-600">{meta.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ============================ CARA KERJA ============================ */}
      <section id="cara-kerja" className="scroll-mt-24">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Alurnya sederhana</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em] text-emerald-950 sm:text-4xl">
              Dari bingung jadi tahu mau ngapain.
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Nggak perlu ngerti istilah medis. Ceritakan dengan bahasamu sendiri, lalu ikuti panduan langkah demi langkah.
            </p>
          </div>

          <div className="relative mt-10 grid gap-4 lg:grid-cols-3">
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-10 hidden border-t border-dashed border-emerald-900/20 lg:block" />
            {STEPS.map(({ number, title, text, icon: Icon }) => (
              <article key={number} className="relative rounded-2xl border border-emerald-950/10 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-900 text-lime-200">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold tracking-[.18em] text-emerald-700">{number}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold text-emerald-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>

          <div className="mt-6 flex flex-col items-start justify-between gap-3 rounded-2xl bg-[#eef3e8] px-5 py-4 text-sm sm:flex-row sm:items-center">
            <p className="flex items-start gap-2.5 text-slate-700">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" />
              Sistem memeriksa tanda bahaya lebih dulu sebelum memberi saran.
            </p>
            <Link href="/checkin" className="inline-flex shrink-0 items-center gap-1.5 font-semibold text-emerald-900 hover:underline">
              Coba sekarang <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ============================== FITUR ============================== */}
      <section className="border-y border-emerald-950/10 bg-white">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Yang bisa kamu lakukan</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em] text-emerald-950 sm:text-4xl">
                Bukan cuma cek, tapi siap ambil langkah.
              </h2>
            </div>
            <p className="max-w-sm text-sm leading-6 text-slate-600">
              Simpan perkembangan, tenangkan diri, dan datang ke konsultasi dengan catatan yang lebih rapi.
            </p>
          </div>

          <div className="mt-9 grid gap-4 md:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <article key={title} className="rounded-2xl bg-[#f6f8f4] p-6">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-lime-100 text-emerald-800">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-5 text-base font-semibold text-emerald-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ CALM SUPPORT ============================ */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="relative overflow-hidden rounded-[2rem] bg-emerald-950 px-6 py-10 text-white sm:px-10 sm:py-14">
          <div className="pointer-events-none absolute -right-16 -top-20 h-80 w-80 rounded-full border border-white/10" />
          <div className="pointer-events-none absolute -bottom-24 right-16 h-64 w-64 rounded-full border border-white/10" />

          <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_.8fr]">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-emerald-100">
                <Wind className="h-3.5 w-3.5" />
                Calm support
              </span>
              <h2 className="mt-5 max-w-2xl text-3xl font-semibold tracking-[-.035em] sm:text-4xl">
                Cemas itu wajar. Yang penting, kamu tidak menebak sendirian.
              </h2>
              <p className="mt-4 max-w-xl text-sm leading-7 text-emerald-100/80 sm:text-base">
                Medivue dirancang untuk mengurangi overthinking: menampilkan kemungkinan paling lazim
                terlebih dahulu, memberi langkah kecil yang bisa dilakukan, dan menyediakan latihan
                napas saat pikiran mulai penuh.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/checkin"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-lime-300 px-5 py-2.5 text-sm font-bold text-emerald-950 transition hover:bg-lime-200"
                >
                  Mulai dengan tenang <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/#privasi"
                  className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/20 px-5 py-2.5 text-sm font-semibold text-emerald-50 transition hover:bg-white/10"
                >
                  Pelajari privasinya
                </Link>
              </div>
            </div>

            <div className="relative mx-auto flex h-56 w-56 items-center justify-center">
              <div className="absolute h-52 w-52 rounded-full border border-white/10" />
              <div className="absolute h-40 w-40 rounded-full border border-white/15" />
              <div className="animate-breathe absolute h-32 w-32 rounded-full bg-lime-300/20" />
              <div className="relative flex h-24 w-24 flex-col items-center justify-center rounded-full bg-lime-300 text-emerald-950 shadow-xl">
                <Wind className="h-6 w-6" />
                <span className="mt-1 text-[10px] font-bold uppercase tracking-wider">Tarik napas</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================== PRIVASI ============================== */}
      <section id="privasi" className="scroll-mt-24 border-y border-emerald-950/10 bg-white">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_.9fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Privasi & batasan</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em] text-emerald-950 sm:text-4xl">
              Jelas soal apa yang bisa dan tidak bisa dilakukan Medivue.
            </h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600">
              Kami tidak menggantikan dokter. Kami membantu kamu datang dengan informasi yang lebih
              rapi dan keputusan yang lebih tenang.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href={primaryHref} className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-emerald-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800">
                {user ? 'Buka dashboard' : 'Mulai cek gejala'} <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="tel:119" className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-100">
                <PhoneCall className="h-4 w-4" /> Darurat? Hubungi 119
              </a>
            </div>
          </div>

          <div className="grid gap-3">
            {[
              { title: 'Data di perangkatmu', text: 'Riwayat pengecekan dan surat dokter tersimpan di browser perangkat ini.' },
              { title: 'Tidak menjual data', text: 'Medivue tidak meminta data yang tidak diperlukan untuk membantu triase awal.' },
              { title: 'Bukan diagnosis', text: 'Hasil triase adalah panduan awal. Pemeriksaan tenaga medis tetap jadi acuan utama.' },
              { title: 'Tanda bahaya diutamakan', text: 'Jika sistem mendeteksi red flag, alur langsung diarahkan ke bantuan darurat.' },
            ].map(({ title, text }) => (
              <div key={title} className="flex gap-3 rounded-2xl border border-emerald-950/10 bg-[#f6f8f4] p-4">
                <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                  <Check className="h-4 w-4" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-emerald-950">{title}</h3>
                  <p className="mt-1 text-xs leading-5 text-slate-600">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =============================== FAQ =============================== */}
      <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-[.16em] text-emerald-700">Pertanyaan umum</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.035em] text-emerald-950 sm:text-4xl">
            Masih ada yang ingin diketahui?
          </h2>
        </div>

        <div className="mt-8 space-y-3">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group rounded-2xl border border-emerald-950/10 bg-white p-5 open:shadow-sm">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-semibold text-emerald-950 [&::-webkit-details-marker]:hidden">
                {q}
                <ChevronDown className="h-4 w-4 shrink-0 text-emerald-700 transition group-open:rotate-180" />
              </summary>
              <p className="mt-3 text-sm leading-6 text-slate-600">{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ============================= FINAL CTA ============================= */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="flex flex-col items-start justify-between gap-6 rounded-[1.75rem] bg-[#e9f0e2] p-6 sm:flex-row sm:items-center sm:p-9">
          <div>
            <h2 className="text-2xl font-semibold tracking-[-.03em] text-emerald-950 sm:text-3xl">
              Mulai dari yang kamu rasakan hari ini.
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">
              Lima pertanyaan singkat untuk membantu memutuskan langkah berikutnya dengan lebih tenang.
            </p>
          </div>
          <Link
            href="/checkin"
            className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-xl bg-emerald-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-950/10 transition hover:bg-emerald-800"
          >
            <HeartPulse className="h-4 w-4 text-lime-200" />
            Cek gejala sekarang
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
