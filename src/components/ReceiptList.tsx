import React from 'react';
import type { ReceiptData } from '../model';
import { Trash2, FileText, ChevronRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ReceiptListProps {
  receipts: ReceiptData[];
  onDelete: (id: string) => void;
  onView: (receipt: ReceiptData) => void;
  activeId?: string;
}

const ReceiptList: React.FC<ReceiptListProps> = ({ receipts, onDelete, onView, activeId }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid': return <CheckCircle2 size={14} className="text-green-500" />;
      case 'pending': return <Clock size={14} className="text-orange-500" />;
      case 'cancelled': return <XCircle size={14} className="text-red-500" />;
      default: return null;
    }
  };

  if (receipts.length === 0) {
    return (
      <div className="p-12 text-center">
        <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText size={32} />
        </div>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">No transaction history</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50">
      {receipts.map((receipt) => (
        <div 
          key={receipt.id}
          className={cn(
            "group flex items-center gap-4 p-4 hover:bg-slate-50 transition-all cursor-pointer",
            activeId === receipt.id ? "bg-blue-50/50 ring-1 ring-blue-100" : ""
          )}
          onClick={() => onView(receipt)}
        >
          <div className="hidden sm:flex flex-col items-center justify-center w-12 text-center border-r border-slate-100 pr-4">
            <span className="text-[10px] font-black text-slate-400 uppercase leading-none">
              {new Date(receipt.date).toLocaleString('default', { month: 'short' })}
            </span>
            <span className="text-lg font-black text-slate-700 leading-none">
              {new Date(receipt.date).getDate()}
            </span>
          </div>
          
          <div className="flex-grow min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="font-black text-slate-800 truncate text-sm uppercase tracking-tight">
                {receipt.customerName || 'Cash Customer'}
              </h4>
              <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded uppercase">
                {receipt.theme}
              </span>
              <span className={cn(
                "text-[9px] font-black px-1.5 py-0.5 rounded uppercase",
                receipt.documentType === 'invoice' ? "bg-purple-100 text-purple-600" : "bg-blue-100 text-blue-600"
              )}>
                {receipt.documentType}
              </span>
            </div>
            <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
              <span className="flex items-center gap-1">
                {getStatusIcon(receipt.status)} {receipt.status}
              </span>
              <span>•</span>
              <span>{receipt.paymentMethod}</span>
              <span>•</span>
              <span className="text-slate-300">#{receipt.id.slice(0, 6)}</span>
            </div>
          </div>

          <div className="text-right">
            <p className="font-black text-slate-900 text-sm">
              {receipt.currency}{receipt.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[9px] font-bold text-slate-400 uppercase">{receipt.items.length} Items</p>
          </div>

          <div className="flex items-center gap-1 pl-2">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(receipt.id);
              }}
              className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all md:opacity-0 md:group-hover:opacity-100"
            >
              <Trash2 size={16} />
            </button>
            <ChevronRight size={16} className="text-slate-200 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReceiptList;
