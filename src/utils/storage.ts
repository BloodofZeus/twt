import type { ReceiptData, AppSettings } from '../model';

const STORAGE_KEY = 'twt_receipt_data';
const SETTINGS_KEY = 'twt_app_settings';
const AUTH_KEY = 'twt_auth_session';

const VALID_CODES = ['TWT-2026', 'ADMIN-88', 'STAFF-99']; // Example authorized codes

export const checkAuth = (): boolean => {
  const session = localStorage.getItem(AUTH_KEY);
  if (!session) return false;
  try {
    const { expiry } = JSON.parse(session);
    return Date.now() < expiry;
  } catch {
    return false;
  }
};

export const loginWithCode = (code: string): boolean => {
  if (VALID_CODES.includes(code.toUpperCase())) {
    const session = {
      expiry: Date.now() + (1000 * 60 * 60 * 24) // 24 hour session
    };
    localStorage.setItem(AUTH_KEY, JSON.stringify(session));
    return true;
  }
  return false;
};

export const logout = () => {
  localStorage.removeItem(AUTH_KEY);
};

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
