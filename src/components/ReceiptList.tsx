import React from 'react';
import type { ReceiptData } from '../model';
import { Trash2, FileText, CheckCircle2, Clock, XCircle, ArrowRight } from 'lucide-react';
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
      case 'paid': return <CheckCircle2 size={12} strokeWidth={2.5} className="text-slate-900" />;
      case 'pending': return <Clock size={12} strokeWidth={2.5} className="text-slate-400" />;
      case 'cancelled': return <XCircle size={12} strokeWidth={2.5} className="text-red-400" />;
      default: return null;
    }
  };

  if (receipts.length === 0) {
    return (
      <div className="p-20 text-center space-y-4">
        <div className="w-12 h-12 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-200">
          <FileText size={20} strokeWidth={1} />
        </div>
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">Archive Empty</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-50">
      {receipts.map((receipt) => (
        <div 
          key={receipt.id}
          className={cn(
            "group flex items-center gap-6 p-6 transition-all cursor-pointer relative",
            activeId === receipt.id ? "bg-slate-50/50" : "bg-white hover:bg-slate-50/30"
          )}
          onClick={() => onView(receipt)}
        >
          {activeId === receipt.id && (
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-900"></div>
          )}
          
          <div className="hidden sm:flex flex-col items-center justify-center w-10 text-center border-r border-slate-50 pr-6">
            <span className="text-[9px] font-black text-slate-300 uppercase tracking-tighter leading-none mb-1">
              {new Date(receipt.date).toLocaleString('default', { month: 'short' })}
            </span>
            <span className="text-sm font-black text-slate-900 leading-none">
              {new Date(receipt.date).getDate()}
            </span>
          </div>
          
          <div className="flex-grow min-w-0 space-y-1">
            <div className="flex items-center gap-3">
              <h4 className="font-black text-slate-900 truncate text-xs uppercase tracking-tight">
                {receipt.customerName || 'Walk-in Customer'}
              </h4>
              <div className="flex gap-1.5">
                <span className="text-[8px] font-black px-1.5 py-0.5 border border-slate-100 text-slate-400 rounded-md uppercase tracking-widest">
                  {receipt.theme}
                </span>
                <span className={cn(
                  "text-[8px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-widest",
                  receipt.documentType === 'invoice' ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500"
                )}>
                  {receipt.documentType}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[9px] font-black text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5">
                {getStatusIcon(receipt.status)}
                <span className={cn(receipt.status === 'paid' ? "text-slate-900" : "")}>{receipt.status}</span>
              </span>
              <span className="text-slate-100">•</span>
              <span>{receipt.paymentMethod}</span>
              <span className="text-slate-100">•</span>
              <span className="opacity-50">#{receipt.id.slice(0, 4)}</span>
            </div>
          </div>

          <div className="text-right">
            <p className="font-black text-slate-900 text-sm tracking-tight">
              {receipt.currency}{receipt.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{receipt.items.length} Items</p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete(receipt.id);
              }}
              className="p-2 text-slate-200 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
              title="Delete Permanently"
            >
              <Trash2 size={14} strokeWidth={2} />
            </button>
            <ArrowRight size={14} strokeWidth={2.5} className="text-slate-200 group-hover:text-slate-900 transition-all group-hover:translate-x-1" />
          </div>
        </div>
      ))}
    </div>
  );
};

export default ReceiptList;
