import type { ReceiptData, AppSettings } from '../model';
import { DEFAULT_CUSTOMER_PERSONA } from './personaDefaults';

const STORAGE_KEY = 'twt_receipt_data';
const SETTINGS_KEY = 'twt_app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  defaultCurrency: '$',
  defaultTaxRate: 0,
  defaultDocumentType: 'invoice',
  companyProfile: {
    name: 'Lincoln Square Boutique',
    address: '1 Old State Capitol Plaza, Springfield, IL 62701, USA',
    email: 'hello@lincoln-square-boutique.com',
    phone: '+1 (217) 555-1122',
    website: 'www.lincoln-square-boutique.com',
    taxId: 'US-217-0001',
    logoUrl: '/defaults/retail-logo.png'
  },
  defaultFooterText: 'Thank you for shopping local in Springfield!'
};

export const saveReceipt = (receipt: ReceiptData) => {
  const receipts = getAllReceipts();
  const index = receipts.findIndex(r => r.id === receipt.id);
  
  if (index >= 0) {
    receipts[index] = receipt;
  } else {
    receipts.unshift(receipt);
  }
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
};

export const getAllReceipts = (): ReceiptData[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

export const deleteReceipt = (id: string) => {
  const receipts = getAllReceipts().filter(r => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(receipts));
};

export const getAppSettings = (): AppSettings => {
  const data = localStorage.getItem(SETTINGS_KEY);
  return data ? JSON.parse(data) : DEFAULT_SETTINGS;
};

export const saveAppSettings = (settings: AppSettings) => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};
