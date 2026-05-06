import React, { useState } from 'react';
import { Lock, ShieldCheck, AlertCircle, ChevronRight } from 'lucide-react';
import { loginWithCode } from '../utils/storage';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface GatekeeperProps {
  onUnlock: () => void;
}

const Gatekeeper: React.FC<GatekeeperProps> = ({ onUnlock }) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = loginWithCode(code);
    
    if (success) {
      onUnlock();
    } else {
      setError(true);
      setIsAnimating(true);
      setTimeout(() => setIsAnimating(false), 500);
      setCode('');
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6 font-modern">
      <div className={cn(
        "max-w-md w-full space-y-8 transition-all duration-500",
        isAnimating ? "animate-shake" : ""
      )}>
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-2xl shadow-slate-200">
            <Lock size={32} className="text-white" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black uppercase tracking-tighter text-slate-900">Protected System</h1>
            <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Authorization Required</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100 space-y-6">
          <div className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  setError(false);
                }}
                placeholder="ENTER ACCESS CODE"
                className={cn(
                  "w-full px-6 py-5 bg-white border rounded-2xl outline-none transition-all text-center font-black tracking-[0.3em] placeholder:tracking-widest placeholder:font-bold placeholder:text-slate-200",
                  error ? "border-red-500 text-red-500" : "border-slate-100 focus:border-slate-900"
                )}
                autoFocus
              />
            </div>
            
            {error && (
              <div className="flex items-center justify-center gap-2 text-red-500 animate-in fade-in zoom-in-95 duration-300">
                <AlertCircle size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Invalid Access Code</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] flex items-center justify-center gap-3 hover:bg-black transition-all active:scale-[0.98] shadow-xl shadow-slate-200"
          >
            Unlock System <ChevronRight size={14} strokeWidth={2.5} />
          </button>
        </form>

        <div className="flex items-center justify-center gap-2 text-slate-300">
          <ShieldCheck size={14} />
          <p className="text-[9px] font-black uppercase tracking-widest">Secure Environment Verified</p>
        </div>
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-8px); }
          75% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.2s ease-in-out 0s 2;
        }
      `}</style>
    </div>
  );
};

export default Gatekeeper;
