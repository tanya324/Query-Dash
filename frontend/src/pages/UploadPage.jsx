import { useState, useRef } from 'react'
import { uploadCSV } from '../services/api'
import './UploadPage.css'

export default function UploadPage({ onStartQuerying }) {
  const [file, setFile]           = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress]   = useState(0)
  const [result, setResult]       = useState(null)
  const [error, setError]         = useState(null)
  const inputRef = useRef()

  const handleFile = async (f) => {
    if (!f) return
    setFile(f); setError(null); setUploading(true); setProgress(0)
    const res = await uploadCSV(f, pct => setProgress(pct))
    setUploading(false)
    if (res.success) setResult(res)
    else setError(res.error)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  return (
    <div className="upl-page">
      <div className="u-dots" />
      <div className="u-box">
        <h1 className="u-title">Connect your data</h1>
        <p className="u-sub">Securely upload your dataset to begin autonomous analysis.</p>

        <div className="dz"
          onDragOver={e => e.preventDefault()}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input ref={inputRef} type="file" accept=".csv" style={{ display:'none' }}
            onChange={e => handleFile(e.target.files[0])} />
          <div className="dz-ic">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 15V7M12 7L9 10M12 7L15 10" stroke="#00b8d9" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M8 19h8M4 13.5A4 4 0 016.5 6h.5a5 5 0 0110 0h.5A4 4 0 0120 13.5" stroke="#00b8d9" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          {uploading ? (
            <>
              <div className="dz-lbl">Uploading...</div>
              <div className="prog-bar"><div className="prog-fill" style={{ width: `${progress}%` }} /></div>
            </>
          ) : (
            <>
              <div className="dz-lbl">Drop your CSV here or browse</div>
              <div className="dz-hint">Supports .csv up to 100MB</div>
              <button className="btn-ol" onClick={e => { e.stopPropagation(); inputRef.current?.click() }}>Select Files</button>
            </>
          )}
        </div>

        {error && <div className="u-err">⚠ {error}</div>}

        {file && !uploading && (
          <div className="f-row">
            <div className="f-ic">📄</div>
            <div style={{ flex:1 }}>
              <div className="f-nm">{file.name}</div>
              <div className="f-meta">{(file.size/1048576).toFixed(1)} MB · {result ? 'Upload complete' : 'Processing...'}</div>
            </div>
            {result && (
              <div className="verified">
                <span className="v-lbl">VERIFIED</span>
                <span className="v-d" />
              </div>
            )}
          </div>
        )}

        {result?.preview && (
          <div className="sch-sec">
            <div className="sch-hdr">
              <span className="sch-title">Schema Preview</span>
              <span className="sch-badge">{result.rows?.toLocaleString()} Rows Detected</span>
            </div>
            <div className="sch-tw">
              <table className="sch-t">
                <thead>
                  <tr>{result.columns?.map(c => (
                    <th key={c}><div className="cn">{c.toUpperCase()}</div><div className="ct">STRING</div></th>
                  ))}</tr>
                </thead>
                <tbody>
                  {result.preview?.slice(0, 4).map((row, i) => (
                    <tr key={i}>{result.columns?.map(c => (
                      <td key={c} className={typeof row[c] === 'number' ? 'nc' : ''}>{row[c]}</td>
                    ))}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {!result && <div className="or-sep">— or use the built-in 1M video analytics dataset —</div>}

        <button className="btn-start" onClick={() => onStartQuerying(result?.session_id || null)}>
          Start Querying →
        </button>

        <div className="trust">
          <span>🔒 End-to-end encrypted</span>
          <span>🗄 SOC2 Compliant Storage</span>
        </div>
      </div>
    </div>
  )
}
