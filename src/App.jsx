import { useState, useRef, useEffect } from "react";

// ── Palette & fonts ────────────────────────────────────────────────────────────
const C = {
  navy:   "#0f1f45",
  navyL:  "#1a3366",
  gold:   "#c9a84c",
  goldL:  "#e8c96e",
  cream:  "#faf8f3",
  paper:  "#f2ede3",
  ink:    "#1c1c1c",
  muted:  "#7a7468",
  border: "#e2dbd0",
  white:  "#ffffff",
  green:  "#166534",
  greenL: "#dcfce7",
  red:    "#991b1b",
  redL:   "#fee2e2",
};


// ── Topic Cards ────────────────────────────────────────────────────────────────
const TOPICS = [
  { id: "aows-access",    icon: "🔐", label: "Agent Portal Login",        color: "#1a3366", q: "How do I access the Agent Portal? I can't log in." },
  { id: "aows-use",       icon: "🖥️", label: "Using the Agent Portal",    color: "#1a3366", q: "Walk me through how to use the Agent Portal — what's inside and how do I navigate it?" },
  { id: "commissions",    icon: "💰", label: "Commissions",         color: "#065f46", q: "I'm unclear on the commission process. How does it work, and how do I submit and track my commissions?" },
  { id: "promos",         icon: "🎁", label: "Redeem Promotions",   color: "#92400e", q: "How do I find and redeem promotions through my membership?" },
  { id: "id-cards",       icon: "🪪", label: "ID Cards",            color: "#5b21b6", q: "I don't understand how to get my ID card. What's the difference between the physical and digital ID, and how does the app link work?" },
  { id: "cancel",         icon: "🚫", label: "Cancellation & Refunds", color: "#991b1b", q: "I want to understand the cancellation and refund policy for my membership." },
  { id: "use-membership", icon: "✈️", label: "Using Your Membership", color: "#0369a1", q: "How do I use my GlobalTravel.com ITA membership, and what's the best way to get clients?" },
];

const QUICK_CHIPS = [
  "How do I reset my Agent Portal password?",
  "When do I get paid my commission?",
  "My ID card link expired — what do I do?",
  "What documents do I need to submit an offline commission?",
  "How do I get my first client?",
  "Can I cancel my membership and get a refund?",
  "My promo code isn't working",
  "What's the difference between online and offline commission rates?",
];

// ── Message renderer ───────────────────────────────────────────────────────────
function renderMsg(text) {
  const lines = text.split("\n");
  const elements = [];
  let i = 0;

  const parsInline = (str) => {
    return str
      // Bold
      .replace(/\*\*(.*?)\*\*/g, (_, m) => `<strong style="color:#0f1f45">${m}</strong>`)
      // Italic
      .replace(/\*(.*?)\*/g, (_, m) => `<em>${m}</em>`)
      // Markdown links [text](url)
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, (_, text, url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#1a3366;font-weight:600;text-decoration:underline;text-underline-offset:2px;">${text}</a>`)
      // Bare URLs (not already inside an href)
      .replace(/(?<!href=")(https?:\/\/[^\s<"]+)/g, (url) =>
        `<a href="${url}" target="_blank" rel="noopener noreferrer" style="color:#1a3366;font-weight:600;text-decoration:underline;text-underline-offset:2px;">${url}</a>`);
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // Empty line
    if (!trimmed) { elements.push(<div key={i} style={{ height: 8 }} />); i++; continue; }

    // ## Header
    if (trimmed.startsWith("## ")) {
      const txt = trimmed.slice(3);
      elements.push(
        <div key={i} style={{
          fontFamily: "Georgia, serif",
          fontWeight: 700,
          fontSize: 13,
          color: "#c9a84c",
          textTransform: "uppercase",
          letterSpacing: 1.2,
          marginTop: 14,
          marginBottom: 4,
          paddingBottom: 4,
          borderBottom: "1px solid #e2dbd0",
        }}>{txt}</div>
      );
      i++; continue;
    }

    // # Header (h1)
    if (trimmed.startsWith("# ")) {
      const txt = trimmed.slice(2);
      elements.push(
        <div key={i} style={{
          fontFamily: "Georgia, serif",
          fontWeight: 700,
          fontSize: 15,
          color: "#0f1f45",
          marginTop: 10,
          marginBottom: 6,
        }}>{txt}</div>
      );
      i++; continue;
    }

    // 💡 Pro Tip line
    if (trimmed.startsWith("💡")) {
      elements.push(
        <div key={i} style={{
          background: "linear-gradient(135deg, #fefce8, #fef9c3)",
          border: "1px solid #fde68a",
          borderRadius: 10,
          padding: "10px 14px",
          marginTop: 12,
          fontSize: 13,
          color: "#78350f",
          fontFamily: "sans-serif",
          lineHeight: 1.6,
        }} dangerouslySetInnerHTML={{ __html: parsInline(trimmed) }} />
      );
      i++; continue;
    }

    // Numbered list
    if (/^\d+\.\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        const txt = lines[i].trim().replace(/^\d+\.\s/, "");
        items.push(<li key={i} style={{ marginBottom: 5, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: parsInline(txt) }} />);
        i++;
      }
      elements.push(
        <ol key={"ol-"+i} style={{
          margin: "8px 0 8px 4px",
          paddingLeft: 20,
          fontFamily: "sans-serif",
          fontSize: 13.5,
          color: "#1c1c1c",
        }}>{items}</ol>
      );
      continue;
    }

    // Bullet list (- or •)
    if (/^[-•]\s/.test(trimmed)) {
      const items = [];
      while (i < lines.length && /^[-•]\s/.test(lines[i].trim())) {
        const txt = lines[i].trim().replace(/^[-•]\s/, "");
        items.push(
          <li key={i} style={{ marginBottom: 4, lineHeight: 1.6, paddingLeft: 2 }}
            dangerouslySetInnerHTML={{ __html: parsInline(txt) }} />
        );
        i++;
      }
      const bulletTexts = [];
      // re-collect raw text for bullets
      const startI = i - items.length;
      for (let j = startI; j < i; j++) {
        bulletTexts.push(lines[j].trim().replace(/^[-•]\s/, ""));
      }
      elements.push(
        <ul key={"ul-"+i} style={{
          margin: "6px 0 8px 0",
          padding: 0,
          listStyleType: "none",
          fontFamily: "sans-serif",
          fontSize: 13.5,
          color: "#1c1c1c",
        }}>
          {bulletTexts.map((bt, idx) => (
            <li key={idx} style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 5, lineHeight: 1.6 }}>
              <span style={{ color: "#c9a84c", fontWeight: 900, fontSize: 16, marginTop: 0, flexShrink: 0, lineHeight: 1.4 }}>›</span>
              <span dangerouslySetInnerHTML={{ __html: parsInline(bt) }} />
            </li>
          ))}
        </ul>
      );
      continue;
    }

    // Phone number highlight
    if (/1-800-/.test(trimmed)) {
      elements.push(
        <div key={i} style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 8,
          padding: "6px 12px",
          margin: "6px 0",
          fontSize: 13,
          fontFamily: "sans-serif",
          color: "#166534",
          fontWeight: 600,
        }} dangerouslySetInnerHTML={{ __html: "📞 " + parsInline(trimmed) }} />
      );
      i++; continue;
    }

    // Regular paragraph
    elements.push(
      <p key={i} style={{
        margin: "4px 0",
        lineHeight: 1.7,
        fontSize: 13.5,
        fontFamily: "sans-serif",
        color: "#1c1c1c",
      }} dangerouslySetInnerHTML={{ __html: parsInline(trimmed) }} />
    );
    i++;
  }

  return elements;
}

// ── Main App ───────────────────────────────────────────────────────────────────
export default function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [started, setStarted] = useState(false);
  const [activeTopic, setActiveTopic] = useState(null);
  const bottomRef = useRef(null);
  const inputRef  = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput("");
    setStarted(true);
    const next = [...messages, { role: "user", text: msg }];
    setMessages(next);
    setLoading(true);

    try {
      const apiMsgs = next.map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: m.text }));
      const res = await fetch("/.netlify/functions/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMsgs }),
      });
      const data = await res.json();
      const reply = data.reply || "I'm having trouble right now. Please try again or contact support at 1-800-699-1725.";
      setMessages(prev => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", text: "Connection error. Please try again in a moment." }]);
    }
    setLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const pickTopic = (topic) => {
    setActiveTopic(topic.id);
    sendMessage(topic.q);
  };

  const reset = () => {
    setMessages([]);
    setStarted(false);
    setActiveTopic(null);
    setInput("");
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: C.cream,
      fontFamily: "'Palatino Linotype', 'Book Antiqua', Palatino, Georgia, serif",
      display: "flex",
      flexDirection: "column",
    }}>
      {/* ── Header ── */}
      <header style={{
        background: C.navy,
        borderBottom: `3px solid ${C.gold}`,
        padding: "0 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 58,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            background: C.gold, color: C.navy, fontWeight: 900, fontSize: 13,
            padding: "4px 10px", borderRadius: 5, fontFamily: "sans-serif", letterSpacing: 1,
          }}>GT</div>
          <div>
            <span style={{ color: C.white, fontWeight: 700, fontSize: 16, letterSpacing: 0.3 }}>GlobalTravel.com</span>
            <span style={{ color: C.gold, fontSize: 12, marginLeft: 10, fontFamily: "sans-serif", opacity: 0.9 }}>ITA Support Center</span>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          {started && (
            <button onClick={reset} style={{
              background: "transparent", border: `1px solid rgba(255,255,255,0.3)`,
              borderRadius: 6, padding: "5px 14px", color: "rgba(255,255,255,0.7)",
              fontFamily: "sans-serif", fontSize: 12, cursor: "pointer",
            }}>← Back to Topics</button>
          )}
          <div style={{ fontFamily: "sans-serif", fontSize: 11, color: "rgba(255,255,255,0.4)", letterSpacing: 0.5 }}>
            Powered by Claude AI
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* ══ LANDING VIEW ══ */}
        {!started && (
          <div style={{ flex: 1, overflowY: "auto", padding: "40px 32px 24px" }}>
            {/* Hero */}
            <div style={{ textAlign: "center", marginBottom: 44 }}>
              <div style={{
                display: "inline-block", background: C.gold, borderRadius: "50%",
                width: 64, height: 64, lineHeight: "64px", fontSize: 30, marginBottom: 18,
              }}>✦</div>
              <h1 style={{ fontSize: 30, fontWeight: 700, color: C.navy, margin: "0 0 10px", letterSpacing: 0.3 }}>
                How can we help you today?
              </h1>
              <p style={{ color: C.muted, fontSize: 15, fontFamily: "sans-serif", maxWidth: 520, margin: "0 auto" }}>
                Instant answers to the most common ITA questions — or just ask anything below.
              </p>
            </div>

            {/* Topic Grid */}
            <div style={{ maxWidth: 820, margin: "0 auto 40px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
              {TOPICS.map(t => (
                <button key={t.id} onClick={() => pickTopic(t)}
                  style={{
                    background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: 14, padding: "22px 20px", textAlign: "left",
                    cursor: "pointer", transition: "all 0.18s",
                    borderLeft: `4px solid ${t.color}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.10)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.04)"; e.currentTarget.style.transform = "none"; }}
                >
                  <div style={{ fontSize: 26, marginBottom: 10 }}>{t.icon}</div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 4 }}>{t.label}</div>
                  <div style={{ fontFamily: "sans-serif", fontSize: 11, color: C.muted, lineHeight: 1.5 }}>
                    Tap for instant guidance →
                  </div>
                </button>
              ))}
            </div>

            {/* Divider */}
            <div style={{ maxWidth: 820, margin: "0 auto 28px", display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ flex: 1, height: 1, background: C.border }} />
              <span style={{ fontFamily: "sans-serif", fontSize: 12, color: C.muted }}>or ask a specific question</span>
              <div style={{ flex: 1, height: 1, background: C.border }} />
            </div>

            {/* Quick Chips */}
            <div style={{ maxWidth: 820, margin: "0 auto 32px", display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center" }}>
              {QUICK_CHIPS.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  style={{
                    background: C.white, border: `1px solid ${C.border}`, borderRadius: 20,
                    padding: "7px 16px", fontFamily: "sans-serif", fontSize: 12, color: "#444",
                    cursor: "pointer", transition: "all 0.15s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = C.gold; e.currentTarget.style.color = C.navy; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = "#444"; }}
                >{q}</button>
              ))}
            </div>

            {/* Input */}
            <div style={{ maxWidth: 640, margin: "0 auto" }}>
              <div style={{
                display: "flex", gap: 10, background: C.white,
                border: `2px solid ${C.border}`, borderRadius: 30,
                padding: "6px 8px 6px 20px",
                boxShadow: "0 4px 20px rgba(0,0,0,0.07)",
              }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                  placeholder="Type any question about your ITA membership..."
                  style={{
                    flex: 1, border: "none", outline: "none", fontSize: 14,
                    fontFamily: "sans-serif", color: C.ink, background: "transparent",
                  }}
                />
                <button onClick={() => sendMessage()} disabled={!input.trim()}
                  style={{
                    background: input.trim() ? C.navy : C.border,
                    color: C.white, border: "none", borderRadius: 24,
                    padding: "10px 22px", fontFamily: "sans-serif",
                    fontSize: 13, fontWeight: 700, cursor: input.trim() ? "pointer" : "default",
                    transition: "background 0.2s",
                  }}>Ask →</button>
              </div>
            </div>
          </div>
        )}

        {/* ══ CHAT VIEW ══ */}
        {started && (
          <>
            {/* Topic pill */}
            {activeTopic && (
              <div style={{ padding: "12px 28px", background: C.paper, borderBottom: `1px solid ${C.border}`, display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <span style={{ fontFamily: "sans-serif", fontSize: 11, color: C.muted }}>You're asking about:</span>
                <span style={{
                  background: C.navy, color: C.white, borderRadius: 20,
                  padding: "3px 12px", fontFamily: "sans-serif", fontSize: 11, fontWeight: 700,
                }}>{TOPICS.find(t => t.id === activeTopic)?.icon} {TOPICS.find(t => t.id === activeTopic)?.label}</span>
                <span style={{ fontFamily: "sans-serif", fontSize: 11, color: C.muted }}>· Ask a follow-up below or</span>
                <button onClick={reset} style={{ fontFamily: "sans-serif", fontSize: 11, color: C.gold, background: "none", border: "none", cursor: "pointer", textDecoration: "underline", padding: 0 }}>
                  browse all topics
                </button>
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "28px 28px 12px", display: "flex", flexDirection: "column", gap: 20 }}>
              {messages.map((m, i) => (
                <div key={i} style={{ display: "flex", gap: 12, justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-start" }}>
                  {m.role === "assistant" && (
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%", background: C.navy,
                      color: C.gold, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 15, flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    }}>✦</div>
                  )}
                  <div style={{
                    maxWidth: "78%",
                    background: m.role === "user" ? C.navy : C.white,
                    color: m.role === "user" ? C.white : C.ink,
                    borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                    padding: "13px 18px",
                    border: m.role === "assistant" ? `1px solid ${C.border}` : "none",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.06)",
                    fontFamily: "sans-serif",
                  }}>
                    {m.role === "assistant" ? renderMsg(m.text) : <p style={{ margin: 0, fontSize: 13.5 }}>{m.text}</p>}
                  </div>
                  {m.role === "user" && (
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%", background: C.gold,
                      color: C.navy, display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 700, flexShrink: 0, fontFamily: "sans-serif",
                    }}>ITA</div>
                  )}
                </div>
              ))}

              {loading && (
                <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <div style={{
                    width: 34, height: 34, borderRadius: "50%", background: C.navy,
                    color: C.gold, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15,
                  }}>✦</div>
                  <div style={{
                    background: C.white, border: `1px solid ${C.border}`,
                    borderRadius: "4px 18px 18px 18px", padding: "14px 18px",
                    display: "flex", gap: 6, alignItems: "center",
                  }}>
                    {[0,1,2].map(d => (
                      <span key={d} style={{
                        width: 8, height: 8, borderRadius: "50%", background: C.gold,
                        display: "inline-block",
                        animation: `bounce 1.2s ease-in-out ${d * 0.18}s infinite`,
                      }} />
                    ))}
                  </div>
                </div>
              )}

              {/* Follow-up topic chips after first answer */}
              {messages.length >= 2 && !loading && (
                <div style={{ paddingLeft: 46 }}>
                  <div style={{ fontFamily: "sans-serif", fontSize: 11, color: C.muted, marginBottom: 8 }}>Related topics:</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {TOPICS.filter(t => t.id !== activeTopic).slice(0, 4).map(t => (
                      <button key={t.id} onClick={() => pickTopic(t)}
                        style={{
                          background: C.white, border: `1px solid ${C.border}`,
                          borderRadius: 20, padding: "5px 14px", fontFamily: "sans-serif",
                          fontSize: 11, color: "#555", cursor: "pointer",
                          display: "flex", alignItems: "center", gap: 5,
                        }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = C.gold}
                        onMouseLeave={e => e.currentTarget.style.borderColor = C.border}
                      >{t.icon} {t.label}</button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input Bar */}
            <div style={{
              padding: "14px 24px 18px",
              borderTop: `1px solid ${C.border}`,
              background: C.white,
            }}>
              <div style={{
                display: "flex", gap: 10, background: C.cream,
                border: `1.5px solid ${C.border}`, borderRadius: 28,
                padding: "6px 8px 6px 20px",
              }}>
                <input
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
                  placeholder="Ask a follow-up question..."
                  style={{
                    flex: 1, border: "none", outline: "none", fontSize: 13.5,
                    fontFamily: "sans-serif", color: C.ink, background: "transparent",
                  }}
                />
                <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
                  style={{
                    background: !input.trim() || loading ? C.border : C.navy,
                    color: C.white, border: "none", borderRadius: 22,
                    padding: "10px 22px", fontFamily: "sans-serif",
                    fontSize: 13, fontWeight: 700,
                    cursor: !input.trim() || loading ? "default" : "pointer",
                    transition: "background 0.2s",
                  }}>Send →</button>
              </div>
              <div style={{ textAlign: "center", fontFamily: "sans-serif", fontSize: 11, color: C.muted, marginTop: 8 }}>
                Need human support? Call <strong>1-800-GTRAVELCO</strong> or email memberservices@globaltravel.com
              </div>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-5px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
