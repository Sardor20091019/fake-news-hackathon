import React from 'react';
import { ShieldCheck, ShieldAlert, Zap, Search } from 'lucide-react';

const GeminiVerdict = ({ data, isLoading }) => {
  if (isLoading) return (
    <div className="mt-6 p-8 border-2 border-dashed border-blue-500/20 rounded-2xl bg-blue-500/5 animate-pulse flex flex-col items-center">
      <Search className="text-blue-400 mb-2 animate-bounce" size={32} />
      <span className="font-mono text-sm text-blue-400 uppercase tracking-widest">Consulting Global Knowledge Graph...</span>
    </div>
  );

  if (!data) return null;

  const isFake = data.verdict === 'FAKE' || data.verdict === 'LIKELY_FAKE';

  return (
    <div className={`mt-6 p-6 border-l-8 rounded-2xl bg-slate-900 shadow-xl transition-all border ${isFake ? 'border-red-500/50 border-l-red-600' : 'border-emerald-500/50 border-l-emerald-600'}`}>
      <div className="flex items-start gap-5">
        <div className={`p-3 rounded-xl ${isFake ? 'bg-red-500/20' : 'bg-emerald-500/20'}`}>
          {isFake ? <ShieldAlert className="text-red-500" size={32} /> : <ShieldCheck className="text-emerald-500" size={32} />}
        </div>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={14} className="text-yellow-400 fill-yellow-400" />
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-[0.3em]">Gemini AI Intelligence</h3>
          </div>
          <div className={`text-3xl font-black italic tracking-tighter mb-2 ${isFake ? 'text-red-400' : 'text-emerald-400'}`}>
            VERDICT: {data.verdict}
          </div>
          <p className="text-slate-300 text-sm leading-relaxed max-w-2xl font-medium">
            {data.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default GeminiVerdict;