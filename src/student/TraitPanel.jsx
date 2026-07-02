import React, { useState } from 'react'
import { api, TRAIT_LABELS, LEVEL_NAMES, LEVEL_COLORS } from '../lib/api.js'

export function TraitDots({ level }) {
  return (
    <span style={{ display: 'inline-flex', gap: 3 }}>
      {[1, 2, 3, 4].map((i) => (
        <span key={i} style={{ width: 9, height: 9, borderRadius: '50%', background: i <= level ? LEVEL_COLORS[level] : '#e3e6ea' }} />
      ))}
    </span>
  )
}

export default function TraitPanel({ draft, readOnly, onChange }) {
  const [busy, setBusy] = useState(false)
  const traits = draft.traits

  async function getFeedback() {
    setBusy(true)
    try { await api.traits(draft.id); onChange && onChange() } finally { setBusy(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 22 }}>🎯</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>6 Traits Feedback</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>What's strong, and your next step.</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        {!traits && (
          <div style={{ textAlign: 'center', color: 'var(--muted)', margin: 'auto', maxWidth: 260, paddingTop: 30 }}>
            {readOnly ? <span>No trait feedback saved on this version.</span> : (
              <>
                <p style={{ fontSize: 14 }}>Get specific, kind feedback on your writing across the 6 Traits.</p>
                <button className="btn" disabled={busy} onClick={getFeedback}>{busy ? 'Reading your draft…' : 'Get feedback ✨'}</button>
              </>
            )}
          </div>
        )}
        {traits && (
          <>
            <div style={{ background: '#eef4f7', borderRadius: 12, padding: '12px 14px', marginBottom: 14, fontSize: 14, lineHeight: 1.45 }}>
              <b>Your #1 next step:</b> {traits.headline}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {traits.traits.map((t) => (
                <div key={t.key} style={{ borderBottom: '1px solid var(--line)', paddingBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <b style={{ fontSize: 14 }}>{TRAIT_LABELS[t.key]}</b>
                    <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: LEVEL_COLORS[t.level] }}>{LEVEL_NAMES[t.level]}</span>
                      <TraitDots level={t.level} />
                    </span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--good)', marginTop: 5 }}>✓ {t.strength}</div>
                  <div style={{ fontSize: 13, color: 'var(--ink)', marginTop: 3 }}>→ {t.next_step}</div>
                </div>
              ))}
            </div>
            {!readOnly && (
              <button className="btn ghost" style={{ marginTop: 14, width: '100%', justifyContent: 'center' }} disabled={busy} onClick={getFeedback}>
                {busy ? 'Re-reading…' : 'Refresh feedback'}
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
