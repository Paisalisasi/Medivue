/**
 * Utility Formatters Medivue
 */

export function formatDateIndo(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

export function formatUrgencyBadge(level: string): { label: string; color: string } {
  switch (level) {
    case 'darurat':
      return { label: 'Darurat (IGD / 119)', color: 'bg-rose-600 text-white' };
    case 'segera':
      return { label: 'Periksa dalam 24 Jam', color: 'bg-amber-600 text-white' };
    case 'terjadwal':
      return { label: 'Jadwalkan Konsultasi', color: 'bg-blue-600 text-white' };
    case 'pantau_di_rumah':
    default:
      return { label: 'Pantau di Rumah', color: 'bg-[#4B7CB6] text-white' };
  }
}
