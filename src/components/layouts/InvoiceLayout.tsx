import React from 'react';
import type { ReceiptData } from '../../model';
import { 
  Mail, Phone, MapPin, HeartPulse, Pill, Zap, 
  Droplets, ShoppingBag, Globe, Fingerprint, CheckCircle2, Clock, XCircle,
  type LucideProps
} from 'lucide-react';
import { getIndustryTerminology } from '../../utils/terminology';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MedicalLayout } from './MedicalLayout';
import { UtilityLayout } from './UtilityLayout';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InvoiceLayoutProps {
  data: ReceiptData;
}

export const InvoiceLayout: React.FC<InvoiceLayoutProps> = ({ data }) => {
  const balanceDue = Math.max(0, (data.total || 0) - (data.paidAmount || 0));
  const term = getIndustryTerminology(data.theme);

  const getInvoiceStyle = () => {
    switch (data.theme) {
      case 'hospital':
        return {
          primary: '#0ea5e9', // sky-500
          secondary: '#E0F2FE', // sky-100
          textOnPrimary: '#ffffff',
          accentText: '#0369a1', // sky-700
          icon: <HeartPulse className="shrink-0" size={48} strokeWidth={1.5} />,
          header: "flex flex-col sm:flex-row justify-between items-center p-6 md:p-10 lg:p-12",
          customerSection: "grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 md:px-10 md:py-8 lg:px-12",
          tableStyle: "px-4 sm:px-8 md:px-10 lg:px-12",
          border: "border-l-[12px] md:border-l-[16px] border-sky-500"
        };
      case 'pharmacy':
        return {
          primary: '#10b981', // emerald-500
          secondary: '#D1FAE5', // emerald-100
          textOnPrimary: '#ffffff',
          accentText: '#047857', // emerald-700
          icon: <Pill className="shrink-0" size={48} strokeWidth={1.5} />,
          header: "flex flex-col sm:flex-row-reverse justify-between items-center p-6 md:p-10 lg:p-12",
          customerSection: "grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 md:px-10 md:py-8 lg:px-12 sm:text-right",
          tableStyle: "px-4 sm:px-8 md:px-10 lg:px-12",
          border: "border-r-[12px] md:border-r-[16px] border-emerald-500"
        };
      case 'electricity':
      case 'water': {
        const color = data.theme === 'electricity' ? '#f59e0b' : '#3b82f6';
        const bgColor = data.theme === 'electricity' ? '#FEF3C7' : '#DBEAFE';
        const accentColor = data.theme === 'electricity' ? '#b45309' : '#1d4ed8';
        return {
          primary: color,
          secondary: bgColor,
          textOnPrimary: '#ffffff',
          accentText: accentColor,
          icon: data.theme === 'electricity' ? <Zap size={48} strokeWidth={1.5} /> : <Droplets size={48} strokeWidth={1.5} />,
          header: "grid grid-cols-1 sm:grid-cols-2 gap-6 p-6 md:p-10 lg:p-12",
          customerSection: "grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 md:px-10 md:py-8 lg:px-12",
          tableStyle: "px-4 sm:px-8 md:px-10 lg:px-12",
          border: `border-t-[12px] md:border-t-[16px] border-[${color}]`
        };
      }
      case 'retail':
      default:
        return {
          primary: '#9061AF', // original purple
          secondary: '#E1E49C', // original yellow/green
          textOnPrimary: '#ffffff',
          accentText: '#7e22ce', // purple-700
          icon: <ShoppingBag className="shrink-0" size={48} strokeWidth={1.5} />,
          header: "flex flex-col sm:flex-row justify-between items-center p-6 md:p-10 lg:p-12",
          customerSection: "grid grid-cols-1 sm:grid-cols-2 gap-8 p-6 md:px-10 md:py-8 lg:px-12",
          tableStyle: "px-4 sm:px-8 md:px-10 lg:px-12",
          border: "border-b-[12px] md:border-b-[16px] border-[#9061AF]"
        };
    }
  };

  const style = getInvoiceStyle();

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const formatNumber = (num?: number) => {
    return (num || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  return (
    <div className={cn("invoice-layout-root flex flex-col bg-white text-slate-800 font-modern text-[13px] relative min-h-[1123px]", style.border)}>
      {/* Background Industry Icon */}
      {data.showIndustryBackground && (
        <div className="absolute inset-x-0 bottom-0 top-48 pointer-events-none flex items-center justify-center opacity-[0.04] z-0 select-none">
          <div className="transform scale-[12]">
            {React.cloneElement(style.icon as React.ReactElement<LucideProps>, { strokeWidth: 0.5, className: 'text-slate-900' })}
          </div>
        </div>
      )}

      {/* Watermark */}
      {data.showWatermark && (
        <div className="absolute inset-x-0 bottom-0 top-48 pointer-events-none flex items-center justify-center opacity-[0.02] z-0 overflow-hidden select-none">
          <div className="transform -rotate-45 text-[150px] font-black uppercase tracking-[0.2em] whitespace-nowrap text-slate-900">
            {data.company?.name?.split(' ')[0] || 'OFFICIAL'}
          </div>
        </div>
      )}

      {/* Dynamic Header */}
      <header className={cn("shrink-0 relative z-10", style.header)} style={{ backgroundColor: style.primary, color: style.textOnPrimary }}>
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="bg-transparent w-28 h-28 flex items-center justify-center overflow-hidden shrink-0">
            {data.company?.logoUrl && (
              <img 
                src={data.company.logoUrl} 
                alt="Logo" 
                className="max-w-full max-h-full object-contain" 
              />
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-xl md:text-2xl font-black mb-1 leading-tight uppercase">{data.company?.name || 'Company Name'}</h1>
            <div className="text-[11px] opacity-90 space-y-0.5 font-medium uppercase">
              {data.company?.address && <p className="flex items-center gap-1.5 justify-center sm:justify-start"><MapPin size={10} /> {data.company.address}</p>}
              <div className="flex flex-wrap gap-x-4 justify-center sm:justify-start">
                {data.company?.phone && <p className="flex items-center gap-1.5"><Phone size={10} /> {data.company.phone}</p>}
                {data.company?.email && <p className="flex items-center gap-1.5"><Mail size={10} /> {data.company.email}</p>}
              </div>
              {data.company?.website && <p className="flex items-center gap-1.5 justify-center sm:justify-start"><Globe size={10} /> {data.company.website}</p>}
              {data.company?.taxId && <p className="flex items-center gap-1.5 justify-center sm:justify-start uppercase tracking-wider font-bold"><Fingerprint size={10} /> TAX: {data.company.taxId}</p>}
            </div>
          </div>
        </div>
        <div className="flex flex-col items-center sm:items-end">
          <div className="flex flex-col items-center sm:items-end gap-2">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-60">ID: {data.id.slice(0, 8).toUpperCase()}</p>
            <div className={cn(
              "flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm border",
              data.status === 'paid' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600" : 
              data.status === 'pending' ? "bg-amber-500/10 border-amber-500/20 text-amber-600" : 
              "bg-red-500/10 border-red-500/20 text-red-600"
            )} style={{ 
              backgroundColor: data.status === 'paid' ? '#ecfdf5' : data.status === 'pending' ? '#fffbeb' : '#fef2f2',
              borderColor: data.status === 'paid' ? '#10b98120' : data.status === 'pending' ? '#f59e0b20' : '#ef444420',
              color: data.status === 'paid' ? '#059669' : data.status === 'pending' ? '#d97706' : '#dc2626'
            }}>
              {data.status === 'paid' ? <CheckCircle2 size={10} /> : data.status === 'pending' ? <Clock size={10} /> : <XCircle size={10} />}
              {data.status}
            </div>
          </div>
        </div>
      </header>

      {/* Industry Specific Layouts */}
      <div className="px-8 md:px-12 pt-8 relative z-10">
        {data.theme === 'hospital' && data.medicalData && <MedicalLayout data={data.medicalData} />}
        {data.theme === 'pharmacy' && data.medicalData && <MedicalLayout data={data.medicalData} />}
        {(data.theme === 'electricity' || data.theme === 'water') && data.utilityData && (
          <UtilityLayout data={data.utilityData} colorClass={style.accentText} />
        )}
      </div>

      {/* Dynamic Bill To & Info Section */}
      <div className={cn("shrink-0 relative z-10", style.customerSection)}>
        <div className={style.customerSection.includes('text-right') ? 'flex flex-col items-end' : ''}>
          <h2 className="text-xs font-black uppercase tracking-widest mb-3 border-b pb-1 w-full max-w-[250px]" style={{ color: style.accentText, borderColor: `${style.primary}20` }}>
            {term.customerGreeting}
          </h2>
          <div className="space-y-0.5">
            <p className="font-black text-base text-slate-900 uppercase">{data.customerName || 'Cash Customer'}</p>
            {data.customerAddress && <p className="text-slate-500 leading-relaxed max-w-[250px] uppercase text-[11px] font-bold">{data.customerAddress}</p>}
            {data.customerPhone && <p className="text-slate-400 font-bold text-[11px] uppercase">TEL: {data.customerPhone}</p>}
          </div>
        </div>
        <div className={cn("flex flex-col gap-2", style.customerSection.includes('text-right') ? 'items-start' : 'items-end')}>
          <div className="flex gap-4 items-baseline">
            <span className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Date :</span>
            <span className="font-black text-slate-900 text-sm">{formatDate(data.date)}</span>
          </div>
          {data.dueDate && (
            <div className="flex gap-4 items-baseline">
              <span className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Due Date :</span>
              <span className="font-black text-slate-900 text-sm">{formatDate(data.dueDate)}</span>
            </div>
          )}
          <div className="flex gap-4 items-baseline">
            <span className="font-black text-slate-400 uppercase text-[10px] tracking-widest">Method :</span>
            <span className="font-black text-slate-900 text-sm uppercase">{data.paymentMethod}</span>
          </div>
        </div>
      </div>

      {/* Dynamic Table Section */}
      <div className={cn("flex-grow overflow-hidden relative z-10", style.tableStyle)}>
        <table className="w-full border-collapse">
          <thead>
            <tr className="font-black uppercase text-[10px] tracking-widest" style={{ backgroundColor: style.secondary, color: style.accentText }}>
              <th className="py-4 px-4 text-left w-12">#</th>
              <th className="py-4 px-4 text-left">{term.itemsLabel}</th>
              <th className="py-4 px-4 text-center w-24">Qty</th>
              <th className="py-4 px-4 text-right w-32">Rate</th>
              <th className="py-4 px-4 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody>
            {(data.items || []).map((item, index) => (
              <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-colors">
                <td className="py-4 px-4 text-slate-400 font-black">{index + 1}</td>
                <td className="py-4 px-4">
                  <p className="font-black text-slate-800 uppercase tracking-tight text-sm">{item.description || 'General Service'}</p>
                  {item.code && <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">{term.itemCodeLabel}: {item.code}</p>}
                </td>
                <td className="py-4 px-4 text-center font-black text-slate-500">{item.quantity}</td>
                <td className="py-4 px-4 text-right font-black text-slate-500">{data.currency}{formatNumber(item.price)}</td>
                <td className="py-4 px-4 text-right font-black text-slate-900 text-sm">{data.currency}{formatNumber(item.quantity * item.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dynamic Summary Section */}
      <div className="p-6 md:p-10 lg:p-12 grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-12 items-end shrink-0 relative z-10">
        <div className="space-y-4">
          {data.notes && (
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Notes & Terms</h3>
              <p className="text-[11px] text-slate-600 font-bold leading-relaxed uppercase italic">{data.notes}</p>
            </div>
          )}
        </div>
        <div className="space-y-2 flex flex-col items-end">
          <div className="w-full sm:max-w-[400px] space-y-2">
            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">
              <span>Subtotal</span>
              <span className="text-slate-900">{data.currency}{formatNumber(data.subtotal)}</span>
            </div>
            {data.taxAmount > 0 && (
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">
                <span>Tax ({data.taxRate}%)</span>
                <span className="text-slate-900">{data.currency}{formatNumber(data.taxAmount)}</span>
              </div>
            )}
            {data.discount > 0 && (
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-red-500 px-2">
                <span>Discount</span>
                <span>{data.currency}{formatNumber(Math.abs(data.discount))}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-[12px] font-black uppercase tracking-widest text-slate-900 py-2 bg-slate-50/50 px-4 rounded-lg">
              <span>Grand Total</span>
              <span>{data.currency}{formatNumber(Math.max(0, data.total))}</span>
            </div>
            {data.paidAmount !== undefined && data.paidAmount > 0 && (
              <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 px-2">
                <span>Paid ({formatDate(data.paidDate)})</span>
                <span className="text-emerald-600">{data.currency}{formatNumber(Math.abs(data.paidAmount))}</span>
              </div>
            )}
            
            <div className="flex flex-col sm:flex-row items-stretch mt-6 shadow-xl rounded-xl overflow-hidden border w-full min-h-[64px]" style={{ borderColor: `${style.primary}20` }}>
              <div className="px-4 py-3 sm:py-0 font-black uppercase text-[10px] tracking-[0.1em] flex items-center justify-center shrink-0 bg-slate-100 sm:border-r border-slate-200/50" style={{ backgroundColor: style.primary, color: style.textOnPrimary }}>
                Balance
              </div>
              <div className="px-4 py-3 sm:py-0 font-black text-lg md:text-xl flex items-center justify-end flex-grow min-w-0 break-all sm:whitespace-nowrap" style={{ backgroundColor: style.secondary, color: style.accentText }}>
                {data.currency}{formatNumber(balanceDue)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Footer Area */}
      <footer className="p-6 md:p-10 lg:p-12 mt-auto shrink-0 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 relative z-10 border-t border-slate-50">
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] max-w-[400px] text-center sm:text-left">
          {data.footerText || term.footerDefault}
        </div>
        <div className="flex flex-col items-center sm:items-end gap-2">
          <div className="bg-white p-2 border-2 border-slate-900 rounded-xl select-none shadow-sm">
            <div className="flex gap-0.5">
              {[1,3,1,2,1,4,1,3,2,1,3,1,1,2,3,1,2,1,2,1].map((w, i) => (
                <div key={i} className="h-8 bg-black" style={{ width: `${w}px` }}></div>
              ))}
            </div>
          </div>
          <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Transaction ID: {data.id.toUpperCase()}</p>
        </div>
      </footer>
    </div>
  );
};