import React, { useEffect } from 'react';
import { 
  Plus, Trash2, Save, Building2, User as UserIcon, CreditCard, 
  Receipt as ReceiptIcon, Activity, Gauge 
} from 'lucide-react';
import type { ReceiptData, ReceiptItem } from '../model';
import { THEMES, CURRENCIES } from '../model';
import { getIndustryTerminology, INDUSTRY_SNIPPETS } from '../utils/terminology';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReceiptFormProps {
  data: ReceiptData;
  onSave: () => void;
  onChange: (data: ReceiptData) => void;
  onUploadLogo?: (filename: string, blob: Blob) => void;
}

const ReceiptForm: React.FC<ReceiptFormProps> = ({ data, onSave, onChange, onUploadLogo }) => {
  const term = getIndustryTerminology(data.theme);
  
  useEffect(() => {
    const subtotal = data.items.reduce((acc, item) => acc + (item.quantity * item.price), 0);
    const taxAmount = (subtotal * data.taxRate) / 100;
    const total = Math.max(0, subtotal + taxAmount - data.discount);
    
    if (total !== data.total || subtotal !== data.subtotal || taxAmount !== data.taxAmount) {
      onChange({ ...data, subtotal, taxAmount, total });
    }
  }, [data, onChange]);

  const handleAddItem = () => {
    const newItem: ReceiptItem = { 
      id: Math.random().toString(36).substring(2, 9), 
      description: '', 
      quantity: 1, 
      price: 0,
      code: ''
    };
    onChange({
      ...data,
      items: [...data.items, newItem]
    });
  };

  const handleRemoveItem = (id: string) => {
    onChange({
      ...data,
      items: data.items.filter(item => item.id !== id)
    });
  };

  const handleItemChange = (id: string, field: keyof ReceiptItem, value: string | number) => {
    onChange({
      ...data,
      items: data.items.map(item => item.id === id ? { ...item, [field]: value } : item)
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (limit to 2MB for production stability)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image is too large. Please select an image smaller than 2MB for better performance.');
        return;
      }

      // Automatically save to server
      if (onUploadLogo) {
        const timestamp = Date.now();
        const safeName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
        onUploadLogo(`${timestamp}_${safeName}`, file);
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        onChange({
          ...data,
          company: { ...data.company, logoUrl: reader.result as string }
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('company.')) {
      const field = name.split('.')[1];
      onChange({
        ...data,
        company: { ...data.company, [field]: (type === 'number' ? parseFloat(value) || 0 : value) }
      });
      return;
    }

    if (name.startsWith('medicalData.')) {
      const field = name.split('.')[1];
      onChange({
        ...data,
        medicalData: { ...data.medicalData, [field]: (type === 'number' ? parseFloat(value) || 0 : value) }
      });
      return;
    }

    if (name.startsWith('utilityData.')) {
      const field = name.split('.')[1];
      onChange({
        ...data,
        utilityData: { ...data.utilityData, [field]: (type === 'number' ? parseFloat(value) || 0 : value) }
      });
      return;
    }

    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      onChange({ ...data, [name]: checked });
      return;
    }

    onChange({ 
      ...data, 
      [name]: (name === 'taxRate' || name === 'discount' || name === 'paidAmount') ? Math.max(0, parseFloat(value) || 0) : value 
    });
  };

  const insertSnippet = (field: 'notes' | 'footerText', snippet: string) => {
    onChange({ ...data, [field]: snippet });
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-xl border border-slate-200 no-print">
      <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <ReceiptIcon size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase">Smart {data.documentType === 'invoice' ? 'Invoice' : 'Receipt'} Generator</h2>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Audit & Compliance Ready</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Industry Logo</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="showIndustryBackground" checked={data.showIndustryBackground} onChange={handleChange} className="sr-only peer" />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Watermark</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" name="showWatermark" checked={data.showWatermark} onChange={handleChange} className="sr-only peer" />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Industry & Document Type Selector */}
      <section className="mb-8 p-4 bg-slate-50 rounded-2xl border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Select Industry Theme</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {THEMES.map((t) => (
                <button
                  key={t}
                  onClick={() => onChange({ ...data, theme: t })}
                  className={cn(
                    "py-2 px-3 rounded-xl text-[10px] font-black uppercase transition-all border-2",
                    data.theme === t 
                      ? "bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-100" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-500"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">Document Type</label>
            <div className="grid grid-cols-2 gap-2">
              {(['invoice', 'receipt'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => onChange({ ...data, documentType: type })}
                  className={cn(
                    "py-2 px-4 rounded-xl text-[10px] font-black uppercase transition-all border-2",
                    data.documentType === type 
                      ? "bg-slate-800 border-slate-800 text-white shadow-lg shadow-slate-200" 
                      : "bg-white border-slate-100 text-slate-400 hover:border-slate-200 hover:text-slate-600"
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-slate-200/60">
          <label className="block text-xs font-black uppercase text-slate-400 mb-3 tracking-widest">Document Currency</label>
          <div className="flex flex-wrap gap-2">
            {CURRENCIES.map((c) => (
              <button
                key={c.code}
                onClick={() => onChange({ ...data, currency: c.symbol })}
                className={cn(
                  "py-2 px-4 rounded-xl text-[10px] font-black uppercase transition-all border-2 flex items-center gap-2",
                  data.currency === c.symbol 
                    ? "bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-100" 
                    : "bg-white border-slate-100 text-slate-400 hover:border-emerald-200 hover:text-emerald-500"
                )}
              >
                <span className="text-sm">{c.symbol}</span>
                <span>{c.code}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Specific Fields */}
      {data.theme === 'hospital' && (
        <section className="mb-8 p-4 bg-sky-50 rounded-2xl border border-sky-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-4 text-sky-800 font-bold uppercase text-xs tracking-wider">
            <Activity size={16} /> Medical Details
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Patient ID</label>
              <input type="text" name="medicalData.patientId" value={data.medicalData?.patientId || ''} onChange={handleChange} className="input-field" placeholder="P-12345" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Attending Doctor</label>
              <input type="text" name="medicalData.doctorName" value={data.medicalData?.doctorName || ''} onChange={handleChange} className="input-field" placeholder="Dr. Smith" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Ward / Room</label>
              <input type="text" name="medicalData.wardNumber" value={data.medicalData?.wardNumber || ''} onChange={handleChange} className="input-field" placeholder="Ward 4A" />
            </div>
          </div>
        </section>
      )}

      {data.theme === 'pharmacy' && (
        <section className="mb-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-4 text-emerald-800 font-bold uppercase text-xs tracking-wider">
            <Activity size={16} /> Prescription Details
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Prescription Number</label>
              <input type="text" name="medicalData.prescriptionNumber" value={data.medicalData?.prescriptionNumber || ''} onChange={handleChange} className="input-field" placeholder="RX-99201" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Pharmacist Name</label>
              <input type="text" name="medicalData.doctorName" value={data.medicalData?.doctorName || ''} onChange={handleChange} className="input-field" placeholder="John Pharmacist" />
            </div>
          </div>
        </section>
      )}

      {(data.theme === 'electricity' || data.theme === 'water') && (
        <section className="mb-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2 mb-4 text-amber-800 font-bold uppercase text-xs tracking-wider">
            <Gauge size={16} /> Utility & Metering
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Meter Number</label>
              <input type="text" name="utilityData.meterNumber" value={data.utilityData?.meterNumber || ''} onChange={handleChange} className="input-field" placeholder="MTR-990" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Billing Period</label>
              <input type="text" name="utilityData.billingPeriod" value={data.utilityData?.billingPeriod || ''} onChange={handleChange} className="input-field" placeholder="May 2026" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Prev Reading</label>
              <input type="number" name="utilityData.previousReading" value={data.utilityData?.previousReading || 0} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Curr Reading</label>
              <input type="number" name="utilityData.currentReading" value={data.utilityData?.currentReading || 0} onChange={handleChange} className="input-field" />
            </div>
          </div>
        </section>
      )}

      {/* Main Info Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold uppercase text-xs tracking-wider">
            <Building2 size={16} className="text-blue-500" /> Company Branding
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <div className="w-16 h-16 bg-white rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                {data.company.logoUrl ? (
                  <img src={data.company.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="text-slate-300" size={24} />
                )}
              </div>
              <div className="flex-grow">
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Company Logo</label>
                <div className="flex gap-2">
                  <label className="flex-grow cursor-pointer bg-white border border-slate-200 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-all text-center">
                    Upload Image
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {data.company.logoUrl && (
                    <button 
                      onClick={() => onChange({ ...data, company: { ...data.company, logoUrl: '' } })}
                      className="px-3 py-2 bg-red-50 text-red-500 rounded-xl text-xs font-bold hover:bg-red-100 transition-all"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className={cn(
                  "text-[9px] mt-2 italic font-medium",
                  data.company.logoUrl?.startsWith('data:') ? "text-emerald-500" : "text-amber-500"
                )}>
                  {data.company.logoUrl?.startsWith('data:') 
                    ? "✓ Logo ready for secure PDF export." 
                    : "⚠ External URL logo might be blocked by browser security. Recommend uploading locally."}
                </p>
              </div>
            </div>
            <input type="text" name="company.name" value={data.company.name} onChange={handleChange} className="input-field" placeholder="Company Name" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" name="company.taxId" value={data.company.taxId || ''} onChange={handleChange} className="input-field" placeholder="Tax ID / VAT" />
              <input type="text" name="company.website" value={data.company.website || ''} onChange={handleChange} className="input-field" placeholder="Website" />
            </div>
            <input type="text" name="company.address" value={data.company.address} onChange={handleChange} className="input-field" placeholder="Official Address" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" name="company.phone" value={data.company.phone || ''} onChange={handleChange} className="input-field" placeholder="Phone Number" />
              <input type="email" name="company.email" value={data.company.email || ''} onChange={handleChange} className="input-field" placeholder="Official Email" />
            </div>
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-4 text-slate-800 font-bold uppercase text-xs tracking-wider">
            <UserIcon size={16} className="text-blue-500" /> {term.customerLabel}
          </div>
          <div className="space-y-4">
            <input type="text" name="customerName" value={data.customerName} onChange={handleChange} className="input-field" placeholder={term.customerLabel} />
            <input type="text" name="customerAddress" value={data.customerAddress || ''} onChange={handleChange} className="input-field" placeholder="Customer Address" />
            <div className="grid grid-cols-2 gap-2">
              <input type="text" name="customerPhone" value={data.customerPhone || ''} onChange={handleChange} className="input-field" placeholder="Customer Phone" />
              <input type="email" name="customerEmail" value={data.customerEmail || ''} onChange={handleChange} className="input-field" placeholder="Customer Email" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Issue Date</label>
                <input type="date" name="date" value={data.date} onChange={handleChange} className="input-field" />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Issue Time</label>
                <input type="time" name="time" value={data.time} onChange={handleChange} className="input-field" />
              </div>
            </div>

            {data.documentType === 'invoice' && (
              <div className="grid grid-cols-2 gap-2 animate-in fade-in slide-in-from-top-1">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Due Date</label>
                  <input type="date" name="dueDate" value={data.dueDate || ''} onChange={handleChange} className="input-field border-blue-100 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase mb-1">Expiry Date</label>
                  <input type="date" name="expiryDate" value={data.expiryDate || ''} onChange={handleChange} className="input-field border-red-50/50 focus:border-red-500" />
                </div>
              </div>
            )}
            <select name="paymentMethod" value={data.paymentMethod} onChange={handleChange} className="input-field">
              <option value="cash">Cash Payment</option>
              <option value="card">Credit / Debit Card</option>
              <option value="transfer">Bank Transfer</option>
            </select>
          </div>
        </div>
      </section>

      {/* Items Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2 text-slate-800 font-bold uppercase text-xs tracking-wider">
            <CreditCard size={16} className="text-blue-500" /> {term.itemsLabel}
          </div>
          <button 
            onClick={handleAddItem}
            className="flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-all active:scale-95"
          >
            <Plus size={14} /> Add Item
          </button>
        </div>
        
        <div className="space-y-3">
          {data.items.map((item) => (
            <div key={item.id} className="group p-4 bg-white border border-slate-100 rounded-2xl shadow-sm hover:border-blue-100 transition-all">
              <div className="grid grid-cols-12 gap-3 md:gap-4 items-start">
                <div className="col-span-12 md:col-span-5">
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 tracking-widest">Description</label>
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => handleItemChange(item.id, 'description', e.target.value)}
                    className="input-field"
                    placeholder="Enter service or product name"
                  />
                </div>
                <div className="col-span-4 md:col-span-2">
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 tracking-widest">Qty</label>
                  <input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => handleItemChange(item.id, 'quantity', Math.max(0, parseFloat(e.target.value) || 0))}
                    className="input-field text-center"
                  />
                </div>
                <div className="col-span-5 md:col-span-3">
                  <label className="block text-[9px] font-black text-slate-400 uppercase mb-1 ml-1 tracking-widest">Price</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">{data.currency}</span>
                    <input
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(item.id, 'price', Math.max(0, parseFloat(e.target.value) || 0))}
                      className={cn("input-field", data.currency.length > 2 ? "pl-12" : data.currency.length > 1 ? "pl-10" : "pl-8")}
                    />
                  </div>
                </div>
                <div className="col-span-3 md:col-span-2 flex flex-col items-end pt-5 md:pt-0">
                  <label className="hidden md:block text-[9px] font-black text-slate-400 uppercase mb-1 mr-1 tracking-widest">Action</label>
                  <button 
                    onClick={() => handleRemoveItem(item.id)}
                    disabled={data.items.length === 1}
                    className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all disabled:opacity-0"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="col-span-12 md:col-span-5 mt-[-8px]">
                  <input
                    type="text"
                    value={item.code || ''}
                    onChange={(e) => handleItemChange(item.id, 'code', e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-50 border-none rounded-lg text-[10px] font-bold text-slate-500 focus:ring-1 focus:ring-blue-100 outline-none"
                    placeholder={term.itemCodeLabel + " (Optional)"}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Summary Section */}
      <section className="p-6 bg-slate-900 rounded-2xl text-white shadow-xl shadow-slate-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Tax Rate (%)</label>
              <input type="number" name="taxRate" value={data.taxRate} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none text-sm font-bold" />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Discount ({data.currency})</label>
              <input type="number" name="discount" value={data.discount} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none text-sm font-bold" />
            </div>
            {data.documentType === 'invoice' && (
              <>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Paid Amount ({data.currency})</label>
                  <input type="number" name="paidAmount" value={data.paidAmount || 0} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none text-sm font-bold" />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Paid Date</label>
                  <input type="date" name="paidDate" value={data.paidDate || ''} onChange={handleChange} className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500/30 outline-none text-sm font-bold" />
                </div>
              </>
            )}
            <div className="pt-2">
              <label className="block text-[10px] font-black uppercase text-slate-500 mb-2 tracking-widest">Status</label>
              <select name="status" value={data.status} onChange={handleChange} className="bg-transparent border-none text-sm font-black uppercase text-blue-400 outline-none p-0 cursor-pointer hover:text-blue-300">
                <option value="paid" className="text-slate-900">Paid</option>
                <option value="pending" className="text-slate-900">Pending</option>
                <option value="cancelled" className="text-slate-900">Cancelled</option>
              </select>
            </div>
          </div>
          
          <div className="md:col-span-2 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Subtotal</span>
                <span>{data.currency}{data.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest">
                <span>Tax Amount</span>
                <span>{data.currency}{data.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-red-400 uppercase tracking-widest">
                <span>Discount</span>
                <span>-{data.currency}{data.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/10">
              <span className="text-xl font-black uppercase tracking-tighter">Grand Total</span>
              <span className="text-3xl font-black text-blue-400">{data.currency}{data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer Info Section */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest">Notes & Terms</label>
              <div className="flex gap-1">
                {INDUSTRY_SNIPPETS.payment.map((s, i) => (
                  <button key={i} onClick={() => insertSnippet('notes', s)} className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded hover:bg-blue-100 hover:text-blue-600 transition-colors">Snippet {i+1}</button>
                ))}
              </div>
            </div>
            <textarea name="notes" value={data.notes || ''} onChange={handleChange} rows={3} className="input-field min-h-[80px] resize-none" placeholder="Bank details, terms, etc."></textarea>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-black uppercase text-slate-400 tracking-widest">Footer Text</label>
              <div className="flex gap-1">
                {INDUSTRY_SNIPPETS.thankYou.map((s, i) => (
                  <button key={i} onClick={() => insertSnippet('footerText', s)} className="text-[8px] font-black bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded hover:bg-blue-100 hover:text-blue-600 transition-colors">Snippet {i+1}</button>
                ))}
              </div>
            </div>
            <textarea name="footerText" value={data.footerText || ''} onChange={handleChange} rows={3} className="input-field min-h-[80px] resize-none" placeholder="Thank you message..."></textarea>
          </div>
        </div>
      </section>

      <button 
        onClick={onSave}
        className="w-full mt-10 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-100 hover:bg-blue-700 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-3"
      >
        <Save size={20} /> Finalize {data.documentType === 'invoice' ? 'Invoice' : 'Receipt'}
      </button>
    </div>
  );
};

export default ReceiptForm;
