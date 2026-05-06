import { forwardRef } from 'react';
import type { ReceiptData } from '../model';
import { 
  HeartPulse, Zap, 
  Droplets, Pill, ShoppingBag
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { getIndustryTerminology } from '../utils/terminology';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
import { MedicalLayout } from './layouts/MedicalLayout';
import { UtilityLayout } from './layouts/UtilityLayout';
import { InvoiceLayout } from './layouts/InvoiceLayout';

interface ReceiptPreviewProps {
  data: ReceiptData;
}

const ReceiptPreview = forwardRef<HTMLDivElement, ReceiptPreviewProps>(({ data }, ref) => {
  const term = getIndustryTerminology(data.theme);
  const isInvoice = data.documentType === 'invoice';
  
  const formatNumber = (num?: number) => {
    return (num || 0).toLocaleString(undefined, { minimumFractionDigits: 2 });
  };

  const Watermark = () => {
    if (!data.showWatermark) return null;
    const text = data.status === 'paid' ? 'PAID' : 'DRAFT';
    const color = data.status === 'paid' ? 'text-emerald-500/5' : 'text-amber-500/5';
    
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <span className={cn(
          "text-[80px] font-black uppercase tracking-[0.2em] -rotate-12 select-none whitespace-nowrap",
          color
        )}>
          {text}
        </span>
      </div>
    );
  };

  const CompanyLogo = () => {
    if (!data.company.logoUrl) return null;
    return (
      <div className="mb-4 h-12 w-auto flex items-center justify-center">
        <img src={data.company.logoUrl} alt="Logo" className="h-full object-contain" />
      </div>
    );
  };

  if (isInvoice) {
    return (
      <div 
        ref={ref}
        className="invoice-layout-root w-full max-w-[800px] mx-auto shadow-2xl overflow-hidden bg-white min-h-[1123px] print:min-h-0"
      >
        <InvoiceLayout data={data} />
      </div>
    );
  }

  // --- Receipt Templates (Non-Invoice) ---

  const HospitalReceipt = () => (
    <div className="receipt-preview-root bg-white p-8 shadow-xl font-sans text-[12px] text-slate-800 border-l-[12px] border-sky-500 max-w-[420px] mx-auto rounded-r-3xl relative overflow-hidden min-h-[500px]">
      <Watermark />
      <div className="relative z-10 h-full flex flex-col">
        <CompanyLogo />
        <div className="flex justify-between items-start mb-10">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 uppercase tracking-tighter leading-none">{data.company?.name || 'Medical Center'}</h1>
            <p className="text-[9px] text-sky-600 font-bold uppercase tracking-widest">Medical Service Center</p>
            <div className="pt-2 text-[8px] text-slate-400 font-bold uppercase space-y-0.5 leading-tight">
              <p>{data.company?.address}</p>
              <p>TEL: {data.company?.phone} • {data.company?.email}</p>
            </div>
          </div>
          {!data.company.logoUrl && (
            <div className="bg-sky-50 p-3 rounded-2xl shrink-0">
              <HeartPulse size={32} strokeWidth={1.5} className="text-sky-500" />
            </div>
          )}
        </div>

      <div className="space-y-6 flex-grow">
        <div className="bg-sky-50/50 p-4 rounded-2xl border border-sky-100 space-y-2">
          <div className="flex justify-between items-end">
            <div className="space-y-1 text-left">
              <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Patient Record</p>
              <p className="text-sm font-black text-slate-900 uppercase">{data.customerName || 'Walking Patient'}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">ID: #{data.id.slice(0, 6).toUpperCase()}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">{data.date}</p>
            </div>
          </div>
          {data.dueDate && (
            <div className="pt-2 border-t border-sky-100 flex justify-between items-center">
              <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Follow-up Due</p>
              <p className="text-[9px] font-bold text-slate-900">{data.dueDate}</p>
            </div>
          )}
        </div>

        <MedicalLayout data={data.medicalData || { doctorName: 'Attending Staff', wardNumber: 'N/A' }} />

        <div className="space-y-2">
          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest px-2">Billable Services</p>
          <table className="w-full">
            <tbody className="divide-y divide-slate-50">
              {data.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 px-2">
                    <p className="font-black text-slate-900 uppercase">{item.description}</p>
                    <p className="text-[8px] text-slate-400 font-bold uppercase">Unit Price: {data.currency}{formatNumber(item.price)}</p>
                  </td>
                  <td className="py-3 px-2 text-right font-black text-slate-900">
                    {data.currency}{formatNumber(item.quantity * item.price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-6 border-t-2 border-sky-500 flex justify-between items-center">
          <div>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Total Amount</p>
            <p className="text-sm font-black text-slate-900 uppercase">Settled in Full</p>
          </div>
          <p className="text-3xl font-black text-sky-600 tracking-tighter">{data.currency}{formatNumber(data.total)}</p>
        </div>
      </div>

      <footer className="mt-10 text-center space-y-4 border-t border-slate-50 pt-6">
        <p className="text-[9px] font-bold text-slate-400 uppercase leading-relaxed italic px-4">{data.footerText || term.footerDefault}</p>
        <div className="flex justify-center gap-2">
          <div className="w-1.5 h-1.5 bg-sky-200 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-sky-500 rounded-full"></div>
          <div className="w-1.5 h-1.5 bg-sky-200 rounded-full"></div>
        </div>
      </footer>
      </div>
    </div>
  );

  const PharmacyReceipt = () => (
    <div className="receipt-preview-root bg-white p-8 shadow-xl font-sans text-[12px] text-slate-800 border-r-[12px] border-emerald-500 max-w-[420px] mx-auto relative overflow-hidden min-h-[500px]">
      <Watermark />
      <div className="relative z-10 h-full flex flex-col">
        <CompanyLogo />
        <header className="flex justify-between items-start mb-10">
          <div className="space-y-1">
            <h1 className="text-lg font-black text-slate-900 uppercase leading-none">{data.company?.name || 'Pharmacy Store'}</h1>
            <p className="text-[10px] text-slate-400 font-bold uppercase">{data.company?.address || 'Wellness District'}</p>
            <div className="pt-2 text-[8px] text-emerald-600 font-bold uppercase space-y-0.5">
              <p>TEL: {data.company?.phone}</p>
              <p>{data.company?.email} • {data.company?.website}</p>
            </div>
          </div>
          {!data.company.logoUrl && (
            <Pill size={40} className="text-emerald-500 shrink-0" />
          )}
        </header>

      <div className="space-y-8 flex-grow">
        <div className="bg-emerald-50 p-4 rounded-xl space-y-2">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">Dispensation Details</p>
              <p className="text-xs font-black text-slate-900 uppercase">Patient: {data.customerName || 'Walking Client'}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-emerald-400 uppercase">Ref: #{data.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase">{data.date}</p>
            </div>
          </div>
          <div className="pt-2 border-t border-emerald-100 flex justify-between items-center">
            <p className="text-[9px] text-emerald-600 font-bold uppercase">Pharmacist: {data.medicalData?.doctorName || 'Authorized Staff'}</p>
            {data.dueDate && <p className="text-[9px] text-emerald-500 font-black uppercase">Valid Until: {data.dueDate}</p>}
          </div>
        </div>

        <table className="w-full">
          <tbody className="divide-y divide-dashed divide-emerald-100">
            {data.items.map((item) => (
              <tr key={item.id}>
                <td className="py-4">
                  <p className="font-black text-slate-900 uppercase">{item.description}</p>
                  <p className="text-[9px] text-emerald-600 font-bold">Ref: {item.code || 'RX-ITEM'}</p>
                </td>
                <td className="py-4 text-right">
                  <p className="text-[10px] text-slate-400 font-bold">{item.quantity} x {formatNumber(item.price)}</p>
                  <p className="font-black text-slate-900">{data.currency}{formatNumber(item.quantity * item.price)}</p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="space-y-2 text-right">
          <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
            <span>Subtotal</span>
            <span>{data.currency}{formatNumber(data.subtotal)}</span>
          </div>
          <div className="flex justify-between text-lg font-black text-emerald-600 uppercase border-t-2 border-emerald-500 pt-4">
            <span>Total</span>
            <span>{data.currency}{formatNumber(data.total)}</span>
          </div>
        </div>
      </div>

      <footer className="mt-12 text-center text-[9px] font-bold text-slate-400 uppercase border-t border-emerald-50 pt-6">
        <p>{data.notes || 'Your health is our priority.'}</p>
      </footer>
      </div>
    </div>
  );

  const ElectricityReceipt = () => (
    <div className="receipt-preview-root bg-slate-900 text-white p-0 shadow-xl font-mono text-[12px] max-w-[420px] mx-auto overflow-hidden relative min-h-[500px]">
      <Watermark />
      <div className="relative z-10 h-full flex flex-col">
      <div className="bg-white text-slate-900 p-8 space-y-8 flex-grow">
        <CompanyLogo />
        <div className="flex justify-between items-center">
          {!data.company.logoUrl && (
            <Zap size={48} className="text-amber-500" />
          )}
          <div className="text-right space-y-1">
            <h1 className="text-lg font-black uppercase tracking-tight">{data.documentType === 'invoice' ? 'Power Invoice' : 'Power Receipt'}</h1>
            <div className="text-[8px] font-bold text-slate-400 uppercase leading-tight">
              <p>{data.company?.name}</p>
              <p>{data.company?.address}</p>
              <p>TEL: {data.company?.phone} • {data.company?.email}</p>
            </div>
            <p className="text-[9px] font-bold text-amber-500 uppercase mt-2">Ref: #{data.id.slice(0, 8).toUpperCase()}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-[10px] font-black uppercase tracking-widest">
          <div className="space-y-1">
            <p className="text-slate-300">Subscriber</p>
            <p className="text-slate-900">{data.customerName || 'Consumer'}</p>
          </div>
          <div className="text-right space-y-1">
            <p className="text-slate-300">Date</p>
            <p className="text-slate-900">{data.date}</p>
          </div>
        </div>

        <UtilityLayout data={data.utilityData || { meterNumber: 'E-0000', previousReading: 0, currentReading: 0, consumptionUnit: 'kWh' }} colorClass="text-amber-600" />
      </div>
      
      <div className="bg-amber-500 p-8">
        <div className="flex justify-between items-center">
          <p className="text-xs font-black uppercase tracking-[0.3em]">Amount Paid</p>
          <p className="text-3xl font-black tracking-tighter">{data.currency}{formatNumber(data.total)}</p>
        </div>
        <p className="text-[9px] mt-4 opacity-70 font-black uppercase tracking-widest">Transaction Verified • {data.date}</p>
      </div>
      </div>
    </div>
  );

  const WaterReceipt = () => (
    <div className="receipt-preview-root bg-blue-600 p-1 shadow-xl font-serif text-[12px] max-w-[420px] mx-auto overflow-hidden rounded-3xl relative min-h-[500px]">
      <Watermark />
      <div className="bg-white rounded-[1.4rem] p-8 space-y-8 relative z-10 h-full flex flex-col">
        <CompanyLogo />
        <div className="flex flex-col items-center text-center space-y-4">
          {!data.company.logoUrl && (
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Droplets size={32} className="text-blue-500" />
            </div>
          )}
          <div>
            <h1 className="text-xl font-black text-blue-900 uppercase tracking-tighter italic">{data.company?.name || 'Water Authority'}</h1>
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-[0.3em]">Water Supply Authority</p>
            <div className="pt-2 text-[8px] text-blue-400 font-bold uppercase space-y-0.5">
              <p>{data.company?.address}</p>
              <p>TEL: {data.company?.phone} • {data.company?.email}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 flex-grow">
          <div className="flex justify-between items-end border-b border-blue-50 pb-4">
            <div className="text-left">
              <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest">Subscriber</p>
              <p className="text-sm font-black text-slate-900 uppercase">{data.customerName || 'Subscriber'}</p>
            </div>
            <div className="text-right">
              <p className="text-[9px] font-black text-blue-200 uppercase tracking-widest">Date</p>
              <p className="text-xs font-bold text-slate-900">{data.date}</p>
            </div>
          </div>

          <UtilityLayout data={data.utilityData || { meterNumber: 'W-0000', previousReading: 0, currentReading: 0, consumptionUnit: 'm³' }} colorClass="text-blue-600" />
        </div>

        <div className="bg-blue-50 p-6 rounded-2xl flex justify-between items-center">
          <p className="text-xs font-black text-blue-900 uppercase">Paid in Full</p>
          <p className="text-3xl font-black text-blue-600 tracking-tighter">{data.currency}{formatNumber(data.total)}</p>
        </div>

        <footer className="text-center">
          <p className="text-[9px] font-bold text-blue-200 uppercase tracking-widest italic">{data.footerText || term.footerDefault}</p>
        </footer>
      </div>
    </div>
  );

  const RetailReceipt = () => (
    <div className="receipt-preview-root bg-white p-6 shadow-xl font-mono text-[11px] text-slate-900 border border-slate-100 max-w-[340px] mx-auto relative overflow-hidden min-h-[500px]">
      <Watermark />
      <div className="relative z-10 h-full flex flex-col">
      <CompanyLogo />
      <div className="text-center space-y-4 mb-8">
        {!data.company.logoUrl && (
          <ShoppingBag size={32} className="mx-auto text-slate-400" />
        )}
        <div className="space-y-1">
          <h1 className="text-base font-black uppercase tracking-tight">{data.company?.name || 'Retail Store'}</h1>
          <p className="text-[9px] font-bold uppercase text-slate-400">{data.company?.address || 'City Center'}</p>
          <div className="text-[8px] font-bold uppercase text-slate-300 space-y-0.5">
            <p>TEL: {data.company?.phone || '000-000-0000'}</p>
            <p>{data.company?.email} • {data.company?.website}</p>
          </div>
        </div>
      </div>

      <div className="border-t border-dashed border-slate-300 my-4"></div>

      <div className="space-y-1 mb-6 uppercase text-[9px] font-bold">
        <div className="flex justify-between"><span>Date:</span> <span>{data.date}</span></div>
        <div className="flex justify-between"><span>Time:</span> <span>{data.time}</span></div>
        <div className="flex justify-between text-slate-400"><span>Sale ID:</span> <span>#{data.id.toUpperCase()}</span></div>
        <div className="flex justify-between"><span>Method:</span> <span className="text-slate-900">{data.paymentMethod}</span></div>
      </div>

      <div className="border-t border-dashed border-slate-300 my-4"></div>

      <table className="w-full mb-6">
        <thead>
          <tr className="text-left font-black uppercase text-[9px]">
            <th className="py-2">Item</th>
            <th className="py-2 text-right">Amt</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-dashed divide-slate-100">
          {data.items.map((item) => (
            <tr key={item.id}>
              <td className="py-2">
                <p className="font-black uppercase">{item.description}</p>
                <p className="text-[8px] text-slate-400">{item.quantity} @ {formatNumber(item.price)}</p>
              </td>
              <td className="py-2 text-right font-black">
                {data.currency}{formatNumber(item.quantity * item.price)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="border-t border-dashed border-slate-300 my-4"></div>

      <div className="space-y-1 text-right font-black uppercase">
        <div className="flex justify-between text-[9px]"><span>Subtotal</span> <span>{data.currency}{formatNumber(data.subtotal)}</span></div>
        <div className="flex justify-between text-sm pt-2"><span>Total</span> <span>{data.currency}{formatNumber(data.total)}</span></div>
      </div>

      <footer className="mt-8 text-center space-y-4">
        <p className="text-[9px] font-bold uppercase leading-relaxed">{data.notes || 'Thank you for shopping!'}</p>
        <div className="flex flex-col items-center gap-1 pt-4 opacity-20">
          <div className="flex gap-0.5">{[1,2,4,1,2,3,1,5,1,2].map((w,i)=><div key={i} className="h-6 bg-black" style={{width:`${w}px`}}></div>)}</div>
        </div>
      </footer>
      </div>
    </div>
  );

  // --- Layout Switcher ---
  switch (data.theme) {
    case 'hospital': return <div ref={ref} className="animate-in fade-in zoom-in-95 duration-700"><HospitalReceipt /></div>;
    case 'pharmacy': return <div ref={ref} className="animate-in fade-in zoom-in-95 duration-700"><PharmacyReceipt /></div>;
    case 'electricity': return <div ref={ref} className="animate-in fade-in zoom-in-95 duration-700"><ElectricityReceipt /></div>;
    case 'water': return <div ref={ref} className="animate-in fade-in zoom-in-95 duration-700"><WaterReceipt /></div>;
    case 'retail':
    default: return <div ref={ref} className="animate-in fade-in zoom-in-95 duration-700"><RetailReceipt /></div>;
  }
});

ReceiptPreview.displayName = 'ReceiptPreview';

export default ReceiptPreview;
