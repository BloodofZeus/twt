export const THEMES = ['hospital', 'pharmacy', 'electricity', 'water', 'retail'] as const;
export type ReceiptTheme = (typeof THEMES)[number];

export const CURRENCIES = [
  { code: 'USD', symbol: '$', label: 'US Dollar ($)' },
  { code: 'EUR', symbol: '€', label: 'Euro (€)' },
  { code: 'GBP', symbol: '£', label: 'British Pound (£)' },
  { code: 'GHS', symbol: 'GH₵', label: 'Ghanaian Cedi (GH₵)' },
  { code: 'CAD', symbol: 'C$', label: 'Canadian Dollar (C$)' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira (₦)' }
] as const;

export type DocumentType = 'invoice' | 'receipt';

export interface CompanyDetails {
  name: string;
  address: string;
  email: string;
  phone: string;
  website?: string;
  taxId?: string;
  logoUrl?: string;
}

export interface ReceiptItem {
  id: string;
  description: string;
  quantity: number;
  price: number;
  code?: string;
}

export interface UtilityData {
  meterNumber?: string;
  previousReading?: number;
  currentReading?: number;
  billingPeriod?: string;
  consumptionUnit?: string;
}

export interface MedicalData {
  patientId?: string;
  doctorName?: string;
  prescriptionNumber?: string;
  wardNumber?: string;
}

export interface ReceiptData {
  id: string;
  documentType: DocumentType;
  theme: ReceiptTheme;
  company: CompanyDetails;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerEmail?: string;
  date: string;
  time: string;
  dueDate?: string;
  expiryDate?: string;
  items: ReceiptItem[];
  utilityData?: UtilityData;
  medicalData?: MedicalData;
  taxRate: number;
  taxAmount: number;
  discount: number;
  subtotal: number;
  total: number;
  paidAmount?: number;
  paidDate?: string;
  currency: string;
  notes?: string;
  footerText?: string;
  status: 'paid' | 'pending' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'transfer' | 'other';
  showWatermark: boolean;
  showIndustryBackground?: boolean;
}

export interface AppSettings {
  defaultCurrency: string;
  defaultTaxRate: number;
  defaultDocumentType: DocumentType;
  companyProfile: CompanyDetails;
  defaultFooterText: string;
}
