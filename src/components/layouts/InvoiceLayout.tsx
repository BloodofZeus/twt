import type { ReceiptData } from '../../model';
import { 
  Fingerprint, 
  HeartPulse, Pill, Zap, Droplets, ShoppingBag
} from 'lucide-react';
import { getIndustryTerminology } from '../../utils/terminology';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InvoiceLayoutProps {
  data: ReceiptData;
}

export const InvoiceLayout: React.FC<InvoiceLayoutProps> = ({ data }) => {
  const balanceDue = Math.max(0, (data.total || 0) - (data.paidAmount || 0));
  const term = getIndustryTerminology(data.theme);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  };

  const formatNumber = (num?: number) => {
    return (num || 0).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const Watermark = () => {
    if (!data.showWatermark) return null;
    const text = data.status === 'paid' ? 'PAID' : 'PENDING';
    const color = data.status === 'paid' ? 'text-emerald-500/10' : 'text-amber-500/10';
    
    return (
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <span className={cn(
          "text-[180px] font-black uppercase tracking-[0.2em] -rotate-45 select-none",
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
      <div className="mb-6 h-16 w-auto flex items-center">
        <img src={data.company.logoUrl} alt="Logo" className="h-full object-contain" />
      </div>
    );
  };

  const ItemsTable = ({ accentClass }: { accentClass: string }) => (
    <table className="w-full text-left">
      <thead>
        <tr className={cn("border-b-2", accentClass)}>
          <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest">{term.itemsLabel}</th>
          <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-center w-20">Qty</th>
          <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right w-32">Rate</th>
          <th className="py-4 text-[10px] font-black text-slate-900 uppercase tracking-widest text-right w-32">Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-50">
        {(data.items || []).map((item) => (
          <tr key={item.id}>
            <td className="py-5">
              <p className="font-black text-slate-900 uppercase text-xs">{item.description || 'General Service'}</p>
              {item.code && (
                <p className="text-[9px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">
                  {term.itemCodeLabel}: {item.code}
                </p>
              )}
            </td>
            <td className="py-5 text-center font-bold text-slate-600">{item.quantity}</td>
            <td className="py-5 text-right font-bold text-slate-600">{data.currency}{formatNumber(item.price)}</td>
            <td className="py-5 text-right font-black text-slate-900">{data.currency}{formatNumber(item.quantity * item.price)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  const FinancialSummary = ({ accentText, bgAccent }: { accentText: string, bgAccent: string }) => (
    <div className="w-full sm:w-72 space-y-3">
      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
        <span>Subtotal</span>
        <span className="text-slate-900">{data.currency}{formatNumber(data.subtotal)}</span>
      </div>
      {data.taxAmount > 0 && (
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span>Tax ({data.taxRate}%)</span>
          <span className="text-slate-900">{data.currency}{formatNumber(data.taxAmount)}</span>
        </div>
      )}
      {data.discount > 0 && (
        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-red-400">
          <span>Adjustment</span>
          <span>-{data.currency}{formatNumber(data.discount)}</span>
        </div>
      )}
      <div className={cn("pt-4 border-t-2 flex justify-between items-center", accentText.replace('text-', 'border-'))}>
        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Total Payable</span>
        <span className={cn("text-2xl font-black tracking-tighter", accentText)}>{data.currency}{formatNumber(data.total)}</span>
      </div>
      <div className={cn("mt-4 p-4 rounded-xl flex justify-between items-center", bgAccent)}>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Balance Due</span>
        <span className={cn("text-lg font-black", accentText)}>{data.currency}{formatNumber(balanceDue)}</span>
      </div>
    </div>
  );

  // Layout Templates
  const HospitalTemplate = () => (
    <div className="flex flex-col min-h-[1123px] p-12 md:p-20 border-l-[16px] border-sky-500 bg-sky-50/10 print:min-h-0 print:h-[297mm] relative overflow-hidden">
      <Watermark />
      <header className="flex justify-between items-start mb-16 relative">
        {data.showIndustryBackground && (
          <div className="absolute -top-10 -left-10 opacity-[0.03] pointer-events-none">
            <HeartPulse size={300} strokeWidth={1} className="text-sky-900" />
          </div>
        )}
        <div className="space-y-4 relative z-10">
          <CompanyLogo />
          {!data.company.logoUrl && (
            <div className="w-20 h-20 bg-sky-500 flex items-center justify-center rounded-3xl shadow-xl shadow-sky-100">
              <HeartPulse size={48} strokeWidth={1.5} className="text-white" />
            </div>
          )}
          <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Medical Invoice</h1>
          <div className="text-[11px] text-slate-400 font-bold uppercase space-y-0.5">
            <p className="text-sky-600 font-black">{data.company?.name}</p>
            <p>{data.company?.address}</p>
            <p className="pt-1 text-[9px] opacity-70">TEL: {data.company?.phone} • {data.company?.email}</p>
            <p className="text-[9px] opacity-70">{data.company?.website}</p>
          </div>
        </div>
        <div className="text-right space-y-2 relative z-10">
          <div className="bg-white border-2 border-sky-100 p-4 rounded-2xl shadow-sm">
            <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Case Reference</p>
            <p className="text-lg font-black text-slate-900 uppercase">#{data.id.toUpperCase()}</p>
          </div>
          <div className="space-y-1 pr-2">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Date: {formatDate(data.date)}</p>
            {data.dueDate && <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Due: {formatDate(data.dueDate)}</p>}
            {data.expiryDate && <p className="text-[10px] font-black text-red-400 uppercase tracking-widest">Expires: {formatDate(data.expiryDate)}</p>}
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-8 mb-12">
        <div className="p-8 bg-white rounded-3xl border-2 border-sky-50 shadow-sm space-y-4">
          <h3 className="text-[10px] font-black text-sky-600 uppercase tracking-widest flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-sky-500 rounded-full"></div> Patient Information
          </h3>
          <div className="space-y-1">
            <p className="text-base font-black text-slate-900 uppercase">{data.customerName}</p>
            <p className="text-[11px] text-slate-500 uppercase leading-relaxed">{data.customerAddress}</p>
          </div>
        </div>
        {data.medicalData && (
          <div className="p-8 bg-sky-500 text-white rounded-3xl shadow-lg shadow-sky-100 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60">Attending Staff</h3>
              <div className="space-y-1">
                <p className="text-base font-black uppercase">{data.medicalData.doctorName || 'Attending Staff'}</p>
                <p className="text-[11px] font-bold uppercase opacity-80">Unit: {data.medicalData.wardNumber || 'General Ward'}</p>
              </div>
            </div>
            <div className="space-y-4 text-right">
              <h3 className="text-[10px] font-black uppercase tracking-widest opacity-60">Reference</h3>
              <div className="space-y-1">
                <p className="text-base font-black uppercase">{data.medicalData.patientId || 'N/A'}</p>
                <p className="text-[11px] font-bold uppercase opacity-80">Patient ID</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <main className="flex-grow bg-white rounded-3xl border border-sky-50 p-8 shadow-sm">
        <ItemsTable accentClass="border-sky-500" />
      </main>

      <footer className="mt-12 flex justify-between items-end">
        <div className="max-w-xs space-y-4 border-l-2 border-sky-200 pl-6 py-2">
          <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest italic">Medical Practitioner Notes</p>
          <p className="text-[11px] font-bold text-slate-500 leading-relaxed uppercase">{data.notes || term.footerDefault}</p>
        </div>
        <FinancialSummary accentText="text-sky-600" bgAccent="bg-sky-50" />
      </footer>
    </div>
  );

  const PharmacyTemplate = () => (
    <div className="flex flex-col min-h-[1123px] p-12 md:p-20 border-r-[16px] border-emerald-500 bg-white print:min-h-0 print:h-[297mm] relative overflow-hidden">
      <Watermark />
      <header className="flex flex-row-reverse justify-between items-start mb-16 text-right">
        <div className="space-y-6 relative">
          <CompanyLogo />
          {!data.company.logoUrl && (
            <div className="w-24 h-24 bg-emerald-500 rounded-full flex items-center justify-center ml-auto shadow-xl shadow-emerald-100 relative z-10">
              <Pill size={56} strokeWidth={1} className="text-white" />
            </div>
          )}
          {data.showIndustryBackground && (
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50"></div>
          )}
          <div className="relative z-10">
            <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Pharmacy Bill</h1>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.4em] mt-2">Certified Dispensary</p>
          </div>
        </div>
        <div className="text-left space-y-8">
          <div className="space-y-1">
            <p className="text-2xl font-black text-slate-900 uppercase tracking-tight">{data.company?.name}</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase max-w-xs">{data.company?.address}</p>
            <div className="pt-2 text-[10px] text-emerald-600 font-black uppercase space-y-0.5">
              <p>TEL: {data.company?.phone}</p>
              <p>{data.company?.email} • {data.company?.website}</p>
            </div>
          </div>
          <div className="bg-slate-50 p-6 rounded-2xl border-l-4 border-emerald-500 space-y-2">
            <div>
              <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Prescription No.</p>
              <p className="text-lg font-black text-slate-900 uppercase tracking-tight">#{data.medicalData?.patientId || data.id.toUpperCase()}</p>
            </div>
            <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div>
                <p className="text-[9px] font-black text-slate-300 uppercase">Dispensed</p>
                <p className="text-[10px] font-bold text-slate-900">{formatDate(data.date)}</p>
              </div>
              {data.dueDate && (
                 <div>
                   <p className="text-[9px] font-black text-emerald-600 uppercase">Valid Until</p>
                   <p className="text-[10px] font-bold text-emerald-700">{formatDate(data.dueDate)}</p>
                 </div>
               )}
               {data.expiryDate && (
                 <div>
                   <p className="text-[9px] font-black text-red-500 uppercase">Expiry Date</p>
                   <p className="text-[10px] font-bold text-red-600">{formatDate(data.expiryDate)}</p>
                 </div>
               )}
            </div>
          </div>
        </div>
      </header>

      <section className="mb-12 grid grid-cols-2 gap-12 p-10 bg-emerald-50/30 rounded-[2.5rem] border border-emerald-50">
        <div className="space-y-4">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Patient / Client</p>
          <div className="space-y-1">
            <p className="text-xl font-black text-slate-900 uppercase">{data.customerName}</p>
            <p className="text-[11px] text-slate-500 uppercase">{data.customerAddress}</p>
          </div>
        </div>
        <div className="text-right space-y-4">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Authorized Pharmacist</p>
          <div className="space-y-1">
            <p className="text-xl font-black text-slate-900 uppercase">{data.medicalData?.doctorName || 'Lead Pharmacist'}</p>
            <p className="text-[11px] text-slate-500 uppercase">Reg No: PH-99238</p>
          </div>
        </div>
      </section>

      <main className="flex-grow px-4">
        <ItemsTable accentClass="border-emerald-500" />
      </main>

      <footer className="mt-16 flex justify-between items-center border-t border-slate-100 pt-12">
        <div className="max-w-xs space-y-4">
          <div className="flex items-center gap-3 text-emerald-600">
            <Fingerprint size={24} />
            <p className="text-[10px] font-black uppercase tracking-widest">Digitally Authorized</p>
          </div>
          <p className="text-[11px] font-bold text-slate-400 leading-relaxed uppercase">{data.notes || 'Store medications in a cool, dry place. Keep out of reach of children.'}</p>
        </div>
        <FinancialSummary accentText="text-emerald-600" bgAccent="bg-emerald-50" />
      </footer>
    </div>
  );

  const ElectricityTemplate = () => (
    <div className="flex flex-col min-h-[1123px] p-0 border-t-[24px] border-amber-500 print:min-h-0 print:h-[297mm] relative overflow-hidden">
      <Watermark />
      <div className="p-12 md:p-20 flex-grow flex flex-col font-mono relative z-10">
        <header className="flex justify-between items-start mb-16">
          <div className="flex flex-col gap-6">
            <CompanyLogo />
            <div className="flex items-center gap-6">
              {!data.company.logoUrl && (
                <div className="w-20 h-20 bg-amber-500 flex items-center justify-center rounded-2xl shadow-lg shadow-amber-100">
                  <Zap size={48} className="text-white" />
                </div>
              )}
              <div>
                <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Power Bill</h1>
                <p className="text-[10px] font-black text-amber-600 uppercase tracking-[0.3em]">Grid Supply Invoice</p>
              </div>
            </div>
          </div>
          <div className="text-right border-l-2 border-slate-100 pl-8 space-y-1">
            <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Statement ID</p>
            <p className="text-lg font-black text-slate-900">#{data.id.toUpperCase()}</p>
            <div className="pt-2">
              <p className="text-[9px] font-black text-slate-400 uppercase">Issue Date: {formatDate(data.date)}</p>
              {data.dueDate && <p className="text-[9px] font-black text-amber-600 uppercase">Due Date: {formatDate(data.dueDate)}</p>}
              {data.expiryDate && <p className="text-[9px] font-black text-red-400 uppercase">Expiry Date: {formatDate(data.expiryDate)}</p>}
            </div>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-12 mb-16 bg-slate-50 p-10 rounded-[2rem]">
          <div className="space-y-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Subscriber Details</p>
            <div className="space-y-1">
              <p className="text-lg font-black text-slate-900 uppercase">{data.customerName}</p>
              <p className="text-xs text-slate-500 uppercase leading-relaxed">{data.customerAddress}</p>
            </div>
          </div>
          <div className="space-y-4 text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Service Provider</p>
            <div className="space-y-1">
              <p className="text-lg font-black text-slate-900 uppercase">{data.company?.name}</p>
              <p className="text-xs text-slate-500 uppercase">{data.company?.address}</p>
              <p className="text-[10px] text-amber-600 font-black uppercase">TEL: {data.company?.phone}</p>
              <p className="text-[10px] text-amber-600 font-black uppercase">{data.company?.email}</p>
            </div>
          </div>
        </section>

        {data.utilityData && (
          <div className="mb-16 grid grid-cols-4 gap-0 border-2 border-slate-900 rounded-3xl overflow-hidden">
            <div className="p-8 border-r-2 border-slate-900 bg-slate-50 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Meter No.</p>
              <p className="text-xl font-black text-slate-900">{data.utilityData.meterNumber || 'E-0000'}</p>
            </div>
            <div className="p-8 border-r-2 border-slate-900 bg-white text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Prev Reading</p>
              <p className="text-xl font-black text-slate-900">{data.utilityData.previousReading} <span className="text-[10px] opacity-30">kWh</span></p>
            </div>
            <div className="p-8 border-r-2 border-slate-900 bg-amber-50 text-center">
              <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Curr Reading</p>
              <p className="text-xl font-black text-slate-900">{data.utilityData.currentReading} <span className="text-[10px] opacity-30">kWh</span></p>
            </div>
            <div className="p-8 bg-slate-900 text-white text-center">
              <p className="text-[10px] font-black uppercase opacity-50 mb-2">Usage</p>
              <p className="text-xl font-black text-amber-500">{(data.utilityData.currentReading || 0) - (data.utilityData.previousReading || 0)} <span className="text-[10px] opacity-50">kWh</span></p>
            </div>
          </div>
        )}

        <main className="flex-grow">
          <ItemsTable accentClass="border-amber-500" />
        </main>

        <footer className="mt-16 pt-12 border-t-2 border-slate-100 flex justify-between items-end">
          <div className="max-w-xs bg-amber-50 p-6 rounded-2xl">
            <p className="text-[10px] font-black text-amber-600 uppercase mb-2">Important Notice</p>
            <p className="text-[10px] font-bold text-slate-600 leading-relaxed uppercase">{data.notes || 'Please pay by due date to avoid disconnection.'}</p>
          </div>
          <FinancialSummary accentText="text-amber-600" bgAccent="bg-amber-50" />
        </footer>
      </div>
    </div>
  );

  const WaterTemplate = () => (
    <div className="flex flex-col min-h-[1123px] bg-blue-50/20 p-12 md:p-24 font-serif print:min-h-0 print:h-[297mm] relative overflow-hidden">
      <Watermark />
      <header className="flex flex-col items-center text-center mb-20 space-y-6 relative z-10">
        <CompanyLogo />
        {!data.company.logoUrl && (
          <div className="w-24 h-24 bg-white border-4 border-blue-500 rounded-full flex items-center justify-center shadow-xl shadow-blue-100">
            <Droplets size={48} className="text-blue-500" />
          </div>
        )}
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-blue-900 uppercase tracking-tighter italic">{data.company?.name}</h1>
          <div className="h-1 w-24 bg-blue-500 mx-auto rounded-full"></div>
          <p className="text-[11px] font-black text-blue-400 uppercase tracking-[0.4em] mt-4">Water Consumption Invoice</p>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-20 mb-20">
        <div className="border-l-4 border-blue-500 pl-8 py-2 space-y-4">
          <div>
            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-3">Service Provider</p>
            <p className="text-xl font-black text-blue-900 uppercase italic">{data.company?.name}</p>
            <p className="text-[10px] text-slate-500 uppercase leading-relaxed mt-1">{data.company?.address}</p>
            <div className="pt-2 text-[10px] text-blue-500 font-black uppercase">
              <p>TEL: {data.company?.phone}</p>
              <p>{data.company?.email}</p>
            </div>
          </div>
          <div className="pt-4 border-t border-blue-50">
            <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-3">Bill To</p>
            <p className="text-xl font-black text-slate-900 uppercase">{data.customerName}</p>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed uppercase">{data.customerAddress}</p>
          </div>
        </div>
        <div className="text-right border-r-4 border-blue-100 pr-8 py-2 space-y-2">
          <p className="text-[10px] font-black text-blue-300 uppercase tracking-widest mb-1">Invoice Info</p>
          <p className="text-sm font-black text-slate-900 uppercase">NO: #{data.id.toUpperCase()}</p>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase">DATE: {formatDate(data.date)}</p>
            {data.dueDate && <p className="text-[10px] font-black text-blue-600 uppercase">DUE: {formatDate(data.dueDate)}</p>}
            {data.expiryDate && <p className="text-[10px] font-black text-red-400 uppercase">EXP: {formatDate(data.expiryDate)}</p>}
          </div>
        </div>
      </section>

      {data.utilityData && (
        <div className="mb-20 bg-white p-10 rounded-[3rem] shadow-sm border border-blue-50 flex justify-around items-center">
          <div className="text-center">
            <p className="text-[10px] font-black text-blue-300 uppercase mb-2">Meter No.</p>
            <p className="text-xl font-black text-slate-900 uppercase">{data.utilityData.meterNumber || 'W-0000'}</p>
          </div>
          <div className="h-12 w-px bg-blue-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-blue-300 uppercase mb-2">Previous</p>
            <p className="text-xl font-black text-slate-900">{data.utilityData.previousReading} m³</p>
          </div>
          <div className="h-12 w-px bg-blue-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-blue-300 uppercase mb-2">Current</p>
            <p className="text-xl font-black text-slate-900">{data.utilityData.currentReading} m³</p>
          </div>
          <div className="h-12 w-px bg-blue-100"></div>
          <div className="text-center">
            <p className="text-[10px] font-black text-blue-300 uppercase mb-2">Consumption</p>
            <p className="text-xl font-black text-blue-600">{(data.utilityData.currentReading || 0) - (data.utilityData.previousReading || 0)} m³</p>
          </div>
        </div>
      )}

      <main className="flex-grow px-4">
        <ItemsTable accentClass="border-blue-500" />
      </main>

      <footer className="mt-20 flex justify-between items-center bg-blue-900 text-white p-12 rounded-[3rem]">
        <div className="max-w-xs space-y-4">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Environmental Tip</p>
          <p className="text-xs font-bold leading-relaxed italic opacity-80 uppercase">{data.notes || 'Fixing a leaky faucet can save over 3,000 gallons of water a year.'}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">Total Amount Due</p>
          <p className="text-5xl font-black text-white tracking-tighter">{data.currency}{formatNumber(data.total)}</p>
        </div>
      </footer>
    </div>
  );

  const RetailTemplate = () => (
    <div className="flex flex-col min-h-[1123px] p-12 md:p-24 bg-white text-slate-900 print:min-h-0 print:h-[297mm] relative overflow-hidden">
      <Watermark />
      <header className="text-center mb-24 space-y-6 relative z-10">
        <CompanyLogo />
        {!data.company.logoUrl && (
          <ShoppingBag size={40} className="mx-auto text-slate-900" />
        )}
        <div className="space-y-1">
          <h1 className="text-4xl font-black tracking-tighter uppercase">{data.company?.name}</h1>
          <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.4em]">{data.documentType} archive</p>
          <div className="pt-4 text-[10px] text-slate-400 font-bold uppercase space-y-1">
            <p>{data.company?.address}</p>
            <p>TEL: {data.company?.phone} • {data.company?.email}</p>
            <p>{data.company?.website}</p>
          </div>
        </div>
        <div className="text-[11px] font-bold text-slate-400 uppercase flex justify-center gap-8 pt-4 border-t border-slate-50 max-w-sm mx-auto">
          <div className="flex flex-col items-center">
            <span className="text-[9px] opacity-50">Issue Date</span>
            <span>{formatDate(data.date)}</span>
          </div>
          {data.dueDate && (
            <div className="flex flex-col items-center">
              <span className="text-[9px] opacity-50 text-red-400">Due Date</span>
              <span className="text-slate-900">{formatDate(data.dueDate)}</span>
            </div>
          )}
          {data.expiryDate && (
            <div className="flex flex-col items-center">
              <span className="text-[9px] opacity-50 text-red-600">Expiry</span>
              <span className="text-slate-900">{formatDate(data.expiryDate)}</span>
            </div>
          )}
          <div className="flex flex-col items-center">
            <span className="text-[9px] opacity-50">Ref No.</span>
            <span>#{data.id.slice(0, 8).toUpperCase()}</span>
          </div>
        </div>
      </header>

      <section className="mb-20 grid grid-cols-2 gap-24">
        <div className="space-y-2">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Client Particulars</p>
          <p className="text-sm font-black text-slate-900 uppercase">{data.customerName}</p>
          <p className="text-[11px] text-slate-400 font-bold uppercase leading-relaxed">{data.customerAddress}</p>
        </div>
        <div className="space-y-2 text-right">
          <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Payment Reference</p>
          <p className="text-sm font-black text-slate-900 uppercase">{data.paymentMethod}</p>
          <p className="text-[11px] text-slate-400 font-bold uppercase">{data.status}</p>
        </div>
      </section>

      <main className="flex-grow">
        <ItemsTable accentClass="border-slate-900" />
      </main>

      <footer className="mt-24 pt-12 border-t-2 border-slate-900 flex justify-between items-start">
        <div className="text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] leading-loose max-w-xs">
          {data.notes || 'All sales are final. Thank you for your business.'}
        </div>
        <FinancialSummary accentText="text-slate-900" bgAccent="bg-slate-50" />
      </footer>
    </div>
  );

  // Switcher
  switch (data.theme) {
    case 'hospital': return <HospitalTemplate />;
    case 'pharmacy': return <PharmacyTemplate />;
    case 'electricity': return <ElectricityTemplate />;
    case 'water': return <WaterTemplate />;
    case 'retail':
    default: return <RetailTemplate />;
  }
};
