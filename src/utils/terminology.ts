import type { ReceiptTheme } from '../model';

export type IndustryTerminology = {
  customerLabel: string;
  customerGreeting: string;
  itemsLabel: string;
  itemCodeLabel: string;
  referenceLabel: string;
  footerDefault: string;
  documentTitle: string;
  invoiceTitle: string;
};

const terminologyMap: Record<ReceiptTheme, IndustryTerminology> = {
  hospital: {
    customerLabel: 'Patient Name',
    customerGreeting: 'Patient Details',
    itemsLabel: 'Treatment / Service',
    itemCodeLabel: 'Service Code',
    referenceLabel: 'Patient ID',
    footerDefault: 'This document serves as an official medical receipt.',
    documentTitle: 'Medical Receipt',
    invoiceTitle: 'Medical Invoice'
  },
  pharmacy: {
    customerLabel: 'Client Name',
    customerGreeting: 'Client Information',
    itemsLabel: 'Medication',
    itemCodeLabel: 'Batch No.',
    referenceLabel: 'Prescription No.',
    footerDefault: 'Digitally generated pharmacy receipt.',
    documentTitle: 'Pharmacy Receipt',
    invoiceTitle: 'Pharmacy Invoice'
  },
  electricity: {
    customerLabel: 'Subscriber',
    customerGreeting: 'Account Details',
    itemsLabel: 'Billing Components',
    itemCodeLabel: 'Tariff',
    referenceLabel: 'Account Holder',
    footerDefault: 'Official utility bill & payment receipt.',
    documentTitle: 'Utility Bill',
    invoiceTitle: 'Utility Tax Invoice'
  },
  water: {
    customerLabel: 'Subscriber',
    customerGreeting: 'Account Details',
    itemsLabel: 'Usage Details',
    itemCodeLabel: 'Tariff',
    referenceLabel: 'Connection No.',
    footerDefault: 'Official utility bill & payment receipt.',
    documentTitle: 'Utility Bill',
    invoiceTitle: 'Utility Tax Invoice'
  },
  retail: {
    customerLabel: 'Customer',
    customerGreeting: 'Customer Info',
    itemsLabel: 'Products',
    itemCodeLabel: 'SKU / Barcode',
    referenceLabel: 'Order Ref',
    footerDefault: 'Official Sales Receipt.',
    documentTitle: 'Sales Receipt',
    invoiceTitle: 'Tax Invoice'
  }
};

export const getIndustryTerminology = (theme: ReceiptTheme): IndustryTerminology => {
  return terminologyMap[theme];
};

export const INDUSTRY_SNIPPETS = {
  payment: [
    "Thank you for your business.",
    "Payment is due within 7 days.",
    "This bill serves as an official receipt.",
    "Goods once sold are not returnable.",
    "Medical services are exempt from VAT in some jurisdictions.",
    "Please quote the invoice number for all bank transfers.",
    "Interest of 2% will be charged on overdue payments."
  ],
  thankYou: [
    "We appreciate your trust in our services.",
    "Thank you for choosing us for your healthcare needs.",
    "Thank you for being a valued subscriber.",
    "Hope to see you again soon!",
    "Providing quality service is our top priority.",
    "Digitally signed and authorized document."
  ]
};
