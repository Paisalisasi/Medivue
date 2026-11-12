import React from 'react';
import { AlertCircle } from 'lucide-react';

export default function DisclaimerBanner() {
  return (
    <aside
      aria-label="Informasi medis"
      className="w-full border-b border-[#335581]/20 bg-[#F4F8EC] px-5 py-2.5 text-xs text-amber-950 sm:px-8"
    >
      <div className="mx-auto flex max-w-6xl items-start gap-2.5">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
        <p className="leading-5">
          <span className="font-semibold">Catatan penting:</span> Medivue memberi informasi awal,
          bukan diagnosis. Untuk kondisi darurat, segera ke IGD atau{' '}
          <a href="tel:119" className="font-semibold underline underline-offset-2">hubungi 119</a>.
        </p>
      </div>
    </aside>
  );
}
