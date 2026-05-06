import React, { useState, useEffect, useRef } from 'react';
import ReceiptForm from './components/ReceiptForm';
import ReceiptPreview from './components/ReceiptPreview';
import ReceiptList from './components/ReceiptList';
import type { ReceiptData, AppSettings, DocumentType } from './model';
import { saveReceipt, getAllReceipts, deleteReceipt, getAppSettings } from './utils/storage';
import { 
  Printer, Plus, Receipt as ReceiptIcon, 
  Image as ImageIcon, Building2, Share2
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { useReactToPrint } from 'react-to-print';
import { imageUrlToBase64 } from './utils/image';
import { INDUSTRY_DEFAULTS, DEFAULT_CUSTOMER_PERSONA } from './utils/personaDefaults';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const App: React.FC = () => {
  const [receipts, setReceipts] = useState<ReceiptData[]>(() => getAllReceipts());
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);
  const [settings] = useState<AppSettings>(() => getAppSettings());
  const [, setIsEditing] = useState(false);
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const receiptRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent));
    localStorage.removeItem('twt_invoice_draft');
  }, []);

  const emptyReceipt = (type: DocumentType = 'receipt'): ReceiptData => {
    const today = new Date();
    const idShort = Math.random().toString(36).substring(2, 9);
    
    return {
      id: idShort,
      documentType: type,
      theme: 'retail',
      company: settings.companyProfile,
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      customerEmail: '',
      date: today.toISOString().split('T')[0],
      time: today.toTimeString().split(' ')[0].substring(0, 5),
      items: [{ id: '1', description: '', quantity: 1, price: 0, code: '' }],
      subtotal: 0,
      taxRate: settings.defaultTaxRate,
      taxAmount: 0,
      discount: 0,
      total: 0,
      status: 'pending',
      currency: settings.defaultCurrency,
      paymentMethod: 'cash',
      showIndustryBackground: true,
      showWatermark: true,
      notes: settings.defaultFooterText,
      footerText: '',
      medicalData: { doctorName: '', patientId: '', wardNumber: '' },
      utilityData: { meterNumber: '', previousReading: 0, currentReading: 0 }
    };
  };

  const createNew = (type: DocumentType) => {
    const data = emptyReceipt(type);
    
    // Apply industry defaults if any
    const theme = data.theme;
    if (theme && INDUSTRY_DEFAULTS[theme]) {
      const defaults = INDUSTRY_DEFAULTS[theme];
      data.company = {
        ...data.company,
        name: defaults.companyName || data.company.name,
        address: defaults.address || data.company.address,
        phone: defaults.phone || data.company.phone,
        email: defaults.email || data.company.email,
        website: defaults.website || data.company.website
      };
      data.notes = defaults.notes || data.notes;
      data.footerText = defaults.footerText || data.footerText;

      // Set Default Customer Persona
      if (DEFAULT_CUSTOMER_PERSONA) {
        data.customerName = DEFAULT_CUSTOMER_PERSONA.name;
        data.customerAddress = DEFAULT_CUSTOMER_PERSONA.address;
        data.customerPhone = DEFAULT_CUSTOMER_PERSONA.phone;
        data.customerEmail = DEFAULT_CUSTOMER_PERSONA.email;
      }
    }

    setActiveReceipt(data);
    setIsEditing(true);
    setView('editor');
  };

  const handleSave = async () => {
    if (activeReceipt) {
      if (!activeReceipt.company.name) {
        alert('Please enter your business name.');
        return;
      }
      if (!activeReceipt.customerName) {
        alert('Please enter the recipient name.');
        return;
      }
      if (activeReceipt.items.some(item => !item.description)) {
        alert('All items must have a description.');
        return;
      }

      // Local storage persistence
      saveReceipt(activeReceipt);
      setReceipts(getAllReceipts());
      
      alert(`${activeReceipt.documentType === 'invoice' ? 'Invoice' : 'Receipt'} Saved!`);
    }
  };

  const handleDataChange = (data: ReceiptData) => {
    setActiveReceipt(data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this archive?')) {
      deleteReceipt(id);
      setReceipts(getAllReceipts());
      if (activeReceipt?.id === id) {
        setActiveReceipt(null);
        setView('dashboard');
      }
    }
  };

  const handleView = (receipt: ReceiptData) => {
    setActiveReceipt(receipt);
    setIsEditing(false);
    setView('editor');
  };

  const handleDownloadPDF = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: activeReceipt ? `TWT-${activeReceipt.documentType === 'invoice' ? 'INV' : 'REC'}-${activeReceipt.id.slice(0, 8).toUpperCase()}` : 'document',
    onBeforePrint: async () => {
      if (isMobile) {
        alert('On mobile: Please select "Save as PDF" from the print options to download the document.');
      }
    },
    onAfterPrint: () => {
      console.log('Document printed successfully');
    }
  });

  const handleShare = async () => {
    if (!receiptRef.current || !activeReceipt) return;
    
    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        ignoreElements: (el) => el.classList.contains('no-print')
      });
      
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      const file = new File([blob], `TWT-${activeReceipt.id.slice(0, 8).toUpperCase()}.png`, { type: 'image/png' });
      
      if (navigator.share) {
        await navigator.share({
          files: [file],
          title: `${activeReceipt.documentType.toUpperCase()} - ${activeReceipt.id.slice(0, 8).toUpperCase()}`,
          text: `Here is the ${activeReceipt.documentType} from ${activeReceipt.company.name}`
        });
      } else {
        handleDownloadImage();
      }
    } catch (error) {
      console.error('Share Error:', error);
      handleDownloadImage();
    }
  };

  const handleDownloadImage = async () => {
    if (!receiptRef.current || !activeReceipt) return;
    
    try {
      if (activeReceipt.company.logoUrl && !activeReceipt.company.logoUrl.startsWith('data:')) {
        const base64Logo = await imageUrlToBase64(activeReceipt.company.logoUrl);
        handleDataChange({
          ...activeReceipt,
          company: { ...activeReceipt.company, logoUrl: base64Logo }
        });
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        ignoreElements: (el) => el.classList.contains('no-print')
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const link = document.createElement('a');
      link.download = `TWT-${activeReceipt.id.slice(0, 8).toUpperCase()}.png`;
      link.href = imgData;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Image Generation Error:', error);
      alert('Failed to generate image. Please use PDF export instead.');
    }
  };

  const totalRevenue = receipts.reduce((acc, r) => acc + (r.status === 'paid' ? r.total : 0), 0);
  const totalReceipts = receipts.length;
  const pendingCount = receipts.filter(r => r.status === 'pending').length;

  return (
    <div className="min-h-screen bg-white flex flex-col font-modern text-slate-900">
      {/* PWA Minimal Navigation */}
      <nav className="bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 md:px-8 py-5 border-b border-slate-100 no-print">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView('dashboard')}>
            <ReceiptIcon size={22} strokeWidth={1.5} className="text-slate-900" />
            <span className="text-lg font-black tracking-tighter uppercase">TWT</span>
          </div>
          
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setView('dashboard')}
              className={cn(
                "text-xs font-black uppercase tracking-widest transition-all",
                view === 'dashboard' ? "text-slate-900" : "text-slate-400 hover:text-slate-600"
              )}
            >
              Overview
            </button>
            <div className="h-4 w-[1px] bg-slate-100"></div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => createNew('invoice')}
                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
              >
                + Invoice
              </button>
              <button 
                onClick={() => createNew('receipt')}
                className="text-xs font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
              >
                + Receipt
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-8 py-8 md:py-12">
        {view === 'dashboard' ? (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Minimal Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Total Revenue</p>
                <p className="text-2xl font-black">{settings.defaultCurrency}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Transactions</p>
                <p className="text-2xl font-black">{totalReceipts}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Audit</p>
                <p className="text-2xl font-black">{pendingCount}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">System Status</p>
                <p className="text-2xl font-black flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-sm">Active</span>
                </p>
              </div>
            </div>

            {/* Step-by-Step Section */}
            <section className="space-y-8">
              <div className="max-w-2xl">
                <h2 className="text-3xl md:text-4xl font-black tracking-tight mb-4">What would you like to create today?</h2>
                <p className="text-slate-500 font-medium leading-relaxed">Select a document type to begin our simplified, step-by-step generation process.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => createNew('invoice')}
                  className="group flex flex-col items-start p-8 rounded-3xl border border-slate-100 hover:border-slate-900 transition-all duration-500 bg-slate-50/30"
                >
                  <Plus size={24} strokeWidth={1} className="mb-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">New Invoice</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Professional Billing</p>
                </button>
                
                <button 
                  onClick={() => createNew('receipt')}
                  className="group flex flex-col items-start p-8 rounded-3xl border border-slate-100 hover:border-slate-900 transition-all duration-500 bg-slate-50/30"
                >
                  <Plus size={24} strokeWidth={1} className="mb-6 text-slate-400 group-hover:text-slate-900 transition-colors" />
                  <h3 className="text-xl font-black uppercase tracking-tight mb-2">New Receipt</h3>
                  <p className="text-sm text-slate-400 font-bold uppercase tracking-widest">Payment Confirmation</p>
                </button>
              </div>
            </section>

            {/* Refined History List */}
            <section className="pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-400">Recent Activity</h3>
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-900 hover:underline">View All Archive</button>
              </div>
              <div className="bg-white rounded-3xl border border-slate-50 overflow-hidden shadow-sm">
                <ReceiptList 
                  receipts={receipts} 
                  onDelete={handleDelete} 
                  onView={handleView}
                  activeId={activeReceipt?.id}
                />
              </div>
            </section>
          </div>
        ) : activeReceipt ? (
          <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              <div className="lg:col-span-6 space-y-8 no-print">
                <div className="flex items-center justify-between">
                  <button 
                    onClick={() => setView('dashboard')}
                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all"
                  >
                    ← Back to Archive
                  </button>
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 bg-slate-100 rounded-full text-slate-500">
                    Drafting {activeReceipt.documentType}
                  </span>
                </div>
                
                <div className="bg-white rounded-[2.5rem] border border-slate-100 p-2 shadow-sm">
                  <ReceiptForm 
                    data={activeReceipt}
                    onSave={handleSave}
                    onChange={handleDataChange}
                  />
                </div>
              </div>
              
              <div className="lg:col-span-6 lg:sticky lg:top-32 space-y-8">
                <div className="flex items-center justify-between bg-white px-8 py-5 rounded-3xl border border-slate-100 shadow-sm no-print">
                  <div className="flex items-center gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-[10px]">High Fidelity Preview</h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {isMobile && (
                      <button 
                        onClick={handleShare}
                        className="p-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl hover:bg-emerald-100 transition-all active:scale-95"
                      >
                        <Share2 size={14} strokeWidth={2.5} />
                      </button>
                    )}
                    <button 
                      onClick={handleDownloadPDF}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl hover:bg-black transition-all active:scale-95 text-[10px] font-black uppercase tracking-widest"
                    >
                      <Printer size={14} strokeWidth={2} />
                      {isMobile ? 'Export PDF' : 'Download PDF'}
                    </button>
                    <button 
                      onClick={handleDownloadImage}
                      className="p-2 bg-white border border-slate-200 rounded-xl text-slate-400 hover:text-slate-900 hover:border-slate-900 transition-all active:scale-95"
                    >
                      <ImageIcon size={14} strokeWidth={2} />
                    </button>
                  </div>
                </div>
                
                <div className="bg-slate-50/50 rounded-[3rem] border-2 border-dashed border-slate-100 p-8 md:p-12 min-h-[800px] flex items-start justify-center overflow-hidden">
                  <div className="scale-[0.5] sm:scale-[0.65] lg:scale-[0.6] xl:scale-[0.75] 2xl:scale-[0.9] origin-top transform-gpu transition-all duration-700 shadow-2xl">
                    <ReceiptPreview ref={receiptRef} data={activeReceipt} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-xl mx-auto py-24 text-center space-y-8 animate-in zoom-in-95 duration-500 no-print">
            <div className="w-20 h-20 border border-slate-100 rounded-full flex items-center justify-center mx-auto">
              <Plus size={32} strokeWidth={0.5} className="text-slate-300" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black tracking-tight uppercase">Ready to start?</h3>
              <p className="text-slate-400 font-medium">Select an archive item or create a new document from the navigation.</p>
            </div>
            <button 
              onClick={() => setView('dashboard')} 
              className="text-xs font-black uppercase tracking-widest text-slate-900 border-b-2 border-slate-900 pb-1 hover:text-slate-500 hover:border-slate-300 transition-all"
            >
              Go to Overview
            </button>
          </div>
        )}
      </main>

      {/* Profile Sidebar (Placeholder for Notion feel) */}
      <div className="fixed bottom-8 right-8 no-print">
        <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-2xl flex items-center gap-4 border border-white/10 animate-in slide-in-from-right-8 duration-1000">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
            <Building2 size={18} strokeWidth={1.5} />
          </div>
          <div className="pr-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enterprise Profile</p>
            <p className="text-xs font-black uppercase tracking-tight truncate max-w-[150px]">{settings.companyProfile.name || 'Set Up Business'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
