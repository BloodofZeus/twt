import type { ReceiptData, AppSettings } from '../model';

const STORAGE_KEY = 'twt_receipt_data';
const SETTINGS_KEY = 'twt_app_settings';

const DEFAULT_SETTINGS: AppSettings = {
  defaultCurrency: '$',
  defaultTaxRate: 0,
  defaultDocumentType: 'invoice',
  companyProfile: {
    name: '',
    address: '',
    email: '',
    phone: '',
    website: '',
    taxId: '',
    logoUrl: '/defaults/retail-logo.png'
  },
  defaultFooterText: ''
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
