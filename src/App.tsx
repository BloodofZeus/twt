import React, { useState, useRef, useEffect } from 'react';
import ReceiptForm from './components/ReceiptForm';
import ReceiptPreview from './components/ReceiptPreview';
import ReceiptList from './components/ReceiptList';
import type { ReceiptData, AppSettings, DocumentType } from './model';
import { saveReceipt, getAllReceipts, deleteReceipt, getAppSettings } from './utils/storage';
import { 
  Download, Printer, Plus, LayoutDashboard, Receipt as ReceiptIcon, 
  Settings, BarChart3, History, Building2, Mail, Image as ImageIcon 
} from 'lucide-react';
import html2canvas from 'html2canvas';
import { useReactToPrint } from 'react-to-print';
import { imageUrlToBase64 } from './utils/image';
import { generateProgrammaticPDF } from './utils/pdfGenerator';
import { INDUSTRY_DEFAULTS, DEFAULT_CUSTOMER_PERSONA } from './utils/personaDefaults';

const App: React.FC = () => {
  const [receipts, setReceipts] = useState<ReceiptData[]>(() => getAllReceipts());
  const [activeReceipt, setActiveReceipt] = useState<ReceiptData | null>(null);
  const [settings] = useState<AppSettings>(() => getAppSettings());
  const [, setIsEditing] = useState(false);
  const [view, setView] = useState<'dashboard' | 'editor'>('dashboard');
  const receiptRef = useRef<HTMLDivElement>(null);

  // Clear any temporary draft on initial mount to ensure refresh starts fresh
  useEffect(() => {
    localStorage.removeItem('twt_invoice_draft');
  }, []);

  const emptyReceipt = (type: DocumentType = 'receipt'): ReceiptData => {
    const id = typeof crypto.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
      
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14);
    
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + 30);
      
    return {
      id,
      documentType: type,
      theme: 'retail',
      company: settings.companyProfile,
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      customerEmail: '',
      date: today.toISOString().split('T')[0],
      time: today.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dueDate: type === 'invoice' ? dueDate.toISOString().split('T')[0] : undefined,
      expiryDate: type === 'invoice' ? expiryDate.toISOString().split('T')[0] : undefined,
      items: [{ id: Math.random().toString(36).substring(2, 9), description: '', quantity: 1, price: 0, code: '' }],
      utilityData: {
        meterNumber: '',
        previousReading: 0,
        currentReading: 0,
        billingPeriod: '',
        consumptionUnit: 'kWh'
      },
      medicalData: {
        patientId: '',
        doctorName: '',
        prescriptionNumber: '',
        wardNumber: ''
      },
      taxRate: settings.defaultTaxRate,
      taxAmount: 0,
      discount: 0,
      subtotal: 0,
      total: 0,
      paidAmount: 0,
      paidDate: today.toISOString().split('T')[0],
      currency: settings.defaultCurrency,
      status: 'paid',
      paymentMethod: 'cash',
      showWatermark: false,
      showIndustryBackground: true,
      footerText: settings.defaultFooterText
    };
  };

  const handleSave = async () => {
    if (activeReceipt) {
      saveReceipt(activeReceipt);
      setReceipts(getAllReceipts());
      
      try {
        const idShort = activeReceipt.id.slice(0, 8).toUpperCase();
        const folder = `invoices/${idShort}`;

        // 1. Save JSON data backup
        const jsonContent = JSON.stringify(activeReceipt, null, 2);
        const jsonBlob = new Blob([jsonContent], { type: 'application/json' });
        const jsonFilename = `${activeReceipt.documentType.toUpperCase()}_${idShort}.json`;
        await saveToServer(jsonFilename, jsonBlob, folder);

        // 2. Save Programmatic PDF backup (Automatic & Silent)
        const pdfBlob = await generateProgrammaticPDF(activeReceipt);
        const pdfFilename = `TWT-${activeReceipt.documentType === 'invoice' ? 'INV' : 'REC'}-${idShort}.pdf`;
        await saveToServer(pdfFilename, pdfBlob, folder);

      } catch (error) {
        console.error('Failed to save data to server:', error);
      }

      setIsEditing(false);
      setView('dashboard');
      localStorage.removeItem('twt_invoice_draft');
      alert(`${activeReceipt.documentType === 'invoice' ? 'Invoice' : 'Receipt'} Finalized and Saved to Local Folder!`);
    }
  };

  const handleProgrammaticExport = async () => {
    if (!activeReceipt) return;
    try {
      const pdfBlob = await generateProgrammaticPDF(activeReceipt);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TWT-${activeReceipt.documentType === 'invoice' ? 'INV' : 'REC'}-${activeReceipt.id.slice(0, 8).toUpperCase()}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Programmatic Export Error:', error);
      alert('Failed to generate Quick PDF. Using the Print button instead.');
    }
  };

  const handleDataChange = (data: ReceiptData) => {
    // Automatically set industry logo if it's the default one or empty
    const industryLogos: Record<string, string> = {
      hospital: '/defaults/hospital-logo.png',
      pharmacy: '/defaults/pharmacy-logo.png',
      electricity: '/defaults/electricity-logo.png',
      water: '/defaults/water-logo.png',
      retail: '/defaults/retail-logo.png'
    };

    if (!data.company.logoUrl || data.company.logoUrl.includes('/defaults/')) {
      const newLogo = industryLogos[data.theme] || '/defaults/default-logo.png';
      data.company.logoUrl = newLogo;
    }

    // Apply Industry Specific Persona Defaults if it's a new selection
    if (activeReceipt && activeReceipt.theme !== data.theme) {
      const industryDefaults = INDUSTRY_DEFAULTS[data.theme];
      if (industryDefaults) {
        data.company.name = industryDefaults.companyName;
        data.company.address = industryDefaults.address;
        data.company.phone = industryDefaults.phone;
        data.company.email = industryDefaults.email;
        data.company.website = industryDefaults.website;
        data.notes = industryDefaults.notes;
        data.footerText = industryDefaults.footerText;
        
        // Set Default Customer Persona
        data.customerName = DEFAULT_CUSTOMER_PERSONA.name;
        data.customerAddress = DEFAULT_CUSTOMER_PERSONA.address;
        data.customerPhone = DEFAULT_CUSTOMER_PERSONA.phone;
        data.customerEmail = DEFAULT_CUSTOMER_PERSONA.email;
      }
    }

    setActiveReceipt(data);
  };

  const handleDelete = (id: string) => {
    deleteReceipt(id);
    setReceipts(getAllReceipts());
    if (activeReceipt?.id === id) {
      setActiveReceipt(null);
      localStorage.removeItem('twt_invoice_draft');
    }
  };

  const handleEdit = (receipt: ReceiptData) => {
    setActiveReceipt(receipt);
    setIsEditing(true);
    setView('editor');
  };

  const handleView = (receipt: ReceiptData) => {
    setActiveReceipt(receipt);
    setIsEditing(false);
    setView('dashboard');
  };

  const createNew = (type: DocumentType = 'receipt') => {
    localStorage.removeItem('twt_invoice_draft');
    setActiveReceipt(emptyReceipt(type));
    setIsEditing(true);
    setView('editor');
  };

  const saveToServer = async (filename: string, blob: Blob, folder: string) => {
    try {
      const formData = new FormData();
      formData.append('file', blob, filename);
      formData.append('folder', folder);
      formData.append('filename', filename);

      // Try multiple possible paths for XAMPP/Vite compatibility
      const paths = [
        './save_document.php', 
        '/save_document.php', 
        '../save_document.php',
        'http://localhost/save_document.php',
        'http://localhost:80/save_document.php'
      ];
      let lastError = null;

      for (const path of paths) {
        try {
          const response = await fetch(path, {
            method: 'POST',
            body: formData,
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log(`Successfully saved via ${path}:`, result);
            return result;
          }
        } catch (e) {
          lastError = e;
          continue;
        }
      }
      
      console.error('All save paths failed. Last error:', lastError);
      return null;
    } catch (error) {
      console.error('Error in saveToServer:', error);
      return null;
    }
  };

  const handleDownloadPDF = useReactToPrint({
    contentRef: receiptRef,
    documentTitle: activeReceipt ? `TWT-${activeReceipt.documentType === 'invoice' ? 'INV' : 'REC'}-${activeReceipt.id.slice(0, 8).toUpperCase()}` : 'document',
    onAfterPrint: async () => {
      if (!activeReceipt) return;
      // After browser print dialog, still attempt to save a copy to server for backup
      // We use the image capture for the server backup copy as it's automated
      try {
        const element = receiptRef.current;
        if (!element) return;
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, allowTaint: true });
        const imgData = canvas.toDataURL('image/png');
        const filename = `TWT-${activeReceipt.documentType === 'invoice' ? 'INV' : 'REC'}-${activeReceipt.id.slice(0, 8).toUpperCase()}.png`;
        const response = await fetch(imgData);
        const blob = await response.blob();
        await saveToServer(filename, blob, `invoices/${activeReceipt.id.slice(0, 8).toUpperCase()}`);
      } catch (err) {
        console.warn('Silent server backup failed, but browser download should be complete.', err);
      }
    }
  });

  const handleDownloadImage = async () => {
    if (!receiptRef.current || !activeReceipt) return;
    
    try {
      // Create a temporary data object with logo converted to base64
      if (activeReceipt.company.logoUrl && !activeReceipt.company.logoUrl.startsWith('data:')) {
        const base64Logo = await imageUrlToBase64(activeReceipt.company.logoUrl);
        handleDataChange({
          ...activeReceipt,
          company: { ...activeReceipt.company, logoUrl: base64Logo }
        });
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      const element = receiptRef.current;
      
      // Ensure images are loaded
      const images = element.getElementsByTagName('img');
      const loadPromises = Array.from(images).map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = () => resolve(true);
          img.onerror = () => {
            console.warn('Image failed to load, continuing without it:', img.src);
            resolve(false);
          };
        });
      });
      
      await Promise.all(loadPromises);

      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: true,
        imageTimeout: 15000,
        onclone: (clonedDoc) => {
          const clonedElement = clonedDoc.querySelector('.receipt-container') as HTMLElement;
          if (clonedElement) {
            clonedElement.style.transform = 'none';
            clonedElement.style.position = 'relative';
            clonedElement.style.margin = '0';
            clonedElement.style.boxShadow = 'none';
          }
        }
      });
      
      const imgData = canvas.toDataURL('image/png', 1.0);
      const filename = `TWT-${activeReceipt.documentType === 'invoice' ? 'INV' : 'REC'}-${activeReceipt.id.slice(0, 8).toUpperCase()}.png`;
      
      // Convert DataURL to Blob for server upload
      const response = await fetch(imgData);
      const blob = await response.blob();
      
      // Save to server
      await saveToServer(filename, blob, `invoices/${activeReceipt.id.slice(0, 8).toUpperCase()}`);
      
      // Download locally
      const link = document.createElement('a');
      link.download = filename;
      link.href = imgData;
      link.click();
      alert('Image Generated and Saved to Server!');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error('Image Generation Error:', error);
      alert(`Failed to generate image: ${message}. Fix: Try using the "Upload Image" button to upload your logo from your computer instead.`);
    }
  };

  // Stats calculation
  const totalRevenue = receipts.reduce((sum, r) => sum + (r.status === 'paid' ? r.total : 0), 0);
  const pendingCount = receipts.filter(r => r.status === 'pending').length;
  const totalReceipts = receipts.length;

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-modern">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 px-4 md:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-100">
              <ReceiptIcon size={20} className="md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black tracking-tighter text-slate-900 leading-none">TWT</h1>
              <p className="hidden md:block text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Enterprise Solutions</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setView('dashboard')}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold transition-all ${view === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              <LayoutDashboard size={18} className="shrink-0" /> <span className="hidden sm:inline">Dashboard</span>
            </button>
            <div className="flex items-center gap-1 md:gap-2 ml-1 md:ml-2">
              <button 
                onClick={() => createNew('invoice')}
                className="flex items-center gap-2 bg-slate-800 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl hover:bg-slate-900 transition-all shadow-md shadow-slate-100 active:scale-95 text-xs md:text-sm font-bold whitespace-nowrap"
              >
                <Plus size={16} className="shrink-0" /> <span className="hidden xs:inline">Invoice</span>
              </button>
              <button 
                onClick={() => createNew('receipt')}
                className="flex items-center gap-2 bg-blue-600 text-white px-3 md:px-5 py-2 md:py-2.5 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 active:scale-95 text-xs md:text-sm font-bold whitespace-nowrap"
              >
                <Plus size={16} className="shrink-0" /> <span className="hidden xs:inline">Receipt</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow max-w-7xl w-full mx-auto px-4 md:px-6 py-6 md:py-8">
        {view === 'dashboard' ? (
          <div className="space-y-6 md:space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <button 
                onClick={() => createNew('invoice')}
                className="group relative bg-slate-800 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-slate-700 shadow-xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Plus size={80} className="md:w-[120px] md:h-[120px]" />
                </div>
                <div className="relative z-10 flex flex-col items-start gap-3 md:gap-4">
                  <div className="p-3 md:p-4 bg-white/10 rounded-2xl text-white">
                    <Plus size={24} className="md:w-8 md:h-8" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">Generate Invoice</h3>
                    <p className="text-slate-400 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Create professional billing documents</p>
                  </div>
                </div>
              </button>
              
              <button 
                onClick={() => createNew('receipt')}
                className="group relative bg-blue-600 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-blue-500 shadow-xl overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="absolute top-0 right-0 p-4 md:p-8 opacity-10 group-hover:scale-110 transition-transform">
                  <Plus size={80} className="md:w-[120px] md:h-[120px]" />
                </div>
                <div className="relative z-10 flex flex-col items-start gap-3 md:gap-4">
                  <div className="p-3 md:p-4 bg-white/10 rounded-2xl text-white">
                    <Plus size={24} className="md:w-8 md:h-8" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">Generate Receipt</h3>
                    <p className="text-blue-100/60 font-bold text-[10px] md:text-xs uppercase tracking-widest mt-1">Issue proof of payment instantly</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 md:gap-5">
                <div className="p-3 md:p-4 bg-green-50 text-green-600 rounded-2xl shrink-0">
                  <BarChart3 size={24} className="md:w-8 md:h-8" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider truncate">Total Revenue</p>
                  <p className="text-xl md:text-2xl font-black text-slate-900 truncate">{settings.defaultCurrency}{totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 md:gap-5">
                <div className="p-3 md:p-4 bg-orange-50 text-orange-600 rounded-2xl shrink-0">
                  <History size={24} className="md:w-8 md:h-8" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Transactions</p>
                  <p className="text-xl md:text-2xl font-black text-slate-900">{totalReceipts}</p>
                </div>
              </div>
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 md:gap-5 sm:col-span-2 md:col-span-1">
                <div className="p-3 md:p-4 bg-blue-50 text-blue-600 rounded-2xl shrink-0">
                  <Settings size={24} className="md:w-8 md:h-8" />
                </div>
                <div>
                  <p className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Audit</p>
                  <p className="text-xl md:text-2xl font-black text-slate-900">{pendingCount}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="font-black text-slate-800 uppercase tracking-tighter text-sm md:text-base">Recent Transactions</h3>
                    <button className="text-xs font-bold text-blue-600 hover:underline">Export CSV</button>
                  </div>
                  <div className="p-2 md:p-4 overflow-x-auto">
                    <ReceiptList 
                  receipts={receipts} 
                  onDelete={handleDelete} 
                  onView={handleView}
                  activeId={activeReceipt?.id}
                />
                  </div>
                </div>
              </div>
              <div className="lg:col-span-4">
                {activeReceipt ? (
                  <div className="lg:sticky lg:top-28 space-y-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                        <h3 className="font-black text-slate-800 uppercase tracking-tighter">Quick Preview</h3>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={handleDownloadPDF}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 shadow-sm transition-all active:scale-95"
                        >
                          <Download size={18} />
                        </button>
                        <button 
                          onClick={() => handleEdit(activeReceipt)}
                          className="p-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 shadow-sm transition-all active:scale-95"
                        >
                          <Settings size={18} />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-center bg-slate-100/50 p-4 md:p-8 rounded-3xl border-2 border-dashed border-slate-200 min-h-[600px] overflow-hidden">
                      <div className="scale-[0.5] xs:scale-[0.6] sm:scale-[0.7] md:scale-[0.8] lg:scale-[0.55] xl:scale-[0.7] 2xl:scale-[0.85] origin-top transform-gpu transition-all duration-500 shadow-2xl">
                        <ReceiptPreview ref={receiptRef} data={activeReceipt} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-900 text-white rounded-2xl p-8 relative overflow-hidden h-full min-h-[300px] md:min-h-[400px]">
                    <div className="relative z-10">
                      <h3 className="text-xl font-black mb-2 tracking-tighter">TWT Enterprise</h3>
                      <p className="text-slate-400 text-sm mb-6 leading-relaxed">Your professional suite for financial document management and auditing.</p>
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                          <Building2 size={16} /> {settings.companyProfile.name}
                        </div>
                        <div className="flex items-center gap-3 text-sm font-medium text-slate-300">
                          <Mail size={16} /> {settings.companyProfile.email}
                        </div>
                      </div>
                    </div>
                    <div className="absolute -right-10 -bottom-10 opacity-10">
                      <ReceiptIcon size={200} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : activeReceipt ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <ReceiptForm 
                data={activeReceipt}
                onSave={handleSave}
                onChange={handleDataChange}
                onUploadLogo={(filename, blob) => saveToServer(filename, blob, 'logos')}
              />
            </div>
            
            <div className="lg:col-span-5 lg:sticky lg:top-28">
              <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <h3 className="font-black text-slate-800 uppercase tracking-tighter text-sm">Live Preview</h3>
                </div>
                <div className="flex gap-1.5 md:gap-2">
                  <button 
                    onClick={handleProgrammaticExport}
                    className="p-2 md:p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 hover:bg-blue-100 shadow-sm transition-all active:scale-95"
                    title="Quick PDF (Code-Generated)"
                  >
                    <Download size={18} className="md:w-5 md:h-5" />
                  </button>
                  <button 
                    onClick={handleDownloadPDF}
                    className="p-2 md:p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all active:scale-95"
                    title="Professional Print (High-Fidelity)"
                  >
                    <Printer size={18} className="md:w-5 md:h-5" />
                  </button>
                  <button 
                    onClick={handleDownloadImage}
                    className="p-2 md:p-2.5 bg-white border border-slate-200 rounded-xl text-slate-600 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all active:scale-95"
                    title="Export Image"
                  >
                    <ImageIcon size={18} className="md:w-5 md:h-5" />
                  </button>
                </div>
              </div>
              
              <div className="bg-slate-100/50 p-6 md:p-10 rounded-3xl border-2 border-dashed border-slate-200 min-h-[800px] overflow-hidden flex items-start justify-center">
                <div className="scale-[0.55] xs:scale-[0.65] sm:scale-[0.8] lg:scale-[0.65] xl:scale-[0.8] 2xl:scale-[0.95] origin-top transform-gpu transition-all duration-500 shadow-2xl">
                  <ReceiptPreview ref={receiptRef} data={activeReceipt} />
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-sm">
            <div className="bg-slate-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-300">
              <div className="w-8 h-8 border-2 border-slate-300 rounded-full flex items-center justify-center">
                <span className="text-slate-300 text-xl font-bold">!</span>
              </div>
            </div>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-sm">No document selected</p>
            <button onClick={() => setView('dashboard')} className="mt-6 btn-primary mx-auto">
              <LayoutDashboard size={18} /> Back to Dashboard
            </button>
          </div>
        )}
      </main>

      {/* Print Overlay Styles */}
      <style>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 0;
          }
          /* Hide everything first */
          body * {
            visibility: hidden !important;
          }
          /* Show the receipt container and its children */
          .receipt-container, .receipt-container * {
            visibility: visible !important;
          }
          /* Position the receipt container at the top left of the page */
          .receipt-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 210mm !important;
            min-height: 297mm !important;
            margin: 0 !important;
            padding: 0 !important;
            box-shadow: none !important;
            border: none !important;
            background: white !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            transform: none !important; /* Reset any scaling transforms */
          }
          /* Hide UI elements */
          nav, .no-print, button, form, .lg\\:col-span-7 { 
            display: none !important; 
          }
          
          /* Force colors to print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

export default App;
