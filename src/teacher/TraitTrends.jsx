import React from 'react'
import { TRAIT_LABELS, LEVEL_COLORS } from '../lib/api.js'

export default function TraitTrends({ state }) {
  // average latest-draft trait levels across all submissions that have feedback
  const rows = {}
  Object.keys(TRAIT_LABELS).forEach((k) => (rows[k] = []))
  state.submissions.forEach((s) => {
    const latest = [...s.drafts].reverse().find((d) => d.traits)
    if (latest) latest.traits.traits.forEach((t) => rows[t.key].push(t.level))
  })
  const data = Object.keys(TRAIT_LABELS).map((k) => ({
    key: k, label: TRAIT_LABELS[k],
    avg: rows[k].length ? rows[k].reduce((a, b) => a + b, 0) / rows[k].length : 0,
    n: rows[k].length,
  }))
  const weakest = [...data].filter(d => d.n).sort((a, b) => a.avg - b.avg)[0]

  return (
    <div>
      <div className="eyebrow">The Writing Studio · Teacher</div>
      <h1 className="page">Class Trait Trends</h1>
      <p className="page-sub">Where the class stands on each of the 6 Traits — so you know what to teach next.</p>

      {weakest && (
        <div className="card" style={{ padding: '14px 18px', marginBottom: 18, background: 'linear-gradient(120deg,#fff6e8,#fff)' }}>
          💡 <b>Suggested mini-lesson:</b> the class is lowest on <b>{weakest.label}</b> ({weakest.avg.toFixed(1)}/4). A whole-group lesson here would lift the most writers.
        </div>
      )}

      <div className="card" style={{ padding: 22 }}>
        {data.map((d) => (
          <div key={d.key} style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, marginBottom: 5 }}>
              <b>{d.label}</b>
              <span style={{ color: 'var(--muted)' }}>{d.n ? `${d.avg.toFixed(1)} / 4 · ${d.n} writer${d.n > 1 ? 's' : ''}` : 'no data yet'}</span>
            </div>
            <div style={{ height: 14, background: '#eef0f2', borderRadius: 7 }}>
              <div style={{ height: '100%', width: `${(d.avg / 4) * 100}%`, background: LEVEL_COLORS[Math.round(d.avg)] || '#cfd6db', borderRadius: 7 }} />
            </div>
          </div>
        ))}
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 4 }}>
          As more students draft and confer, these trends fill in — the backbone for data-driven whole-class instruction and year-long portfolios.
        </p>
      </div>
    </div>
  )
}
