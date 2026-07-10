import React, { useState } from 'react'
import { TRAIT_LABELS, LEVEL_NAMES, LEVEL_COLORS } from '../lib/api.js'
import { TraitDots } from '../student/TraitPanel.jsx'

export default function Portfolio({ state, sub, onBack }) {
  const asg = state.assignments.find((a) => a.id === sub.assignmentId)
  const stu = state.students.find((s) => s.id === sub.studentId)
  const [sel, setSel] = useState(sub.drafts[sub.drafts.length - 1].id)
  const draft = sub.drafts.find((d) => d.id === sel)

  return (
    <div>
      {onBack && <button className="backlink" onClick={onBack}>← Back to Class Overview</button>}
      <div className="eyebrow">Student Portfolio</div>
      <h1 className="page">{stu.avatar} {stu.name}</h1>
      <p className="page-sub">{asg.title} · every draft and every conference, so you can see the thinking — not just the paper.</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {sub.drafts.map((d) => (
          <button key={d.id} onClick={() => setSel(d.id)}
            style={{ padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
              border: d.id === sel ? '2px solid var(--navy-1)' : '1px solid var(--line)',
              background: d.id === sel ? '#eef4f7' : '#fff' }}>
            Draft {d.n}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        {/* draft + transcript */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <b style={{ fontSize: 14 }}>Draft {draft.n}</b>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: 15, lineHeight: 1.6, marginTop: 10, color: '#333' }}>{draft.content}</div>
          </div>
          <div className="card" style={{ padding: 18 }}>
            <b style={{ fontSize: 14 }}>Conference transcript</b>
            {draft.conference.length === 0 ? (
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>No conference on this draft.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {draft.conference.map((m, i) => (
                  <div key={i}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: m.role === 'user' ? 'var(--navy-1)' : 'var(--cc-blue)' }}>
                      {m.role === 'user' ? stu.name.toUpperCase() : 'COACH'} {m.redirect ? '· redirected a "do it for me"' : ''}
                    </div>
                    <div style={{ fontSize: 14, background: m.redirect ? '#fff6e8' : '#f6f8f9', padding: '8px 11px', borderRadius: 10, marginTop: 3 }}>{m.text}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* traits + milestones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 18 }}>
            <b style={{ fontSize: 14 }}>6 Traits — Draft {draft.n}</b>
            {!draft.traits ? <p style={{ color: 'var(--muted)', fontSize: 14 }}>No trait feedback captured.</p> : (
              <>
                <div style={{ fontSize: 13, color: 'var(--muted)', margin: '8px 0 12px' }}>{draft.traits.headline}</div>
                {draft.traits.traits.map((t) => (
                  <div key={t.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid var(--line)' }}>
                    <span style={{ fontSize: 14 }}>{TRAIT_LABELS[t.key]}</span>
                    <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: LEVEL_COLORS[t.level] }}>{LEVEL_NAMES[t.level]}</span>
                      <TraitDots level={t.level} />
                    </span>
                  </div>
                ))}
              </>
            )}
          </div>
          <div className="card" style={{ padding: 18 }}>
            <b style={{ fontSize: 14 }}>Revision milestones</b>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
              {sub.milestones.map((m) => (
                <div key={m.id} className="pill green" style={{ justifyContent: 'space-between', padding: '8px 12px' }}>
                  <span>🏅 {m.label}</span><span>+{m.coins}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
