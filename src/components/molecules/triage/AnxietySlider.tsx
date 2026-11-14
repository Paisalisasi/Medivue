'use client';

import React from 'react';

interface Props {
  value: number;
  onChange: (val: number) => void;
  label?: string;
  sublabel?: string;
}

const LEVELS = [
  { num: 1, label: 'Sangat tenang', icon: '😌', color: 'text-brand-500' },
  { num: 2, label: 'Sedikit khawatir', icon: '🙂', color: 'text-brand-700' },
  { num: 3, label: 'Cukup cemas', icon: '😐', color: 'text-warning' },
  { num: 4, label: 'Cemas tinggi', icon: '😟', color: 'text-danger' },
  { num: 5, label: 'Sangat panik', icon: '😰', color: 'text-danger-strong' },
];

export default function AnxietySlider({ value, onChange, label, sublabel }: Props) {
  return (
    <div>
      {label && (
        <label className="block text-sm font-semibold text-brand-700">{label}</label>
      )}
      {sublabel && (
        <p className="mt-1 text-xs leading-5 text-slate-500">{sublabel}</p>
      )}

      <div className="mt-2 grid grid-cols-5 gap-1.5 sm:gap-2">
        {LEVELS.map((item) => {
          const isSelected = value === item.num;
          return (
            <button
              key={item.num}
              type="button"
              onClick={() => onChange(item.num)}
              aria-pressed={isSelected}
              aria-label={`Tingkat kecemasan ${item.num}: ${item.label}`}
              className={`flex flex-col items-center justify-center rounded-xl border px-1 py-3 transition ${
                isSelected
                  ? 'border-brand-500 bg-surface text-brand-700 shadow-sm'
                  : 'border-slate-200 bg-slate-50/70 text-slate-600 hover:border-brand-200 hover:bg-surface/40'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className={`mt-1 text-sm font-bold ${isSelected ? 'text-brand-700' : item.color}`}>
                {item.num}
              </span>
              <span className="mt-0.5 hidden text-center text-[10px] leading-tight text-slate-500 sm:block">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
        <span>Tenang</span>
        <span>Panik</span>
      </div>
    </div>
  );
}
