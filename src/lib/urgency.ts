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
    badgeColor: 'bg-danger text-white',
    borderColor: 'border-danger-line',
    bgColor: 'bg-danger-soft',
    actionText: 'Segera ke IGD terdekat atau hubungi 119',
    timeframe: 'Sekarang',
    pillClass: 'bg-danger-soft text-danger-strong ring-danger-line',
    dotClass: 'bg-danger',
  },
  segera: {
    level: 'segera',
    label: 'Perlu diperiksa segera',
    shortLabel: 'Segera',
    description: 'Sebaiknya diperiksa dokter dalam 24 jam ke depan.',
    badgeColor: 'bg-warning text-white',
    borderColor: 'border-warning-line',
    bgColor: 'bg-warning-soft',
    actionText: 'Temui dokter atau klinik dalam 24 jam',
    timeframe: 'Dalam 24 jam',
    pillClass: 'bg-warning-soft text-warning-strong ring-warning-line',
    dotClass: 'bg-warning',
  },
  terjadwal: {
    level: 'terjadwal',
    label: 'Perlu dijadwalkan',
    shortLabel: 'Terjadwal',
    description: 'Perlu dicek, tetapi tidak mendesak. Buat janji dalam beberapa hari.',
    badgeColor: 'bg-brand-500 text-white',
    borderColor: 'border-brand-200',
    bgColor: 'bg-brand-50',
    actionText: 'Buat janji dengan dokter dalam 2–3 hari',
    timeframe: '2–3 hari',
    pillClass: 'bg-brand-50 text-brand-700 ring-brand-200',
    dotClass: 'bg-brand-500',
  },
  pantau_di_rumah: {
    level: 'pantau_di_rumah',
    label: 'Pantau di rumah',
    shortLabel: 'Pantau',
    description: 'Cenderung ringan. Rawat mandiri sambil memantau tanda eskalasi.',
    badgeColor: 'bg-success text-white',
    borderColor: 'border-success-line',
    bgColor: 'bg-success-soft',
    actionText: 'Rawat mandiri di rumah dan pantau perkembangannya',
    timeframe: 'Mandiri',
    pillClass: 'bg-success-soft text-success-strong ring-success-line',
    dotClass: 'bg-success',
  },
};

export function getUrgencyMeta(level?: string | null): UrgencyDisplayMeta {
  if (level && level in URGENCY_META) {
    return URGENCY_META[level as UrgencyLevel];
  }
  return URGENCY_META.pantau_di_rumah;
}
