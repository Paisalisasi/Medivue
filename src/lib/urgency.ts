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
    badgeColor: 'bg-[#4B7CB6] text-white',
    borderColor: 'border-[#4B7CB6]',
    bgColor: 'bg-[#4B7CB6]/10',
    actionText: 'Temui dokter atau klinik dalam 24 jam',
    timeframe: 'Dalam 24 jam',
    pillClass: 'bg-[#4B7CB6]/10 text-[#335581] ring-[#4B7CB6]/20',
    dotClass: 'bg-[#4B7CB6]',
  },
  terjadwal: {
    level: 'terjadwal',
    label: 'Perlu dijadwalkan',
    shortLabel: 'Terjadwal',
    description: 'Perlu dicek, tetapi tidak mendesak. Buat janji dalam beberapa hari.',
    badgeColor: 'bg-[#4B7CB6] text-white',
    borderColor: 'border-[#4B7CB6]',
    bgColor: 'bg-[#4B7CB6]/10',
    actionText: 'Buat janji dengan dokter dalam 2–3 hari',
    timeframe: '2–3 hari',
    pillClass: 'bg-[#4B7CB6]/10 text-[#335581] ring-[#4B7CB6]/20',
    dotClass: 'bg-[#4B7CB6]',
  },
  pantau_di_rumah: {
    level: 'pantau_di_rumah',
    label: 'Pantau di rumah',
    shortLabel: 'Pantau',
    description: 'Cenderung ringan. Rawat mandiri sambil memantau tanda eskalasi.',
    badgeColor: 'bg-[#335581] text-white',
    borderColor: 'border-[#335581]',
    bgColor: 'bg-[#335581]/10',
    actionText: 'Rawat mandiri di rumah dan pantau perkembangannya',
    timeframe: 'Mandiri',
    pillClass: 'bg-[#335581]/10 text-[#335581] ring-[#335581]/20',
    dotClass: 'bg-[#335581]',
  },
};

export function getUrgencyMeta(level?: string | null): UrgencyDisplayMeta {
  if (level && level in URGENCY_META) {
    return URGENCY_META[level as UrgencyLevel];
  }
  return URGENCY_META.pantau_di_rumah;
}
