import { useState, useRef } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const API_BASE = "http://localhost:3001"; 

const COLORS = {
  bg:           "#0d0d0d",
  surface:      "#141414",
  surfaceHover: "#1a1a1a",
  border:       "#262626",
  text:         "#e8e8e8",
  muted:        "#6b6b6b",
  amber:        "#d97706",
  amberLight:   "#fbbf24",
  amberGlow:    "rgba(217,119,6,0.12)",
  emerald:      "#059669",
  emeraldLight: "#34d399",
  emeraldGlow:  "rgba(5,150,105,0.12)",
  red:          "#dc2626",
  redGlow:      "rgba(220,38,38,0.12)",
  orange:       "#ea580c",
  grayGlow:     "rgba(107,107,107,0.12)",
};

// ─── Trust Score Gauge ────────────────────────────────────────────────────────

function TrustGauge({ score }) {
  const isMissing = score === null || score === undefined;
  const safeScore = isMissing ? 0 : score;
  
  const R = 72;
  const cx = 90, cy = 90;
  const startAngle = -210;
  const sweepAngle = 240;
  const toRad = (deg) => (deg * Math.PI) / 180;

  const describeArc = (start, sweep) => {
    const s = toRad(start);
    const e = toRad(start + sweep);
    const x1 = cx + R * Math.cos(s);
    const y1 = cy + R * Math.sin(s);
    const x2 = cx + R * Math.cos(e);
    const y2 = cy + R * Math.sin(e);
    const largeArc = Math.abs(sweep) > 180 ? 1 : 0;
    return `M ${x1} ${y1} A ${R} ${R} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const filled = (safeScore / 100) * sweepAngle;
  
  const gaugeColor =
    isMissing ? COLORS.muted :
    safeScore >= 65 ? COLORS.emeraldLight :
    safeScore >= 35 ? COLORS.amberLight :
    "#ef4444";
    
  const glowColor =
    isMissing ? COLORS.grayGlow :
    safeScore >= 65 ? COLORS.emeraldGlow :
    safeScore >= 35 ? COLORS.amberGlow :
    COLORS.redGlow;
    
  const verdict =
    isMissing ? "INCONCLUSIVE" :
    safeScore >= 65 ? "VERIFIED" :
    safeScore >= 35 ? "SUSPICIOUS" :
    "LIKELY FAKE";

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
      <svg width="180" height="160" viewBox="0 0 180 160">
        <path
          d={describeArc(startAngle, sweepAngle)}
          fill="none"
          stroke={COLORS.border}
          strokeWidth="10"
          strokeLinecap="round"
        />
        {!isMissing && safeScore > 0 && (
          <path
            d={describeArc(startAngle, filled)}
            fill="none"
            stroke={gaugeColor}
            strokeWidth="10"
            strokeLinecap="round"
            style={{ filter: `drop-shadow(0 0 6px ${gaugeColor}80)` }}
          />
        )}
        <text
          x={cx} y={cy + 6}
          textAnchor="middle"
          fill={gaugeColor}
          fontSize="32"
          fontWeight="600"
          fontFamily="'Courier New', monospace"
        >
          {isMissing ? "--" : Math.round(safeScore)}
        </text>
        <text
          x={cx} y={cy + 24}
          textAnchor="middle"
          fill={COLORS.muted}
          fontSize="11"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.08em"
        >
          TRUST SCORE
        </text>
      </svg>

      <div style={{
        padding: "4px 16px",
        borderRadius: 4,
        border: `1px solid ${gaugeColor}40`,
        background: glowColor,
        color: gaugeColor,
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: "0.15em",
        fontFamily: "'Courier New', monospace",
      }}>
        {verdict}
      </div>
    </div>
  );
}

// ─── Tier Score Card ──────────────────────────────────────────────────────────

function TierCard({ label, score, icon }) {
  const isMissing = score === null || score === undefined;
  const safeScore = isMissing ? 0 : score;
  
  const color =
    isMissing ? COLORS.muted :
    safeScore >= 65 ? COLORS.emeraldLight :
    safeScore >= 35 ? COLORS.amberLight :
    "#ef4444";

  return (
    <div style={{
      background: COLORS.surface,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 8,
      padding: "12px 16px",
      flex: 1,
    }}>
      <div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 6, letterSpacing: "0.08em" }}>
        {icon} {label.toUpperCase()}
      </div>
      <div style={{
        fontSize: 24,
        fontWeight: 600,
        color,
        fontFamily: "'Courier New', monospace",
        textShadow: isMissing ? "none" : `0 0 12px ${color}60`,
      }}>
        {isMissing ? "N/A" : Math.round(safeScore)}
        {!isMissing && <span style={{ fontSize: 12, color: COLORS.muted, fontFamily: "system-ui" }}>/100</span>}
      </div>
      <div style={{ height: 2, background: COLORS.border, borderRadius: 2, marginTop: 8 }}>
        {!isMissing && (
          <div style={{
            height: 2,
            width: `${safeScore}%`,
            background: color,
            borderRadius: 2,
            boxShadow: `0 0 6px ${color}`,
            transition: "width 1s ease",
          }} />
        )}
      </div>
    </div>
  );
}

// ─── Highlighted Article Text ─────────────────────────────────────────────────

function HighlightedText({ text, flags }) {
  if (!flags || flags.length === 0) {
    return (
      <p style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.8, whiteSpace: "pre-wrap" }}>
        {text}
      </p>
    );
  }

  const sorted = [...flags].sort((a, b) => a.start - b.start);
  const segments = [];
  let cursor = 0;

  for (const flag of sorted) {
    if (flag.start > cursor) {
      segments.push({ type: "plain", text: text.slice(cursor, flag.start) });
    }
    if (flag.end > cursor) {
      segments.push({ type: "flag", text: text.slice(flag.start, flag.end), flag });
      cursor = flag.end;
    }
  }
  if (cursor < text.length) {
    segments.push({ type: "plain", text: text.slice(cursor) });
  }

  return (
    <p style={{ color: COLORS.text, fontSize: 14, lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
      {segments.map((seg, i) =>
        seg.type === "plain" ? (
          <span key={i}>{seg.text}</span>
        ) : (
          <span key={i} style={{ position: "relative", display: "inline" }}>
            <mark
              title={`${seg.flag.reason}`}
              style={{
                background: seg.flag.severity === "danger"
                  ? "rgba(220,38,38,0.18)"
                  : "rgba(217,119,6,0.18)",
                color: seg.flag.severity === "danger"
                  ? "#fca5a5"
                  : COLORS.amberLight,
                borderBottom: `1.5px solid ${seg.flag.severity === "danger" ? "#ef4444" : COLORS.amber}`,
                borderRadius: 2,
                padding: "1px 0",
                cursor: "help",
              }}
            >
              {seg.text}
            </mark>
            <sup style={{
              fontSize: 9,
              color: seg.flag.severity === "danger" ? "#ef4444" : COLORS.amber,
              marginLeft: 2,
            }}>
              ⚑
            </sup>
          </span>
        )
      )}
    </p>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────

export default function FakeNewsDetector() {
  const [articleText, setArticleText] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const textareaRef = useRef(null);

  const analyze = async () => {
    if (articleText.trim().length < 50) {
      setError("Paste at least 50 characters of article text.");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_BASE}/api/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: articleText, source_url: sourceUrl || null }),
      });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      setResult(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const container = {
    minHeight: "100vh",
    background: COLORS.bg,
    color: COLORS.text,
    fontFamily: "'Inter', system-ui, sans-serif",
    padding: "40px 24px",
  };

  const card = {
    background: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: 12,
    padding: "24px",
    marginBottom: 16,
  };

  return (
    <div style={container}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <div style={{
            fontSize: 10,
            letterSpacing: "0.25em",
            color: COLORS.amber,
            marginBottom: 8,
            fontFamily: "'Courier New', monospace",
          }}>
            HYBRID VERIFICATION ENGINE v1.1
          </div>
          <h1 style={{
            fontSize: 28,
            fontWeight: 300,
            margin: 0,
            color: COLORS.text,
            letterSpacing: "-0.02em",
          }}>
            Fake News <span style={{ color: COLORS.amberLight, fontWeight: 600 }}>Detector</span>
          </h1>
          <p style={{ color: COLORS.muted, fontSize: 13, marginTop: 8 }}>
            Three-tier analysis: stylometric · source metadata · knowledge graph
          </p>
        </div>

        {/* Input section */}
        <div style={card}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              SOURCE URL (OPTIONAL)
            </label>
            <input
              type="text"
              value={sourceUrl}
              onChange={(e) => setSourceUrl(e.target.value)}
              placeholder="https://example.com/article"
              style={{
                width: "100%",
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: "10px 12px",
                color: COLORS.text,
                fontSize: 14,
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 11, color: COLORS.muted, letterSpacing: "0.08em", display: "block", marginBottom: 6 }}>
              ARTICLE TEXT
            </label>
            <textarea
              ref={textareaRef}
              value={articleText}
              onChange={(e) => setArticleText(e.target.value)}
              placeholder="Paste article text here…"
              rows={8}
              style={{
                width: "100%",
                background: COLORS.bg,
                border: `1px solid ${COLORS.border}`,
                borderRadius: 6,
                padding: "12px",
                color: COLORS.text,
                fontSize: 14,
                lineHeight: 1.7,
                resize: "vertical",
                outline: "none",
                boxSizing: "border-box",
                fontFamily: "inherit",
              }}
            />
          </div>

          <button
            onClick={analyze}
            disabled={loading}
            style={{
              background: loading ? COLORS.border : COLORS.amber,
              color: loading ? COLORS.muted : "#000",
              border: "none",
              borderRadius: 6,
              padding: "11px 28px",
              fontSize: 13,
              fontWeight: 600,
              letterSpacing: "0.05em",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.15s",
            }}
          >
            {loading ? "ANALYZING…" : "ANALYZE ARTICLE →"}
          </button>

          {error && (
            <div style={{ marginTop: 12, color: "#ef4444", fontSize: 13 }}>
              ⚠ {error}
            </div>
          )}
        </div>

        {/* Results */}
        {result && (
          <>
            {/* Trust gauge + tier scores */}
            <div style={{ display: "flex", gap: 16, marginBottom: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
              <div style={{ ...card, display: "flex", flexDirection: "column", alignItems: "center", minWidth: 200 }}>
                <TrustGauge score={result.trust_score} />
              </div>

              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, minWidth: 280 }}>
                <TierCard label="Stylometric" score={result.tier_scores.stylometric} icon="✦" />
                <TierCard label="Source Metadata" score={result.tier_scores.source_metadata} icon="◈" />
                <TierCard label="Knowledge Graph" score={result.tier_scores.knowledge_graph} icon="⬡" />
                <TierCard label="Model Confidence" score={result.tier_scores.model_confidence} icon="◉" />
              </div>
            </div>

            {/* Fact-check summary */}
            <div style={{
              ...card,
              borderLeft: `3px solid ${result.tier_scores.knowledge_graph === null ? COLORS.muted : COLORS.amber}`,
              background: result.tier_scores.knowledge_graph === null ? COLORS.grayGlow : COLORS.amberGlow,
            }}>
              <div style={{ 
                fontSize: 10, 
                letterSpacing: "0.2em", 
                color: result.tier_scores.knowledge_graph === null ? COLORS.muted : COLORS.amber, 
                marginBottom: 8 
              }}>
                {result.tier_scores.knowledge_graph === null ? "⚠ AI CONNECTION FAILED / FALLBACK" : "◈ AI FACT-CHECK SUMMARY"}
              </div>
              <p style={{ margin: 0, fontSize: 14, lineHeight: 1.7, color: COLORS.text }}>
                {result.fact_check_summary}
              </p>
            </div>

            {/* Entities detected */}
            {result.entities?.length > 0 && (
              <div style={{ ...card }}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: COLORS.muted, marginBottom: 12 }}>
                  ENTITIES DETECTED
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {result.entities.map((e, i) => (
                    <span key={i} style={{
                      padding: "3px 10px",
                      border: `1px solid ${COLORS.border}`,
                      borderRadius: 100,
                      fontSize: 12,
                      color: COLORS.text,
                      background: COLORS.bg,
                    }}>
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Highlighted article with explainability overlay */}
            <div style={card}>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", color: COLORS.muted, marginBottom: 16 }}>
                ARTICLE ANALYSIS
                {result.flagged_phrases?.length > 0 && (
                  <span style={{ marginLeft: 12, color: COLORS.amber }}>
                    {result.flagged_phrases.length} flag{result.flagged_phrases.length > 1 ? "s" : ""} detected
                  </span>
                )}
              </div>
              <HighlightedText text={articleText} flags={result.flagged_phrases} />
            </div>

            {/* Flag legend */}
            {result.flagged_phrases?.length > 0 && (
              <div style={card}>
                <div style={{ fontSize: 10, letterSpacing: "0.2em", color: COLORS.muted, marginBottom: 12 }}>
                  FLAG LEGEND
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {result.flagged_phrases.slice(0, 8).map((f, i) => (
                    <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <span style={{
                        fontSize: 10,
                        padding: "2px 8px",
                        borderRadius: 4,
                        background: f.severity === "danger" ? COLORS.redGlow : COLORS.amberGlow,
                        color: f.severity === "danger" ? "#ef4444" : COLORS.amberLight,
                        border: `1px solid ${f.severity === "danger" ? "#ef444440" : COLORS.amber + "40"}`,
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                        fontFamily: "'Courier New', monospace",
                        letterSpacing: "0.05em",
                      }}>
                        {f.severity.toUpperCase()}
                      </span>
                      <div>
                        <div style={{ fontSize: 12, color: COLORS.text, fontWeight: 500 }}>
                          "{f.phrase.slice(0, 60)}{f.phrase.length > 60 ? "…" : ""}"
                        </div>
                        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 2 }}>
                          {f.reason}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}