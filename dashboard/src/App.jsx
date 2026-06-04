import React, { useState } from 'react';
import { ShieldAlert, Cpu, Search, Zap, Loader2, ShieldCheck } from 'lucide-react';

import TrustScoreUI from '../TrustScoreUI';
import GeminiVerdict from './components/GeminiVerdict';

const App = () => {
  const [text, setText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const analyzeText = async () => {
    if (!text.trim()) return;
    setLoading(true);
    
    try {
      // FIX: Changed from remote Vercel URL to local Gateway Proxy
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/verify`, {
      method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, source_url: sourceUrl })
      });
      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Forensic engine error:", err);
      alert("Failed to connect to local Gateway. Ensure 'node verify_gateway.js' is running on port 3006.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-300 p-6 md:p-12 font-sans selection:bg-cyan-500/20">
      <div className="max-w-6xl mx-auto relative">
        <header className="mb-16">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-cyan-900 to-cyan-950 rounded-2xl border border-cyan-800/50 shadow-[0_0_30px_-5px_rgba(6,182,212,0.2)]">
              <ShieldAlert size={28} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-4xl font-black tracking-tight text-white italic">SOVEREIGN<span className="text-cyan-500">VERIFY</span></h1>
              <p className="text-[10px] font-mono text-cyan-600 uppercase tracking-[0.3em] mt-1">Forensic Linguistic Auditing System v3.1</p>
            </div>
          </div>
        </header>

        <main className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <section className="lg:col-span-5 space-y-8">
            <div className="bg-[#0b0d11]/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
              <textarea
                className="w-full h-72 bg-black/40 border border-slate-800 rounded-2xl p-6 text-sm font-mono text-slate-200 focus:ring-2 focus:ring-cyan-500/50 outline-none mb-6"
                placeholder="Paste content here..."
                value={text}
                onChange={(e) => setText(e.target.value)}
              />
              <button
                onClick={analyzeText}
                disabled={loading}
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black rounded-xl transition-all flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                {loading ? "AUDITING..." : "EXECUTE FORENSIC AUDIT"}
              </button>
            </div>
          </section>

          <section className="lg:col-span-7">
            {result ? (
              <div className="space-y-8">
                <GeminiVerdict data={result} />
                <TrustScoreUI data={result} />
              </div>
            ) : (
              <div className="h-full min-h-[500px] border border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center text-slate-700">
                <p className="text-xs font-mono tracking-widest uppercase">System Awaiting Protocol Execution</p>
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  );
};

export default App;