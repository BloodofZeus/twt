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
    companyName: 'City Central Hospital',
    address: '123 Medical Plaza, Health City',
    phone: '+1 555-0100',
    email: 'billing@cityhospital.com',
    website: 'www.cityhospital.com',
    notes: 'Medical Practitioner Notes: Please follow up with your doctor in 7 days.',
    footerText: 'This document serves as an official medical receipt for services rendered.'
  },
  pharmacy: {
    companyName: 'Green Cross Pharmacy',
    address: '45 Pharma Lane, Wellness District',
    phone: '+1 555-0200',
    email: 'rx@greencross.com',
    website: 'www.greencross.com',
    notes: 'Pharmacist Advice: Store medications in a cool, dry place.',
    footerText: 'Digitally authorized pharmaceutical dispensation record.'
  },
  electricity: {
    companyName: 'National Power Grid',
    address: 'Energy Tower, Utility Square',
    phone: '+1 555-0300',
    email: 'support@powergrid.gov',
    website: 'www.powergrid.gov',
    notes: 'Important Notice: Please pay by the due date to avoid service disconnection.',
    footerText: 'Official utility billing statement and payment advice.'
  },
  water: {
    companyName: 'Municipal Water Board',
    address: 'Blue Water Hq, Reservoir Road',
    phone: '+1 555-0400',
    email: 'billing@waterboard.gov',
    website: 'www.waterboard.gov',
    notes: 'Environmental Tip: Fixing a leaky faucet can save over 3,000 gallons a year.',
    footerText: 'Official water supply consumption invoice.'
  },
  retail: {
    companyName: 'General Retail Store',
    address: '123 Commerce St, Market District',
    phone: '+1 555-0500',
    email: 'contact@retailstore.com',
    website: 'www.retailstore.com',
    notes: 'Thank you for shopping with us! Please keep your receipt for any returns.',
    footerText: 'This is an official sales receipt for your records.'
  }
};
