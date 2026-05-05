import React from 'react';
import type { UtilityData } from '../../model';

export const UtilityLayout: React.FC<{ data: UtilityData, colorClass: string }> = ({ data, colorClass }) => (
  <section className="mb-10 overflow-hidden rounded-3xl border border-slate-100 shadow-sm bg-white">
    <div className="bg-slate-50 px-6 py-3 border-b border-slate-100 flex justify-between items-center">
      <p className="text-[10px] font-black uppercase text-slate-400 tracking-[0.2em]">Usage & Consumption Audit</p>
      <span className="text-[10px] font-black text-slate-400">UNIT: {data.consumptionUnit}</span>
    </div>
    <div className="grid grid-cols-3 divide-x divide-slate-100">
      <div className="p-6 text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Prev Reading</p>
        <p className="text-xl font-black text-slate-900 leading-none">{data.previousReading}</p>
      </div>
      <div className="p-6 text-center">
        <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Curr Reading</p>
        <p className="text-xl font-black text-slate-900 leading-none">{data.currentReading}</p>
      </div>
      <div className="p-6 text-center bg-slate-50/50">
        <p className="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-widest">Net Consumption</p>
        <p className={`text-xl font-black leading-none ${colorClass}`}>
          {(data.currentReading || 0) - (data.previousReading || 0)}
        </p>
      </div>
    </div>
  </section>
);
