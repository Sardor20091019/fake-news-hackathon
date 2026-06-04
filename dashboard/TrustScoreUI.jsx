import React from "react";

const COLORS = {
  bg:          "#050608",
  emerald:     "#10b981",
  emeraldGlow: "rgba(16, 185, 129, 0.15)",
  amber:       "#f59e0b",
  amberGlow:   "rgba(245, 158, 11, 0.15)",
  red:         "#ef4444",
  redGlow:     "rgba(239, 68, 68, 0.15)",
};

function TrustGauge({ score }) {
  const R = 80;
  const cx = 100, cy = 100;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * R;
  const offset = circumference - (score / 100) * circumference;

  const color = score >= 65 ? COLORS.emerald : score >= 35 ? COLORS.amber : COLORS.red;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-52 h-52 -rotate-90">
        <circle cx={cx} cy={cy} r={R} fill="none" stroke="#1e293b" strokeWidth={strokeWidth} />
        <circle 
          cx={cx} cy={cy} r={R} 
          fill="none" 
          stroke={color} 
          strokeWidth={strokeWidth} 
          strokeDasharray={circumference} 
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
          style={{ filter: `drop-shadow(0 0 10px ${color})` }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-black tracking-tighter text-white">{Math.round(score)}</span>
        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.2em]">Trust Score</span>
      </div>
    </div>
  );
}

export default function TrustScoreUI({ data }) {
  // Metric defaults if backend returns undefined/null
  const metrics = [
    { label: "Stylometric", score: data.tier_scores?.stylometric ?? 45 },
    { label: "Source", score: data.tier_scores?.source_metadata ?? 20 },
    { label: "Fact Check", score: data.tier_scores?.knowledge_graph ?? 30 },
    { label: "Confidence", score: data.tier_scores?.model_confidence ?? 80 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 delay-300">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0b0d11]/80 border border-slate-800 rounded-3xl p-8 flex items-center justify-center">
          <TrustGauge score={data.trust_score ?? 0} />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {metrics.map((item, i) => (
            <div key={i} className="bg-[#0b0d11]/80 border border-slate-800 rounded-2xl p-6 hover:border-cyan-900/50 transition-all">
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{item.label}</p>
              <p className="text-2xl font-black mt-2">{Math.round(item.score)}</p>
            </div>
          ))}
        </div>
      </div>

      {data.flagged_phrases && data.flagged_phrases.length > 0 && (
        <div className="bg-[#0b0d11]/80 border border-slate-800 rounded-3xl p-8">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
            Forensic Flagging Summary
          </h4>
          <div className="space-y-4">
            {data.flagged_phrases.map((f, i) => (
              <div key={i} className="flex gap-4 p-4 rounded-xl bg-slate-900/30 border border-slate-800">
                <span className={`w-2 h-2 rounded-full mt-1.5 ${f.severity === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`} />
                <div>
                  <p className="text-xs font-bold text-slate-200">"{f.phrase || f.exact_phrase}"</p>
                  <p className="text-[11px] text-slate-500 mt-1">{f.reason}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}