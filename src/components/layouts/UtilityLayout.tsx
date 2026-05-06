import React from 'react';
import type { UtilityData } from '../../model';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const UtilityLayout: React.FC<{ data: UtilityData, colorClass: string }> = ({ data, colorClass }) => (
  <section className="mb-12 py-8 border-y border-slate-50 space-y-8">
    <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Meter No.</p>
        <p className="text-sm font-black text-slate-900 leading-none">{data.meterNumber || 'MTR-0000'}</p>
      </div>
      <div className="text-right space-y-1">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Billing Unit</p>
        <p className="text-sm font-black text-slate-900 leading-none">{data.consumptionUnit || 'Units'}</p>
      </div>
    </div>

    <div className="grid grid-cols-3 gap-8">
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Opening</p>
        <p className="text-xl font-black text-slate-900 leading-none">{data.previousReading || 0}</p>
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Closing</p>
        <p className="text-xl font-black text-slate-900 leading-none">{data.currentReading || 0}</p>
      </div>
      <div className="space-y-1 text-right">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest leading-none">Usage</p>
        <p className={cn("text-xl font-black leading-none uppercase", colorClass)}>
          {(data.currentReading || 0) - (data.previousReading || 0)}
        </p>
      </div>
    </div>
  </section>
);
