import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { ReceiptData } from '../model';

export const generateProgrammaticPDF = async (data: ReceiptData): Promise<Blob> => {
  // Safe currency symbol handling for PDF (standard fonts have limited support)
  const getSafeCurrency = (symbol: string) => {
    if (symbol === 'GH₵') return 'GHS ';
    if (symbol === '₦') return 'NGN ';
    return symbol;
  };

  const safeCurrency = getSafeCurrency(data.currency);

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  let currentY = 20;

  // Helper for text alignment and styling
  const addText = (text: string, x: number, y: number, size = 10, style = 'normal', color = [0, 0, 0], align: 'left' | 'center' | 'right' = 'left') => {
    doc.setFontSize(size);
    doc.setFont('helvetica', style);
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(text, x, y, { align });
  };

  // 1. Header & Logo
  if (data.company.logoUrl) {
    try {
      // If it's a relative path, we need the full URL for the capture engine in node/browser
      const logoSrc = data.company.logoUrl.startsWith('/') 
        ? window.location.origin + data.company.logoUrl 
        : data.company.logoUrl;
      
      // Use standard image adding to avoid CORS/taint issues if it's base64 or local
      doc.addImage(logoSrc, 'PNG', margin, currentY, 25, 25);
    } catch (e) {
      console.warn('Could not add logo to PDF:', e);
    }
  }

  // Company Info (Right aligned)
  const rightX = pageWidth - margin;
  addText(data.company.name.toUpperCase(), rightX, currentY + 5, 16, 'bold', [30, 41, 59], 'right');
  addText(data.company.address, rightX, currentY + 12, 9, 'normal', [100, 116, 139], 'right');
  addText(data.company.phone, rightX, currentY + 17, 9, 'normal', [100, 116, 139], 'right');
  
  currentY += 35;

  // 2. Document Title & Metadata
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 10;

  const title = data.documentType === 'invoice' ? 'INVOICE' : 'OFFICIAL RECEIPT';
  addText(title, margin, currentY, 24, 'bold', [37, 99, 235]); // blue-600
  
  addText(`NO: ${data.id.slice(0, 8).toUpperCase()}`, rightX, currentY, 10, 'bold', [15, 23, 42], 'right');
  currentY += 8;
  addText(`DATE: ${data.date}`, rightX, currentY, 9, 'normal', [100, 116, 139], 'right');
  
  currentY += 15;

  // 3. Bill To & Industry Info
  addText('BILL TO:', margin, currentY, 9, 'bold', [100, 116, 139]);
  currentY += 6;
  addText(data.customerName, margin, currentY, 11, 'bold', [15, 23, 42]);
  currentY += 5;
  if (data.customerAddress) {
    addText(data.customerAddress, margin, currentY, 9, 'normal', [100, 116, 139]);
    currentY += 4;
  }
  if (data.customerPhone) {
    addText(`TEL: ${data.customerPhone}`, margin, currentY, 8, 'normal', [148, 163, 184]);
    currentY += 4;
  }
  if (data.customerEmail) {
    addText(data.customerEmail, margin, currentY, 8, 'normal', [148, 163, 184]);
    currentY += 4;
  }
  
  // Industry specific box (if applicable)
  const middleX = pageWidth / 2;
  if (data.theme === 'hospital' || data.theme === 'pharmacy') {
      addText('MEDICAL RECORD:', middleX, currentY - 11, 9, 'bold', [100, 116, 139]);
      addText(`Patient ID: ${data.medicalData?.patientId || 'N/A'}`, middleX, currentY - 5, 9, 'normal', [15, 23, 42]);
      addText(`Doctor: ${data.medicalData?.doctorName || 'N/A'}`, middleX, currentY, 9, 'normal', [15, 23, 42]);
  } else if (data.theme === 'electricity' || data.theme === 'water') {
      addText('UTILITY DATA:', middleX, currentY - 11, 9, 'bold', [100, 116, 139]);
      addText(`Meter: ${data.utilityData?.meterNumber || 'N/A'}`, middleX, currentY - 5, 9, 'normal', [15, 23, 42]);
      addText(`Reading: ${data.utilityData?.currentReading || 0} ${data.utilityData?.consumptionUnit || ''}`, middleX, currentY, 9, 'normal', [15, 23, 42]);
  }

  currentY += 15;

  // 4. Items Table
  const tableData = data.items.map(item => [
    item.description || 'General Service',
    item.quantity.toString(),
    `${safeCurrency}${item.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
    `${safeCurrency}${(item.quantity * item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [['Description', 'Qty', 'Unit Price', 'Total']],
    body: tableData,
    margin: { left: margin, right: margin },
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { font: 'helvetica', fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 'auto' },
      1: { cellWidth: 20, halign: 'center' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' }
    }
  });

  currentY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // 5. Totals
  const summaryX = pageWidth - margin - 60;
  const valX = pageWidth - margin;

  const addSummaryRow = (label: string, value: string, isTotal = false) => {
    const fontSize = isTotal ? 12 : 9;
    const style = isTotal ? 'bold' : 'normal';
    const color = isTotal ? [37, 99, 235] : [100, 116, 139];
    
    addText(label, summaryX, currentY, fontSize, style, color);
    addText(value, valX, currentY, fontSize, style, isTotal ? [15, 23, 42] : color, 'right');
    currentY += isTotal ? 8 : 6;
  };

  addSummaryRow('Subtotal:', `${safeCurrency}${data.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
  if (data.taxAmount > 0) {
    addSummaryRow(`Tax (${data.taxRate}%):`, `${safeCurrency}${data.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
  }
  if (data.discount > 0) {
    addSummaryRow('Discount:', `-${safeCurrency}${data.discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`);
  }
  
  currentY += 2;
  doc.setDrawColor(226, 232, 240);
  doc.line(summaryX, currentY - 4, valX, currentY - 4);
  addSummaryRow(data.documentType === 'invoice' ? 'GRAND TOTAL:' : 'TOTAL PAID:', `${safeCurrency}${data.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, true);

  // 6. Footer
  currentY = Math.max(currentY + 20, doc.internal.pageSize.getHeight() - 40);
  
  doc.setDrawColor(241, 245, 249);
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, currentY, pageWidth - (margin * 2), 20, 'F');
  
  addText('NOTES & TERMS', margin + 5, currentY + 7, 8, 'bold', [100, 116, 139]);
  addText(data.notes || 'None', margin + 5, currentY + 13, 8, 'normal', [100, 116, 139]);
  
  currentY += 25;
  addText(`*** DOCUMENT STATUS: ${data.status.toUpperCase()} ***`, pageWidth / 2, currentY, 10, 'bold', [30, 41, 59], 'center');
  
  if (data.footerText) {
    addText(data.footerText, pageWidth / 2, currentY + 8, 8, 'italic', [148, 163, 184], 'center');
  }

  return doc.output('blob');
};
