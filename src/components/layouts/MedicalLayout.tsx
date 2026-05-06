import React from 'react';
import type { MedicalData } from '../../model';

export const MedicalLayout: React.FC<{ data: MedicalData }> = ({ data }) => (
  <section className="mb-10 grid grid-cols-3 gap-6 py-6 border-y border-slate-50">
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Medical Officer</p>
      <p className="text-[11px] font-black text-slate-900 uppercase">{data.doctorName || 'Not Assigned'}</p>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Facility Unit</p>
      <p className="text-[11px] font-black text-slate-900 uppercase">{data.wardNumber || 'General Service'}</p>
    </div>
    <div className="space-y-1 text-right">
      <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Patient ID</p>
      <p className="text-[11px] font-black text-slate-900 uppercase">{data.patientId || 'Walking'}</p>
    </div>
  </section>
);
