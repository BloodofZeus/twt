import React, { useEffect } from 'react';
import { 
  Plus, Trash2, Save, CreditCard, 
  ImageIcon,
  ChevronRight, FileText, Settings
} from 'lucide-react';
import type { ReceiptData, ReceiptItem } from '../model';
import { THEMES, CURRENCIES } from '../model';
import { getIndustryTerminology } from '../utils/terminology';
import { INDUSTRY_DEFAULTS } from '../utils/personaDefaults';
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
  const [activeTab, setActiveTab] = React.useState<'config' | 'details' | 'items' | 'summary'>('config');
  
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
      if (file.size > 2 * 1024 * 1024) {
        alert('Image is too large. Please select an image smaller than 2MB.');
        return;
      }

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

  const applyIndustryDefaults = () => {
    const defaults = INDUSTRY_DEFAULTS[data.theme];
    if (defaults && window.confirm(`Apply ${data.theme} default company information and notes? This will overwrite current business details.`)) {
      onChange({
        ...data,
        company: {
          ...data.company,
          name: defaults.companyName,
          address: defaults.address,
          phone: defaults.phone,
          email: defaults.email,
          website: defaults.website
        },
        notes: defaults.notes,
        footerText: defaults.footerText
      });
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
      const medicalData = data.medicalData || {};
      onChange({
        ...data,
        medicalData: { ...medicalData, [field]: (type === 'number' ? parseFloat(value) || 0 : value) }
      });
      return;
    }

    if (name.startsWith('utilityData.')) {
      const field = name.split('.')[1];
      const utilityData = data.utilityData || {};
      onChange({
        ...data,
        utilityData: { ...utilityData, [field]: (type === 'number' ? parseFloat(value) || 0 : value) }
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

  const tabs = [
    { id: 'config', label: 'Setup', icon: Settings },
    { id: 'details', label: 'Details', icon: FileText },
    { id: 'items', label: 'Items', icon: CreditCard },
    { id: 'summary', label: 'Finish', icon: Save }
  ] as const;

  return (
    <div className="flex flex-col h-full bg-white rounded-3xl overflow-hidden no-print">
      {/* Notion-style Tab Navigation */}
      <div className="flex items-center px-4 bg-slate-50/50 border-b border-slate-100 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap",
                activeTab === tab.id ? "text-slate-900 border-slate-900" : "text-slate-300 border-transparent hover:text-slate-500"
              )}
            >
              <Icon size={14} strokeWidth={2.5} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-280px)] custom-scrollbar">
        {/* Tab 1: Configuration */}
        {activeTab === 'config' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Layout Style</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {THEMES.map((t) => (
                  <button
                    key={t}
                    onClick={() => onChange({ ...data, theme: t })}
                    className={cn(
                      "py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                      data.theme === t 
                        ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-100" 
                        : "bg-white border-slate-50 text-slate-300 hover:border-slate-200 hover:text-slate-500"
                    )}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Document Type</h4>
              <div className="grid grid-cols-2 gap-2">
                {(['invoice', 'receipt'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => onChange({ ...data, documentType: type })}
                    className={cn(
                      "py-3 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border-2",
                      data.documentType === type 
                        ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-100" 
                        : "bg-white border-slate-50 text-slate-300 hover:border-slate-200 hover:text-slate-500"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </section>

            <section className="space-y-4">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Currency Settings</h4>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => onChange({ ...data, currency: c.symbol })}
                    className={cn(
                      "py-3 px-2 rounded-xl text-[10px] font-black uppercase transition-all border-2",
                      data.currency === c.symbol 
                        ? "bg-slate-900 border-slate-900 text-white shadow-xl shadow-slate-100" 
                        : "bg-white border-slate-50 text-slate-300 hover:border-slate-200 hover:text-slate-500"
                    )}
                  >
                    {c.code}
                  </button>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-6 pt-4 border-t border-slate-50">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="showIndustryBackground" checked={data.showIndustryBackground} onChange={handleChange} className="sr-only peer" />
                  <div className="w-8 h-4 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Industry Icon</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" name="showWatermark" checked={data.showWatermark} onChange={handleChange} className="sr-only peer" />
                  <div className="w-8 h-4 bg-slate-100 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900"></div>
                </label>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Watermark</span>
              </div>
            </div>

            <button onClick={() => setActiveTab('details')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 group">
              Next Step <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Tab 2: Details */}
        {activeTab === 'details' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <section className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Identity & Branding</h4>
                <button 
                  onClick={applyIndustryDefaults}
                  className="text-[9px] font-black uppercase tracking-widest text-slate-900 bg-slate-50 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-all border border-slate-200"
                >
                  Apply {data.theme} Defaults
                </button>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 bg-slate-50/50 rounded-2xl border border-slate-100">
                <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center overflow-hidden border border-slate-100 shadow-sm">
                  {data.company.logoUrl ? (
                    <img src={data.company.logoUrl} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <ImageIcon size={24} strokeWidth={1} className="text-slate-200" />
                  )}
                </div>
                <div className="flex-grow space-y-3 w-full">
                  <label className="block text-[10px] font-black uppercase tracking-widest text-slate-900 bg-white px-4 py-3 rounded-xl border border-slate-100 text-center cursor-pointer hover:border-slate-900 transition-all shadow-sm">
                    Choose New Logo
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {data.company.logoUrl && (
                    <button onClick={() => onChange({ ...data, company: { ...data.company, logoUrl: '' } })} className="w-full text-[9px] font-black uppercase tracking-widest text-red-400 hover:text-red-600 transition-all">Remove Branding</button>
                  )}
                </div>
              </div>
              
              <div className="space-y-3">
                <input type="text" name="company.name" value={data.company.name} onChange={handleChange} className="input-field" placeholder="Business Name" />
                <input type="text" name="company.address" value={data.company.address} onChange={handleChange} className="input-field" placeholder="Business Address" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="company.phone" value={data.company.phone} onChange={handleChange} className="input-field" placeholder="Phone" />
                  <input type="email" name="company.email" value={data.company.email} onChange={handleChange} className="input-field" placeholder="Email" />
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-10 border-t border-slate-50">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Recipient Details</h4>
              <div className="space-y-3">
                <input type="text" name="customerName" value={data.customerName} onChange={handleChange} className="input-field" placeholder={term.customerLabel} />
                <input type="text" name="customerAddress" value={data.customerAddress || ''} onChange={handleChange} className="input-field" placeholder="Recipient Address" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="text" name="customerPhone" value={data.customerPhone || ''} onChange={handleChange} className="input-field" placeholder="Recipient Phone" />
                  <input type="email" name="customerEmail" value={data.customerEmail || ''} onChange={handleChange} className="input-field" placeholder="Recipient Email" />
                </div>
              </div>
            </section>

            {(data.theme === 'electricity' || data.theme === 'water') && (
              <section className="space-y-4 pt-10 border-t border-slate-50 animate-in fade-in slide-in-from-top-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Utility Readings</h4>
                <div className="space-y-3">
                  <input type="text" name="utilityData.meterNumber" value={data.utilityData?.meterNumber || ''} onChange={handleChange} className="input-field" placeholder="Meter Number" />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-slate-300 uppercase mb-1 ml-4">Previous Reading</label>
                      <input type="number" name="utilityData.previousReading" value={data.utilityData?.previousReading || 0} onChange={handleChange} className="input-field" placeholder="0.00" />
                    </div>
                    <div>
                      <label className="block text-[9px] font-black text-slate-300 uppercase mb-1 ml-4">Current Reading</label>
                      <input type="number" name="utilityData.currentReading" value={data.utilityData?.currentReading || 0} onChange={handleChange} className="input-field" placeholder="0.00" />
                    </div>
                  </div>
                </div>
              </section>
            )}

            {(data.theme === 'hospital' || data.theme === 'pharmacy') && (
              <section className="space-y-4 pt-10 border-t border-slate-50 animate-in fade-in slide-in-from-top-1">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {data.theme === 'hospital' ? 'Medical Information' : 'Pharmacy Information'}
                </h4>
                <div className="space-y-3">
                  <input 
                    type="text" 
                    name="medicalData.doctorName" 
                    value={data.medicalData?.doctorName || ''} 
                    onChange={handleChange} 
                    className="input-field" 
                    placeholder={data.theme === 'hospital' ? 'Attending Physician' : 'Authorized Pharmacist'} 
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <input 
                      type="text" 
                      name="medicalData.patientId" 
                      value={data.medicalData?.patientId || ''} 
                      onChange={handleChange} 
                      className="input-field" 
                      placeholder={data.theme === 'hospital' ? 'Patient ID' : 'Prescription Ref'} 
                    />
                    <input 
                      type="text" 
                      name="medicalData.wardNumber" 
                      value={data.medicalData?.wardNumber || ''} 
                      onChange={handleChange} 
                      className="input-field" 
                      placeholder={data.theme === 'hospital' ? 'Ward / Room No.' : 'Batch Number'} 
                    />
                  </div>
                </div>
              </section>
            )}

            <section className="space-y-4 pt-10 border-t border-slate-50">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Document Schedule</h4>
              <div className="grid grid-cols-2 gap-3">
                <input type="date" name="date" value={data.date} onChange={handleChange} className="input-field" />
                <input type="time" name="time" value={data.time} onChange={handleChange} className="input-field" />
              </div>
              {data.documentType === 'invoice' && (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-1">
                  <div>
                    <label className="block text-[9px] font-black text-slate-300 uppercase mb-1 ml-4">Due Date</label>
                    <input type="date" name="dueDate" value={data.dueDate || ''} onChange={handleChange} className="input-field bg-slate-50/50" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-black text-slate-300 uppercase mb-1 ml-4">Expiry</label>
                    <input type="date" name="expiryDate" value={data.expiryDate || ''} onChange={handleChange} className="input-field bg-slate-50/50" />
                  </div>
                </div>
              )}
            </section>
            
            <button onClick={() => setActiveTab('items')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 group">
              Next Step <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Tab 3: Items */}
        {activeTab === 'items' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{term.itemsLabel}</h4>
              <button onClick={handleAddItem} className="text-[10px] font-black uppercase tracking-widest text-slate-900 flex items-center gap-1.5 hover:underline">
                <Plus size={14} strokeWidth={2.5} /> New Entry
              </button>
            </div>
            
            <div className="space-y-4">
              {data.items.map((item, index) => (
                <div key={item.id} className="p-6 bg-white border border-slate-100 rounded-2xl space-y-4 shadow-sm relative group transition-all hover:border-slate-900">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Row #{index + 1}</span>
                    <button onClick={() => handleRemoveItem(item.id)} disabled={data.items.length === 1} className="text-slate-200 hover:text-red-500 transition-colors disabled:opacity-0">
                      <Trash2 size={16} strokeWidth={2} />
                    </button>
                  </div>
                  <input type="text" value={item.description} onChange={(e) => handleItemChange(item.id, 'description', e.target.value)} className="input-field text-sm" placeholder="Description" />
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[9px] font-black text-slate-300 uppercase mb-1 ml-4">Qty</label>
                      <input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', Math.max(0, parseFloat(e.target.value) || 0))} className="input-field text-center" />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[9px] font-black text-slate-300 uppercase mb-1 ml-4">Price</label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 text-xs font-bold">{data.currency}</span>
                        <input type="number" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', Math.max(0, parseFloat(e.target.value) || 0))} className="input-field pl-10 text-right" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setActiveTab('summary')} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 group">
              Next Step <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

        {/* Tab 4: Finalize */}
        {activeTab === 'summary' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-right-4 duration-500">
            <section className="p-8 bg-slate-900 rounded-3xl text-white space-y-6 shadow-2xl shadow-slate-200">
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Subtotal</p>
                  <p className="text-xl font-black">{data.currency}{data.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Adjustment</p>
                  <p className="text-xl font-black text-red-400">-{data.currency}{data.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="pt-6 border-t border-white/10 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Total Amount</p>
                <p className="text-4xl font-black tracking-tighter">{data.currency}{data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
            </section>

            <section className="space-y-4 pt-10 border-t border-slate-50">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Financial Rules</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-300 uppercase mb-1 ml-4">Tax %</label>
                  <input type="number" name="taxRate" value={data.taxRate} onChange={handleChange} className="input-field" />
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-300 uppercase mb-1 ml-4">Discount</label>
                  <input type="number" name="discount" value={data.discount} onChange={handleChange} className="input-field" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-black text-slate-300 uppercase mb-1 ml-4">State</label>
                  <select name="status" value={data.status} onChange={handleChange} className="input-field appearance-none">
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[9px] font-black text-slate-300 uppercase mb-1 ml-4">Method</label>
                  <select name="paymentMethod" value={data.paymentMethod} onChange={handleChange} className="input-field appearance-none">
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="transfer">Transfer</option>
                  </select>
                </div>
              </div>
            </section>

            <section className="space-y-4 pt-10 border-t border-slate-50">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Additional Remarks</h4>
              <textarea name="notes" value={data.notes || ''} onChange={handleChange} rows={2} className="input-field min-h-[80px] resize-none py-4" placeholder="Terms & Conditions"></textarea>
              <textarea name="footerText" value={data.footerText || ''} onChange={handleChange} rows={2} className="input-field min-h-[80px] resize-none py-4" placeholder="Footer Disclaimer"></textarea>
            </section>
            
            <button onClick={onSave} className="w-full py-5 bg-emerald-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] shadow-xl shadow-emerald-50 transition-all hover:bg-emerald-600 active:scale-[0.98]">
              Finalize Document
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptForm;
