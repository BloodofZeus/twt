import type { ReceiptTheme } from '../model';

export const DEFAULT_CUSTOMER_PERSONA = {
  name: 'Emily R. Davidson',
  address: '742 Evergreen Terrace, Springfield, IL 62704, USA',
  phone: '+1 (217) 555-0198',
  email: 'emily.davidson@email-provider.com'
};

export const INDUSTRY_DEFAULTS: Record<ReceiptTheme, any> = {
  hospital: {
    companyName: 'Springfield Memorial Hospital',
    address: '701 N 1st St, Springfield, IL 62781, USA',
    phone: '+1 (217) 788-3000',
    email: 'billing@springfield-memorial.org',
    website: 'www.springfield-memorial.org',
    notes: 'Please bring your insurance card for future visits.',
    footerText: 'Thank you for choosing Springfield Memorial for your care.'
  },
  pharmacy: {
    companyName: 'Capitol City Wellness Pharmacy',
    address: '1000 S Grand Ave E, Springfield, IL 62703, USA',
    phone: '+1 (217) 555-0456',
    email: 'dispensary@capitol-wellness.com',
    website: 'www.capitol-wellness.com',
    notes: 'Keep all medications out of reach of children.',
    footerText: 'Your health is our priority. Get well soon!'
  },
  electricity: {
    companyName: 'City Water, Light & Power (CWLP)',
    address: '800 E Monroe St, Springfield, IL 62701, USA',
    phone: '+1 (217) 789-2000',
    email: 'support@cwlp.com',
    website: 'www.cwlp.com',
    notes: 'Pay by the 15th to avoid late payment surcharges.',
    footerText: 'Powering Springfield with reliable energy.'
  },
  water: {
    companyName: 'Springfield Water District',
    address: '201 E Washington St, Springfield, IL 62701, USA',
    phone: '+1 (217) 555-0999',
    email: 'billing@springfield-water.gov',
    website: 'www.springfield-water.gov',
    notes: 'Please report any leaks immediately to our 24/7 hotline.',
    footerText: 'Safe, clean water for our Springfield community.'
  },
  retail: {
    companyName: 'Lincoln Square Boutique',
    address: '1 Old State Capitol Plaza, Springfield, IL 62701, USA',
    phone: '+1 (217) 555-1122',
    email: 'hello@lincoln-square-boutique.com',
    website: 'www.lincoln-square-boutique.com',
    notes: 'Returns accepted within 30 days with original receipt.',
    footerText: 'Thank you for shopping local in Springfield!'
  }
};
