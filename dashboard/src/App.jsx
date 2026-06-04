import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Search, 
  RefreshCw, 
  FileText, 
  Settings, 
  Activity, 
  Info,
  ExternalLink,
  ThumbsUp,
  ThumbsDown,
  Database
} from 'lucide-react';

export default function App() {
  const [text, setText] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [nocache, setNocache] = useState(true);
  const [gatewayUrl, setGatewayUrl] = useState('http://127.0.0.1:3006/api/verify');
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState('');
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);

  // Mock Preset Examples
  const presets = {
    real: {
      title: "Astronomers Detect Exoplanet Water (Real)",
      text: "Astronomers using the James Webb Space Telescope have successfully detected atmospheric water vapor, carbon dioxide, and methane on a nearby rocky exoplanet orbiting a stable M-dwarf star, providing unprecedented data on potentially habitable environments outside our solar system.",
      source_url: "https://nasa.gov/webb-exoplanet-atmosphere"
    },
    fake: {
      title: "Cellular Bio-Battery Mutation (Fake)",
      text: "ALERT: A newly approved cellular battery upgrade in several major smartphone brands utilizes a bio-electric substance that emits high-frequency micro-radiation pulses. Medical whistleblowers warn these pulses permanently mutate human DNA within a 5-meter radius, causing rapid biological cellular decay.",
      source_url: "https://unverified-leak-forum.net/bio-battery-alert"
    }
  };

  const handleLoadPreset = (type) => {
    setText(presets[type].text);
    setSourceUrl(presets[type].source_url);
    setError(null);
  };

  const runVerification = async (e) => {
    if (e) e.preventDefault();
    if (text.trim().length < 50) {
      setError("Please input a text block of at least 50 characters to initiate a credible forensic audit.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    // Multi-phase loader simulation to match backend workflow
    const steps = [
      "Hashing payload & checking database cache...",
      "Consulting Stylometrics ML Classifier...",
      "Extracting local entity relationships...",
      "Connecting to Gemini 2.5 Flash Engine...",
      "Fusing probability weights and compiling audit reports..."
    ];

    let stepIdx = 0;
    setLoadingStep(steps[stepIdx]);
    const stepInterval = setInterval(() => {
      if (stepIdx < steps.length - 1) {
        stepIdx++;
        setLoadingStep(steps[stepIdx]);
      }
    }, 850);

    try {
      const url = `${gatewayUrl}${nocache ? '?nocache=true' : ''}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: text.trim(), 
          source_url: sourceUrl || undefined 
        })
      });

      clearInterval(stepInterval);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || errData.details || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
      
      // Save query history locally
      setHistory(prev => [
        {
          id: Date.now(),
          snippet: text.substring(0, 45) + "...",
          verdict: data.verdict,
          score: data.trust_score,
          cached: data.cached
        },
        ...prev.slice(0, 4)
      ]);

    } catch (err) {
      clearInterval(stepInterval);
      setError(err.message || "Unable to reach your Gateway. Make sure your Gateway is running on port 3006 and CORS is enabled.");
    } finally {
      setLoading(false);
      setLoadingStep('');
    }
  };

  // Helper colors based on verdict
  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case 'VERIFIED':
        return {
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          indicator: 'bg-emerald-500',
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />
        };
      case 'LIKELY_FAKE':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          indicator: 'bg-rose-500',
          icon: <ShieldAlert className="w-8 h-8 text-rose-400" />
        };
      default:
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          indicator: 'bg-amber-500',
          icon: <AlertTriangle className="w-8 h-8 text-amber-400" />
        };
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] bg-indigo-500/10 blur-[120px] pointer-events-none rounded-full" />

      {/* Header bar */}
      <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Sovereign Verify
              </h1>
              <p className="text-xs text-slate-500 font-mono">HYBRID COGNITIVE AUDIT LAB</p>
            </div>
          </div>

          {/* Quick Configs */}
          <div className="flex items-center gap-4 flex-wrap text-sm">
            <div className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Database className="w-4 h-4 text-indigo-400" />
              <input 
                type="text" 
                value={gatewayUrl} 
                onChange={(e) => setGatewayUrl(e.target.value)}
                className="bg-transparent border-none text-xs font-mono text-slate-300 focus:outline-none w-48"
              />
            </div>
            
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input 
                type="checkbox" 
                checked={nocache} 
                onChange={(e) => setNocache(e.target.checked)}
                className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-0 focus:ring-offset-0 w-4 h-4"
              />
              <span className="text-xs text-slate-400 font-mono">BYPASS_CACHE</span>
            </label>
          </div>
        </div>
      </header>

      {/* Main Grid Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Interactive panel (Inputs & controls) - 7 cols */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Input Diagnostics
              </h2>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleLoadPreset('real')}
                  className="px-3 py-1 text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg hover:bg-emerald-500/20 transition-all font-medium"
                >
                  Load Real News
                </button>
                <button 
                  onClick={() => handleLoadPreset('fake')}
                  className="px-3 py-1 text-xs bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-lg hover:bg-rose-500/20 transition-all font-medium"
                >
                  Load Fake News
                </button>
              </div>
            </div>

            <form onSubmit={runVerification} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">Claim Text (Min 50 chars)</label>
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder="Paste article, claim paragraph, or social post text here to initiate evaluation..."
                  rows={6}
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl p-4 text-slate-300 placeholder-slate-600 focus:outline-none transition-all text-sm resize-none"
                />
                <div className="flex justify-between text-xs text-slate-600 mt-1 font-mono">
                  <span>CHAR_COUNT: {text.length}</span>
                  {text.length > 0 && text.length < 50 && (
                    <span className="text-rose-500">Requires {50 - text.length} more characters</span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-500 uppercase tracking-widest mb-1.5">Source URL (Optional)</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  placeholder="https://example.com/source-article-link"
                  className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500/50 rounded-xl px-4 py-3 text-slate-300 placeholder-slate-600 focus:outline-none transition-all text-sm"
                />
              </div>

              {error && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs leading-relaxed flex items-start gap-3">
                  <Info className="w-5 h-5 shrink-0" />
                  <div>
                    <span className="font-bold">System Warning:</span> {error}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || text.length < 50}
                className={`w-full py-4 px-6 rounded-xl font-medium tracking-wide text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  loading || text.length < 50
                    ? 'bg-slate-800/50 border border-slate-800 text-slate-500 cursor-not-allowed shadow-none'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/10 cursor-pointer'
                }`}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                    <span>Executing Deep Audit...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 text-indigo-200" />
                    <span>Run Verification Protocol</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick instructions / Help */}
          <div className="bg-slate-900/20 border border-slate-900/60 rounded-xl p-4 flex gap-4 text-xs text-slate-500 leading-relaxed">
            <Info className="w-5 h-5 text-indigo-400/60 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-400 mb-1">How it Works:</p>
              By executing an audit, this site contacts your local gateway. If <span className="font-mono text-indigo-400 font-semibold">BYPASS_CACHE</span> is active, the system triggers the Gemini LLM pipeline and cross-references stylistic flags and local ML weights to dynamically rate content credibility.
            </div>
          </div>
        </div>

        {/* Right Dashboard panel (Results display) - 5 cols */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Default Empty State */}
          {!loading && !result && (
            <div className="border border-dashed border-slate-800/80 rounded-2xl p-10 text-center flex flex-col items-center justify-center min-h-[400px] bg-slate-900/10 backdrop-blur-sm">
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center text-slate-600 mb-4 border border-slate-800">
                <Activity className="w-8 h-8" />
              </div>
              <h3 className="text-slate-400 font-semibold mb-1">Diagnostic Engine Awaiting Payloads</h3>
              <p className="text-slate-600 text-xs max-w-sm">
                Paste your content or select one of our pre-configured news presets on the left to review systemic trust scores.
              </p>
            </div>
          )}

          {/* Running Analysis Loader Screen */}
          {loading && (
            <div className="border border-slate-900 bg-slate-900/20 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[400px] backdrop-blur-sm animate-pulse">
              <div className="relative mb-6">
                <div className="w-20 h-20 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-indigo-400 animate-bounce" />
                </div>
              </div>
              <span className="text-xs font-mono tracking-widest text-indigo-400 uppercase mb-2">Processing Thread</span>
              <p className="text-sm text-slate-400 font-medium transition-all duration-300">{loadingStep}</p>
            </div>
          )}

          {/* Real-Time Results Screen */}
          {!loading && result && (
            <div className="space-y-6">
              
              {/* Trust Score & Verdict Banner */}
              <div className={`border rounded-2xl p-6 backdrop-blur-sm transition-all ${getVerdictStyle(result.verdict).bg}`}>
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    {getVerdictStyle(result.verdict).icon}
                    <div>
                      <span className="text-xs font-mono tracking-wider opacity-60">VERDICT_CLASSIFICATION</span>
                      <h3 className="text-lg font-bold leading-tight tracking-wider font-mono">{result.verdict}</h3>
                    </div>
                  </div>
                  {result.cached && (
                    <span className="bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-mono px-2.5 py-0.5 rounded-full">
                      DATABASE CACHE HIT
                    </span>
                  )}
                </div>

                {/* Score representation */}
                <div className="space-y-2 mt-6">
                  <div className="flex justify-between items-end">
                    <span className="text-xs font-mono opacity-80">OVERALL_CREDIBILITY</span>
                    <span className="text-3xl font-extrabold font-mono tracking-tighter">{result.trust_score}%</span>
                  </div>
                  <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${getVerdictStyle(result.verdict).indicator}`}
                      style={{ width: `${result.trust_score}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 font-mono pt-1">
                    <span>0% (UNTRUSTWORTHY)</span>
                    <span>100% (HIGHLY CREDIBLE)</span>
                  </div>
                </div>
              </div>

              {/* Summary / Explanation Block */}
              <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm">
                <h4 className="text-xs font-mono tracking-widest text-slate-500 uppercase mb-3">AI Engine Evaluation</h4>
                <p className="text-sm text-slate-300 leading-relaxed font-light">
                  {result.fact_check_summary}
                </p>
              </div>

              {/* Flagged Phrases Section */}
              {result.flagged_phrases && result.flagged_phrases.length > 0 && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-mono tracking-widest text-slate-500 uppercase">Suspicious Flagged Elements ({result.flagged_phrases.length})</h4>
                  </div>

                  <div className="space-y-3">
                    {result.flagged_phrases.map((item, index) => (
                      <div key={index} className="border border-slate-900 bg-slate-900/20 rounded-xl p-4 space-y-2.5 hover:border-slate-800 transition-all">
                        <div className="flex justify-between items-start gap-3">
                          <span className="text-xs text-rose-400 italic font-medium bg-rose-500/5 px-2.5 py-1 rounded-lg border border-rose-500/10">
                            "{item.exact_phrase}"
                          </span>
                          <span className={`text-[9px] font-mono tracking-wider px-2 py-0.5 rounded-md shrink-0 border ${
                            item.severity === 'HIGH' 
                              ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                              : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                          }`}>
                            {item.severity} SEVERITY
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed pl-1">
                          <span className="font-mono text-slate-500 text-[10px] uppercase block mb-0.5">FORENSIC ANALYSIS</span>
                          {item.reason}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No anomalies found block */}
              {(!result.flagged_phrases || result.flagged_phrases.length === 0) && (
                <div className="bg-slate-900/10 border border-slate-900 border-dashed rounded-xl p-6 text-center space-y-1">
                  <ShieldCheck className="w-8 h-8 text-emerald-400/50 mx-auto mb-1" />
                  <p className="text-xs text-slate-400 font-semibold">No critical stylistic anomalies or falsified phrases detected</p>
                  <p className="text-[10px] text-slate-600">The analyzed claims align closely with verified public registries and academic data.</p>
                </div>
              )}

            </div>
          )}

          {/* Session Query History */}
          {history.length > 0 && (
            <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-6 backdrop-blur-sm">
              <h4 className="text-xs font-mono tracking-widest text-slate-500 uppercase mb-4">SESSION AUDIT LOG</h4>
              <div className="space-y-3">
                {history.map((hItem) => (
                  <div key={hItem.id} className="flex items-center justify-between gap-4 text-xs font-mono p-2 border-b border-slate-900 last:border-b-0 pb-3 last:pb-0">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-slate-300 font-sans truncate">{hItem.snippet}</p>
                      <div className="flex items-center gap-2 text-[10px]">
                        <span className={`font-semibold ${
                          hItem.verdict === 'VERIFIED' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>{hItem.verdict}</span>
                        <span className="text-slate-600">•</span>
                        <span className="text-slate-500">{hItem.score}% Score</span>
                      </div>
                    </div>
                    {hItem.cached && (
                      <span className="text-[8px] bg-indigo-500/15 text-indigo-400 border border-indigo-500/25 px-1.5 py-0.5 rounded uppercase">Cached</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer information */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 mt-12">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-600">
          <p className="font-mono">SOVEREIGN VERIFY SYSTEMS INC. © 2026. ALL RIGHTS RESERVED.</p>
          <div className="flex gap-4">
            <span className="font-mono">GATEWAY_VER: 3.2.1-BETA</span>
            <span>•</span>
            <span className="font-mono">MODEL: GEMINI-2.5-FLASH</span>
          </div>
        </div>
      </footer>
    </div>
  );
}