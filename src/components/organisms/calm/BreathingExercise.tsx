'use client';

import React, { useEffect, useState } from 'react';
import { Pause, Play, RefreshCw, Wind } from 'lucide-react';

export default function BreathingExercise() {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<'tarik' | 'tahan' | 'hembuskan'>('tarik');
  const [secondsLeft, setSecondsLeft] = useState(4);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          if (phase === 'tarik') {
            setPhase('tahan');
            return 4;
          } else if (phase === 'tahan') {
            setPhase('hembuskan');
            return 6;
          } else {
            setPhase('tarik');
            return 4;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, phase]);

  const phaseText =
    phase === 'tarik'
      ? 'Tarik napas perlahan…'
      : phase === 'tahan'
        ? 'Tahan sebentar…'
        : 'Hembuskan dengan rileks…';

  const phaseColor =
    phase === 'tarik'
      ? 'bg-brand-400 scale-125'
      : phase === 'tahan'
        ? 'bg-brand-500 scale-125'
        : 'bg-brand-400 scale-100';

  const reset = () => {
    setPhase('tarik');
    setSecondsLeft(4);
  };

  return (
      <div className="rounded-2xl border border-line bg-gradient-to-b from-surface/70 to-surface/40 p-6 text-center">
      <div className="mb-2 flex items-center justify-center gap-2 text-sm font-semibold text-brand-700">
        <Wind className="h-4 w-4" />
        <span>Latihan napas sejenak</span>
      </div>
      <p className="mx-auto mb-6 max-w-md text-xs leading-5 text-slate-600">
        Kalau dada terasa tegang atau pikiran penuh, luangkan satu menit untuk mengatur ritme napas.
      </p>

      <div className="relative mx-auto flex h-44 w-44 items-center justify-center">
        <div
          className={`absolute h-36 w-36 rounded-full opacity-20 transition-all duration-1000 ease-in-out ${
            isActive ? phaseColor : 'bg-brand-500 scale-100'
          }`}
        />
        <div
          className={`flex h-28 w-28 flex-col items-center justify-center rounded-full text-white shadow-md transition-all duration-1000 ease-in-out ${
            isActive ? phaseColor : 'bg-brand-500 scale-100'
          }`}
        >          <span className="text-2xl font-bold">{isActive ? secondsLeft : '4s'}</span>
        </div>
      </div>

      <div className="mt-4 h-6 text-sm font-medium text-slate-700">
        {isActive ? phaseText : 'Tekan tombol untuk memulai latihan napas'}
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => setIsActive(!isActive)}
          className="flex items-center gap-1.5 rounded-full bg-brand-500 px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-brand-700"
        >
          {isActive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {isActive ? 'Jeda' : 'Mulai latihan'}
        </button>

        {isActive && (
          <button
            type="button"
            onClick={reset}
            className="flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Reset
          </button>
        )}
      </div>

      <p className="mt-4 text-[11px] leading-5 text-slate-500">
        Latihan ini untuk menenangkan diri, bukan menggantikan bantuan medis.
      </p>
    </div>
  );
}
