import { useState, useEffect, useRef, useCallback } from 'react'
import { submitQuery, getStats, getSamples, checkHealth } from '../services/api'
import ChartRenderer from '../components/ChartRenderer'
import './DashboardPage.css'

const EXAMPLE_QUERIES = [
  'Show monthly views trend over time',
  'Views by content category',
  'Compare views by region',
  'Engagement rate by category',
  'Views distribution by language',
  'Audience sentiment analysis',
  'Impact of ads on views',
  'Best video duration for views',
]

function SkeletonSection() {
  return (
    <div className="sk-wrap">
      <div className="sk-mr">
        {[0,1,2].map(i => (
          <div key={i} className="sk-mc">
            <div className="sk" style={{ width:65, height:9 }} />
            <div className="sk" style={{ width:95, height:26, marginTop:6 }} />
            <div className="sk" style={{ width:'100%', height:2, marginTop:6 }} />
            <div className="sk" style={{ width:50, height:9, marginTop:5 }} />
          </div>
        ))}
      </div>
      <div className="sk-cc">
        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
          <div className="sk" style={{ width:160, height:13 }} />
          <div className="sk" style={{ width:100, height:13 }} />
        </div>
        <div className="sk" style={{ width:'100%', height:340, borderRadius:8 }} />
      </div>
      <div className="sk-cc" style={{ marginTop:14 }}>
        <div style={{ marginBottom:12 }}><div className="sk" style={{ width:140, height:11 }} /></div>
        {[0,1,2,3,4].map(i => (
          <div key={i} className="sk-tr">
            {[20,24,18,16].map((w,j) => <div key={j} className="sk" style={{ width:`${w}%`, height:10 }} />)}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function DashboardPage({ initialQuery, sessionId }) {
  const [query, setQuery]       = useState(initialQuery || '')
  const [loading, setLoading]   = useState(false)
  const [result, setResult]     = useState(null)
  const [error, setError]       = useState(null)
  const [stats, setStats]       = useState(null)
  const [samples, setSamples]   = useState(EXAMPLE_QUERIES)
  const [health, setHealth]     = useState(null)
  const [convHistory, setConvHistory] = useState([])
  const [animIn, setAnimIn]     = useState(false)
  const [activeChip, setActiveChip]   = useState(null)
  const textareaRef = useRef()

  useEffect(() => {
    Promise.all([getStats(sessionId), getSamples(), checkHealth()]).then(([s, q, h]) => {
      if (s.success) setStats(s.data)
      if (q.success && q.questions?.length) setSamples(q.questions)
      setHealth(h)
    })
    if (initialQuery) runQuery(initialQuery)
  }, [])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [query])

  const runQuery = useCallback(async (q) => {
    const text = (q ?? query).trim()
    if (!text) return

    setLoading(true); setResult(null); setError(null); setAnimIn(false)

    const newHist = [...convHistory, { role:'user', content: text }]
    const data    = await submitQuery(text, sessionId, convHistory)
    setLoading(false)

    if (data.success) {
      setResult(data)
      setConvHistory([...newHist, { role:'model', content: JSON.stringify(data) }])
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimIn(true)))
    } else if (data.answerable === false) {
      setError({ type:'unanswerable', msg: data.reason })
    } else {
      setError({ type:'server', msg: data.error })
    }
  }, [query, sessionId, convHistory])

  const handleChip = (q, index) => {
    setQuery(q)
    setActiveChip(index)
    runQuery(q)
  }

  const handleReset = () => {
    setQuery(''); setResult(null); setError(null)
    setAnimIn(false); setActiveChip(null); setConvHistory([])
  }

  return (
    <div className="dash-page">

      {/* ── TOP NAV ── */}
      <header className="d-nav">
        <div className="d-logo"><span className="lt">PROMPTBI</span><span className="ld">.</span></div>
        <div className="d-nav-mid">
          <span className="d-slash">/</span>
          <span className="d-title">{result?.dashboard_title || 'Dashboard'}</span>
        </div>
        <div className="d-nav-r">
          <div className="d-pill">
            <span className={`d-dot ${health?.success ? 'online' : 'offline'}`} />
            {health?.success ? `AI · ${health.model || 'gemini-2.0-flash'}` : 'Server offline'}
          </div>
          <span className="d-date">{new Date().toLocaleDateString('en-US',{month:'short',day:'2-digit',year:'numeric'})}</span>
          {result && <button className="exp-btn">↓ EXPORT</button>}
          <button className="nq-btn" onClick={handleReset}>+ New Query</button>
        </div>
      </header>

      {/* ════════════════════════════════
          SECTION 01 — QUERY
      ════════════════════════════════ */}
      <section className="sec-query">
        <div className="sec-label">01 &nbsp; QUERY</div>

        <div className="qbox">
          <div className="q-tag">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" stroke="#00b8d9" strokeWidth="1.5"/>
              <path d="M8 9l4 4-4 4M13 17h3" stroke="#00b8d9" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            NATURAL LANGUAGE PROCESSOR
          </div>
          <div className="q-row">
            <span className="q-pr">&gt;</span>
            <textarea
              ref={textareaRef}
              className="q-ta"
              rows={1}
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runQuery() } }}
              placeholder="Ask anything about your data... e.g. Show monthly views trend"
            />
            <button className="q-sb" disabled={loading || !query.trim()} onClick={() => runQuery()}>
              {loading
                ? <span className="mspin" />
                : <><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg> Analyze</>
              }
            </button>
          </div>
          <div className="q-cl" />
        </div>

        {/* clickable example chips */}
        <div className="q-chips">
          {samples.map((q, i) => (
            <button
              key={i}
              className={`q-chip ${activeChip === i ? 'active' : ''}`}
              onClick={() => handleChip(q, i)}
            >
              {q}
            </button>
          ))}
        </div>
      </section>

      {/* error */}
      {!loading && error && (
        <div className={`d-err ${error.type}`}>
          <span className="err-ico">{error.type === 'unanswerable' ? '⊘' : '⚠'}</span>
          <div>
            <div className="err-t">{error.type === 'unanswerable' ? 'Cannot Answer' : 'Error'}</div>
            <div className="err-m">{error.msg}</div>
          </div>
        </div>
      )}

      {/* skeleton */}
      {loading && (
        <section className="sec-charts">
          <div className="sec-label">02 &nbsp; CHARTS</div>
          <SkeletonSection />
        </section>
      )}

      {/* ════════════════════════════════
          SECTION 02 — CHARTS
      ════════════════════════════════ */}
      {!loading && result && (
        <section className="sec-charts">
          <div className="sec-label">02 &nbsp; CHARTS</div>

          {/* dashboard header */}
          <div className="dash-hdr">
            <div>
              <div className="dash-eyebrow">DASHBOARD · REAL DATA</div>
              <div className="dash-title">{result.dashboard_title || result.title}</div>
              <div className="dash-sub">
                {stats ? `${stats.total_videos?.toLocaleString()} records · ${stats.earliest}–${stats.latest}` : '1,000,000 records · 2024–2025'}
              </div>
            </div>
            <div className="dash-badges">
              <span className="badge-type">{result.chart_type?.toUpperCase() || 'CHART'}</span>
              <span className="badge-live">LIVE</span>
            </div>
          </div>

          {/* metric cards */}
          {result.metrics?.length > 0 && (
            <div className="mc-row">
              {result.metrics.map((m, i) => (
                <div key={i} className={`mc ${animIn ? 'in' : ''}`} style={{ transitionDelay: `${i * 70}ms` }}>
                  <div className="mc-lbl">{m.label}</div>
                  <div className="mc-val">{m.value}</div>
                  <div className="mc-bar"><div className="mc-bar-f" style={{ width: `${35 + i * 20}%` }} /></div>
                  <div className="mc-d">{m.pos ? '↑' : '↓'} {m.delta}</div>
                </div>
              ))}
            </div>
          )}

          {/* chart */}
          <div className={`chart-card ${animIn ? 'in' : ''}`} style={{ transitionDelay:'240ms' }}>
            <div className="chart-card-h">
              <span className="chart-card-t">{result.title}</span>
              <div className="chart-leg">
                {result.labels?.slice(0, 5).map((l, i) => (
                  <span key={i} className="lg-i">
                    <span className="lg-d" style={{ background: ['#00b8d9','#f5a623','#e63946','#22c55e','#a78bfa'][i] }} />
                    {l}
                  </span>
                ))}
              </div>
            </div>
            <ChartRenderer
              chartType={result.chart_type}
              labels={result.labels}
              data={result.datasets?.[0]?.data}
              name={result.datasets?.[0]?.name}
            />
          </div>

          {/* raw table */}
          {result.charts?.[0]?.data && (
            <div className={`raw-card ${animIn ? 'in' : ''}`} style={{ transitionDelay:'380ms' }}>
              <div className="raw-h">
                <span className="raw-lbl">Raw Source Data: <span className="raw-src">query_result</span></span>
                <span className="raw-cnt">{result.charts[0].data.length} rows</span>
              </div>
              <div className="raw-scroll">
                <table className="rt">
                  <thead>
                    <tr>
                      {Object.keys(result.charts[0].data[0] || {}).map(col => (
                        <th key={col}>{col.toUpperCase()}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.charts[0].data.slice(0, 6).map((row, i) => (
                      <tr key={i}>
                        {Object.entries(row).map(([k, v]) => (
                          <td key={k}>
                            {typeof v === 'number'
                              ? <span className="nv">{v > 999 ? v.toLocaleString() : v}</span>
                              : v}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ════════════════════════════════
          SECTION 03 — AI INSIGHTS
      ════════════════════════════════ */}
      {!loading && result?.insight && (
        <section className="sec-insights">
          <div className="sec-label">03 &nbsp; AI INSIGHTS</div>
          <div className="ins-grid">
            {/* Gemini-generated insight spans full width */}
            <div className={`ins-card primary ${animIn ? 'in' : ''}`} style={{ transitionDelay:'480ms' }}>
              <div className="ins-brow"><span className="ins-bul" />GEMINI ANALYSIS</div>
              <div className="ins-txt">{result.insight}</div>
            </div>
            {/* static contextual insights */}
            <div className={`ins-card warning ${animIn ? 'in' : ''}`} style={{ transitionDelay:'560ms' }}>
              <div className="ins-brow"><span className="ins-bul" />DATA COVERAGE</div>
              <div className="ins-txt">
                Query processed across <span className="hl-y">{stats?.total_videos?.toLocaleString() || '1,000,000'} records</span> spanning{' '}
                {stats?.earliest || '2024-01'} to {stats?.latest || '2025-12'} —{' '}
                {stats?.categories || 6} categories, {stats?.regions || 5} regions, {stats?.languages || 5} languages.
              </div>
            </div>
            <div className={`ins-card alert ${animIn ? 'in' : ''}`} style={{ transitionDelay:'640ms' }}>
              <div className="ins-brow"><span className="ins-bul" />NEXT STEPS</div>
              <div className="ins-txt">
                Try a <span className="hl-r">follow-up query</span> to drill deeper —
                filter by region, compare time periods, or segment by category for more granular insights.
              </div>
            </div>
          </div>
        </section>
      )}

      {/* empty state */}
      {!loading && !result && !error && (
        <div className="empty">
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" style={{ opacity:.12 }}>
            <circle cx="11" cy="11" r="8" stroke="#445577" strokeWidth="1.5"/>
            <path d="M21 21l-5-5" stroke="#445577" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div className="em-t">No dashboard yet</div>
          <div className="em-s">Type a question above or click one of the example chips to instantly generate a live dashboard</div>
        </div>
      )}
    </div>
  )
}
