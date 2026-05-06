import type { ReceiptTheme } from '../model';

export const DEFAULT_CUSTOMER_PERSONA = {
  name: '',
  address: '',
  phone: '',
  email: ''
};

interface IndustryDefault {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  notes: string;
  footerText: string;
}

export const INDUSTRY_DEFAULTS: Record<ReceiptTheme, IndustryDefault> = {
  hospital: {
    companyName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    notes: '',
    footerText: ''
  },
  pharmacy: {
    companyName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    notes: '',
    footerText: ''
  },
  electricity: {
    companyName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    notes: '',
    footerText: ''
  },
  water: {
    companyName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    notes: '',
    footerText: ''
  },
  retail: {
    companyName: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    notes: '',
    footerText: ''
  }
};
