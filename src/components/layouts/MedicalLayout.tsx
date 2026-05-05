import React from 'react';
import type { MedicalData } from '../../model';
import { Activity, User as UserIcon } from 'lucide-react';

export const MedicalLayout: React.FC<{ data: MedicalData }> = ({ data }) => (
  <section className="mb-8 grid grid-cols-2 gap-8 p-5 bg-sky-50/50 rounded-2xl border border-sky-100 shadow-sm">
    <div className="flex items-center gap-4">
      <div className="p-3 bg-white rounded-xl shadow-sm border border-sky-100">
        <Activity size={18} className="text-sky-600" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Attending Physician</p>
        <p className="text-[12px] font-black text-slate-900">Dr. {data.doctorName || 'Not Assigned'}</p>
      </div>
    </div>
    <div className="flex items-center gap-4 border-l border-sky-100 pl-8">
      <div className="p-3 bg-white rounded-xl shadow-sm border border-sky-100">
        <UserIcon size={18} className="text-sky-600" />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Ward / Room</p>
        <p className="text-[12px] font-black text-slate-900">{data.wardNumber || 'General Ward'}</p>
      </div>
    </div>
  </section>
);
