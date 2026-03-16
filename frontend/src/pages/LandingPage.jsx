import { useState } from 'react'
import './LandingPage.css'

const EXAMPLES = [
  { label: 'Monthly views trend',    query: 'Show monthly views trend over time' },
  { label: 'Views by category',      query: 'Views by content category' },
  { label: 'Views by region',        query: 'Compare views by region' },
  { label: 'Engagement rate',        query: 'Engagement rate by category' },
  { label: 'By language',            query: 'Views distribution by language' },
  { label: 'Sentiment analysis',     query: 'Audience sentiment analysis' },
  { label: 'Ads impact',             query: 'Impact of ads on views' },
  { label: 'Best video duration',    query: 'Best video duration for views' },
]

export default function LandingPage({ onGetAccess }) {
  const [query, setQuery] = useState('')

  const go = (q) => onGetAccess(q || query.trim() || null)

  return (
    <div className="land">
      <div className="dots" />
      <div className="scanbar" />

      <nav className="nav">
        <div className="logo"><span className="lt">PROMPTBI</span><span className="ld">.</span></div>
        <div className="nav-r">
          <span className="nav-lnk">Docs</span>
          <span className="nav-lnk">Sign In</span>
          <button className="btn-yl" onClick={() => go(null)}>Get Access →</button>
        </div>
      </nav>

      <div className="hero">
        <div className="eyebrow"><span className="ey-dot" />PROMPTBI INTELLIGENCE SYSTEMS · V2.0.4</div>
        <h1 className="h1">
          <span className="solid">Your data</span>
          <span className="solid">answers.</span>
          <span className="outline">In plain</span>
          <span className="outline">English.</span>
        </h1>
        <p className="sub">Ask a question. Get a dashboard. No SQL. No analysts. No waiting.</p>

        <div className="inp-wrap">
          <div className="inp-inner">
            <span className="inp-ico">⊞</span>
            <input
              className="inp"
              placeholder="Try: Show me monthly views trend..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && go(query.trim())}
            />
          </div>
          <button className="gen-btn" onClick={() => go(query.trim())}>Generate Dashboard →</button>
        </div>

        <div className="try-sec">
          <div className="try-lbl">— CLICK ANY EXAMPLE TO TRY IT —</div>
          <div className="try-chips">
            {EXAMPLES.map(ex => (
              <button key={ex.query} className="try-chip" onClick={() => go(ex.query)}>
                {ex.label}
              </button>
            ))}
          </div>
        </div>

        <div className="pills">
          <div className="pill"><span className="p-d" />⚡ REAL-TIME QUERIES</div>
          <div className="pill"><span className="p-d" />📊 SMART CHART SELECTION</div>
          <div className="pill"><span className="p-d" />💬 CHAT WITH YOUR DATA</div>
        </div>
      </div>

      <div className="l-foot">PROMPTBI INTELLIGENCE SYSTEMS — V2.0.4 — SECURE NODE ACTIVE</div>
    </div>
  )
}
