import React, { forwardRef } from 'react';
import type { ReceiptData } from '../model';
import { 
  Phone, MapPin, Calendar, Clock, HeartPulse, Zap, 
  Droplets, Globe, Mail, Fingerprint, Pill, ShoppingBag
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getIndustryTerminology } from '../utils/terminology';
import { MedicalLayout } from './layouts/MedicalLayout';
import { UtilityLayout } from './layouts/UtilityLayout';
import { InvoiceLayout } from './layouts/InvoiceLayout';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReceiptPreviewProps {
  data: ReceiptData;
}

const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(({ data }, ref) => {
  const term = getIndustryTerminology(data.theme);
  const isInvoice = data.documentType === 'invoice';
  
  const formatNumber = (num?: number) => {
    return (num || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  if (isInvoice) {
    return (
      <div 
        ref={ref}
        className="receipt-container w-full max-w-[800px] mx-auto shadow-2xl overflow-hidden print:shadow-none bg-white min-h-[1123px]"
      >
        <InvoiceLayout data={data} />
      </div>
    );
  }

  if (!isInvoice) {
    const getReceiptStyle = () => {
      switch (data.theme) {
        case 'hospital':
          return {
            container: "bg-white p-8 shadow-xl font-sans text-[12px] text-slate-800 border-l-[12px] border-sky-500 max-w-[420px]",
            header: "flex justify-between items-start mb-8 text-left",
            divider: "border-t-2 border-sky-100 my-4",
            accent: "text-sky-600 font-black",
            tableHeader: "bg-sky-50 text-sky-800",
            title: "MEDICAL RECORD & RECEIPT",
            icon: <HeartPulse className="text-sky-600" size={48} strokeWidth={1.5} />
          };
        case 'pharmacy':
          return {
            container: "bg-white p-8 shadow-xl font-modern text-[12px] text-slate-800 border-r-[12px] border-emerald-500 max-w-[420px]",
            header: "flex flex-row-reverse justify-between items-start mb-8 text-right",
            divider: "border-t-2 border-emerald-100 my-4",
            accent: "text-emerald-600 font-black",
            tableHeader: "bg-emerald-50 text-emerald-800",
            title: "PHARMACY DISPENSARY",
            icon: <Pill className="text-emerald-600" size={48} strokeWidth={1.5} />
          };
        case 'electricity':
        case 'water':
          const color = data.theme === 'electricity' ? 'amber' : 'blue';
          const Icon = data.theme === 'electricity' ? Zap : Droplets;
          return {
            container: `bg-white p-8 shadow-xl font-modern text-[12px] text-slate-800 border-t-[12px] border-${color}-500 max-w-[420px]`,
            header: "grid grid-cols-2 gap-4 mb-8 text-left",
            divider: `border-t-2 border-${color}-100 my-4`,
            accent: `text-${color}-600 font-black`,
            tableHeader: `bg-${color}-50 text-${color}-800`,
            title: "UTILITY PAYMENT ADVICE",
            icon: <Icon className={`text-${color}-600`} size={48} strokeWidth={1.5} />
          };
        case 'retail':
        default:
          return {
            container: "bg-white p-6 shadow-xl font-mono text-[12px] text-slate-800 border border-slate-100 max-w-[380px] mx-auto",
            header: "flex flex-col items-center text-center mb-6",
            divider: "border-t border-dashed border-slate-300 my-4",
            accent: "text-black font-bold",
            tableHeader: "bg-slate-50 text-black",
            title: "SALES RECEIPT",
            icon: <ShoppingBag className="text-black" size={48} strokeWidth={1.5} />
          };
      }
    };

    const style = getReceiptStyle();

    return (
      <div ref={ref} className={cn("relative overflow-hidden", style.container)}>
        {/* Background Industry Icon */}
        {data.showIndustryBackground && (
          <div className="absolute inset-x-0 bottom-0 top-32 pointer-events-none flex items-center justify-center opacity-[0.04] z-0 select-none">
            <div className="transform scale-[8]">
              {React.cloneElement(style.icon as React.ReactElement<any>, { strokeWidth: 0.5, className: 'text-slate-900' })}
            </div>
          </div>
        )}

        {/* Watermark */}
        {data.showWatermark && (
          <div className="absolute inset-x-0 bottom-0 top-32 pointer-events-none flex items-center justify-center opacity-[0.02] z-0 overflow-hidden select-none">
            <div className="transform -rotate-45 text-[80px] font-black uppercase tracking-[0.2em] whitespace-nowrap text-slate-900">
              {data.company?.name?.split(' ')[0] || 'OFFICIAL'}
            </div>
          </div>
        )}

        {/* Dynamic Header */}
        <div className={cn("relative z-10", style.header)}>
          <div className="flex flex-col gap-1">
            <div className="mb-2">
              {data.company?.logoUrl ? (
                <img 
                  src={data.company.logoUrl} 
                  alt="Logo" 
                  className="w-14 h-14 object-contain" 
                />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center bg-transparent">
                  {React.cloneElement(style.icon as React.ReactElement<any>, { size: 48, strokeWidth: 1.25 })}
                </div>
              )}
            </div>
            <h1 className="text-base font-black uppercase tracking-tight leading-none">{data.company?.name}</h1>
            <p className="text-[10px] opacity-70 leading-tight max-w-[180px]">{data.company?.address}</p>
            <p className="text-[10px] opacity-70">{data.company?.phone}</p>
          </div>
          <div className={cn("flex flex-col", style.header.includes('text-right') ? 'items-end' : 'items-start md:items-end')}>
            <h2 className={cn("text-lg font-black tracking-tighter", style.accent)}>{style.title}</h2>
            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">NO: {data.id.slice(0, 8).toUpperCase()}</p>
            <div className="mt-4 text-[10px] space-y-0.5">
              <p className="flex items-center gap-2 justify-end opacity-60 font-bold">DATE: {data.date}</p>
              <p className="flex items-center gap-2 justify-end opacity-60 font-bold">TIME: {data.time}</p>
            </div>
          </div>
        </div>

        <div className={style.divider}></div>

        {/* Industry Specific Data for Receipt */}
        <div className="relative z-10 mb-4">
          {data.theme === 'hospital' && data.medicalData && <MedicalLayout data={data.medicalData} />}
          {data.theme === 'pharmacy' && data.medicalData && <MedicalLayout data={data.medicalData} />}
          {(data.theme === 'electricity' || data.theme === 'water') && data.utilityData && (
            <UtilityLayout data={data.utilityData} colorClass={style.accent} />
          )}
        </div>

        {/* Dynamic Customer Details */}
        <div className="mb-6 relative z-10">
          <p className={cn("text-[9px] font-black uppercase tracking-widest mb-2", style.accent)}>{term.customerGreeting}</p>
          <div className="grid grid-cols-2 gap-y-1 text-[10px]">
            <span className="font-bold opacity-50 uppercase">{term.customerLabel}:</span>
            <span className="font-black text-right uppercase">{data.customerName || 'Walk-in Customer'}</span>
            
            {data.customerPhone && (
              <>
                <span className="font-bold opacity-50 uppercase">Contact:</span>
                <span className="font-black text-right uppercase">{data.customerPhone}</span>
              </>
            )}
            
            <span className="font-bold opacity-50 uppercase">Method:</span>
            <span className="font-black text-right uppercase">{data.paymentMethod}</span>
          </div>
        </div>

        <div className={style.divider}></div>

        {/* Dynamic Items Table */}
        <div className="relative z-10">
          <table className="w-full mb-6">
            <thead>
              <tr className={cn("text-left font-black uppercase text-[9px] tracking-widest", style.tableHeader)}>
                <th className="py-2 px-2">{term.itemsLabel}</th>
                <th className="py-2 px-2 text-center w-12">Qty</th>
                <th className="py-2 px-2 text-right w-20">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 divide-dashed">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-2">
                    <span className="block font-black uppercase tracking-tighter leading-none">{item.description || 'General Service'}</span>
                    {item.code && <span className="text-[8px] opacity-40 uppercase tracking-widest mt-1 inline-block">{item.code}</span>}
                  </td>
                  <td className="py-3 px-2 text-center align-top font-bold text-slate-500">{item.quantity}</td>
                  <td className="py-3 px-2 text-right align-top font-black text-slate-900">{data.currency}{formatNumber(item.quantity * item.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={cn("relative z-10", style.divider)}></div>

        {/* Notes & Totals Section */}
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="text-[10px]">
            {data.notes && (
              <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100">
                <p className={cn("font-black uppercase tracking-widest mb-1", style.accent)}>Notes & Terms</p>
                <p className="opacity-70 leading-relaxed uppercase italic font-bold">{data.notes}</p>
              </div>
            )}
          </div>
          <div className="space-y-1 text-right uppercase text-[10px]">
            <div className="flex justify-between">
              <span className="font-bold opacity-50">Subtotal:</span>
              <span className="font-black">{data.currency}{formatNumber(data.subtotal)}</span>
            </div>
            {data.taxAmount > 0 && (
              <div className="flex justify-between">
                <span className="font-bold opacity-50">Tax ({data.taxRate}%):</span>
                <span className="font-black">{data.currency}{formatNumber(data.taxAmount)}</span>
              </div>
            )}
            {data.discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span className="font-bold opacity-50">Discount:</span>
                <span className="font-black">{data.currency}{formatNumber(Math.abs(data.discount))}</span>
              </div>
            )}
            <div className={cn("flex justify-between text-base pt-3 border-t border-slate-100 mt-2", style.accent)}>
              <span className="font-black tracking-tighter">TOTAL PAID:</span>
              <span className="font-black tracking-tighter">{data.currency}{formatNumber(Math.max(0, data.total))}</span>
            </div>
          </div>
        </div>

        {/* Dynamic Footer */}
        <div className="mt-8 pt-6 border-t border-dashed border-slate-200 text-center space-y-4 relative z-10">
          <p className={cn("uppercase font-black tracking-[0.2em] text-sm", 
            data.status === 'paid' ? 'text-green-600' : 
            data.status === 'pending' ? 'text-amber-500' : 
            'text-red-500'
          )}>
            *** {data.status} ***
          </p>
          <p className="text-[9px] font-medium leading-relaxed italic px-4 opacity-60">
            {data.footerText || term.footerDefault}
          </p>
          
          <div className="flex flex-col items-center gap-2 pt-4 opacity-30">
            <div className="flex gap-0.5">
              {[1,2,4,1,2,3,1,5,1,2,4,1,3,1,2,1].map((w, i) => (
                <div key={i} className="h-6 bg-black" style={{ width: `${w}px` }}></div>
              ))}
            </div>
            <p className="text-[7px] tracking-[0.4em] font-black">{data.id.toUpperCase()}</p>
          </div>
        </div>
      </div>
    );
  }
});

ReceiptPreview.displayName = 'ReceiptPreview';

export default ReceiptPreview;
