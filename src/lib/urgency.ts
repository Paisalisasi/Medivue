import type { UrgencyLevel, UrgencyMeta } from '@/types/triage';

/**
 * Satu sumber kebenaran untuk label, warna, dan tindakan tiap level urgensi.
 * Dipakai oleh landing page, onboarding, dashboard, kartu hasil, dan ruang chat.
 */
export interface UrgencyDisplayMeta extends UrgencyMeta {
  shortLabel: string;
  description: string;
  pillClass: string;
  dotClass: string;
}

export const URGENCY_ORDER: UrgencyLevel[] = [
  'darurat',
  'segera',
  'terjadwal',
  'pantau_di_rumah',
];

export const URGENCY_META: Record<UrgencyLevel, UrgencyDisplayMeta> = {
  darurat: {
    level: 'darurat',
    label: 'Darurat medis',
    shortLabel: 'Darurat',
    description: 'Berpotensi mengancam nyawa. Segera ke IGD atau hubungi 119.',
    badgeColor: 'bg-rose-600 text-white',
    borderColor: 'border-rose-300',
    bgColor: 'bg-rose-50',
    actionText: 'Segera ke IGD terdekat atau hubungi 119',
    timeframe: 'Sekarang',
    pillClass: 'bg-rose-50 text-rose-700 ring-rose-200',
    dotClass: 'bg-rose-500',
  },
  segera: {
    level: 'segera',
    label: 'Perlu diperiksa segera',
    shortLabel: 'Segera',
    description: 'Sebaiknya diperiksa dokter dalam 24 jam ke depan.',
    badgeColor: 'bg-amber-500 text-white',
    borderColor: 'border-amber-300',
    bgColor: 'bg-amber-50',
    actionText: 'Temui dokter atau klinik dalam 24 jam',
    timeframe: 'Dalam 24 jam',
    pillClass: 'bg-amber-50 text-amber-800 ring-amber-200',
    dotClass: 'bg-amber-500',
  },
  terjadwal: {
    level: 'terjadwal',
    label: 'Perlu dijadwalkan',
    shortLabel: 'Terjadwal',
    description: 'Perlu dicek, tetapi tidak mendesak. Buat janji dalam beberapa hari.',
    badgeColor: 'bg-sky-600 text-white',
    borderColor: 'border-sky-300',
    bgColor: 'bg-sky-50',
    actionText: 'Buat janji dengan dokter dalam 2–3 hari',
    timeframe: '2–3 hari',
    pillClass: 'bg-sky-50 text-sky-800 ring-sky-200',
    dotClass: 'bg-sky-500',
  },
  pantau_di_rumah: {
    level: 'pantau_di_rumah',
    label: 'Pantau di rumah',
    shortLabel: 'Pantau',
    description: 'Cenderung ringan. Rawat mandiri sambil memantau tanda eskalasi.',
    badgeColor: 'bg-emerald-600 text-white',
    borderColor: 'border-emerald-300',
    bgColor: 'bg-emerald-50',
    actionText: 'Rawat mandiri di rumah dan pantau perkembangannya',
    timeframe: 'Mandiri',
    pillClass: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
    dotClass: 'bg-emerald-500',
  },
};

export function getUrgencyMeta(level?: string | null): UrgencyDisplayMeta {
  if (level && level in URGENCY_META) {
    return URGENCY_META[level as UrgencyLevel];
  }
  return URGENCY_META.pantau_di_rumah;
}
