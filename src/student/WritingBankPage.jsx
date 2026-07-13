import React, { useState } from 'react'
import { api } from '../lib/api.js'

/*
 * Writing Bank — every self-started piece (free writes + quick writes) in one
 * place: revise, publish, share to the Writing Wall, or discard.
 */

const FILTERS = [
  ['all', 'All'],
  ['progress', 'In progress'],
  ['published', 'Published'],
]

function statusOf(sub) {
  if (sub.published) return { k: 'published', label: '🌟 Published', bg: '#fff4d6', c: '#a37400' }
  if (sub.completedAt) return { k: 'completed', label: '✓ Completed', bg: '#e6f6ee', c: 'var(--good)' }
  return { k: 'progress', label: '✏️ In progress', bg: '#e5f1fb', c: 'var(--ecr)' }
}

export default function WritingBankPage({ state, me, onBack, onOpen, onWall, onChange }) {
  const [filter, setFilter] = useState('all')
  const [confirmId, setConfirmId] = useState(null)
  const [busy, setBusy] = useState(false)

  const sharedIds = new Set((state.shareWall || []).map((e) => e.submissionId).filter(Boolean))

  const pieces = state.submissions
    .filter((s) => s.studentId === me.id)
    .map((sub) => ({ sub, a: state.assignments.find((a) => a.id === sub.assignmentId) }))
    .filter(({ a }) => a && ['free', 'quick'].includes(a.genre))
    .map(({ sub, a }) => {
      const last = sub.drafts[sub.drafts.length - 1]
      const words = (last.content || '').trim().split(/\s+/).filter(Boolean)
      return { sub, a, st: statusOf(sub), wcount: words.length, excerpt: words.slice(0, 14).join(' '), shared: sharedIds.has(sub.id) }
    })
    .sort((x, y) => (y.sub.drafts[y.sub.drafts.length - 1].createdAt > x.sub.drafts[x.sub.drafts.length - 1].createdAt ? 1 : -1))

  const visible = pieces.filter((p) =>
    filter === 'all' ? true : filter === 'published' ? p.sub.published : (!p.sub.published && !p.sub.completedAt))

  async function act(fn) { setBusy(true); try { await fn(); onChange && onChange() } finally { setBusy(false) } }

  return (
    <div>
      {onBack && <button className="backlink" onClick={onBack}>← Back to Dashboard</button>}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div>
          <div className="eyebrow">The Writing Studio</div>
          <h1 className="page" style={{ margin: '2px 0' }}>🗂️ My Writing Bank</h1>
          <p className="page-sub" style={{ margin: 0 }}>
            Every piece you've started — revise it, publish it, share it, or clear it out.
            {onWall && <> · <button onClick={onWall} style={{ color: 'var(--link)', fontWeight: 800, fontSize: 14 }}>🌟 Visit the Writing Wall →</button></>}
          </p>
        </div>
        <div style={{ display: 'inline-flex', background: '#dcebf3', borderRadius: 11, padding: 3 }}>
          {FILTERS.map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)}
              style={{ padding: '8px 16px', borderRadius: 9, fontSize: 13, fontWeight: 800,
                background: filter === k ? 'var(--teal-mid)' : 'transparent', color: filter === k ? '#fff' : 'var(--teal)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {visible.length === 0 && (
        <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--muted)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🗂️</div>
          Nothing here yet — start a Free Write or Quick Write and it will land in your bank.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {visible.map(({ sub, a, st, wcount, excerpt, shared }) => (
          <div key={sub.id} className="card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <span style={{ width: 44, height: 44, borderRadius: 12, background: a.genre === 'free' ? '#e8f5fb' : '#fdf3df', display: 'grid', placeItems: 'center', fontSize: 22, flexShrink: 0 }}>
              {a.genre === 'free' ? '🕊️' : '⚡'}
            </span>
            <div style={{ flex: 1, minWidth: 220 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <b style={{ fontSize: 15.5 }}>{a.title}</b>
                <span className="pill" style={{ background: st.bg, color: st.c, fontSize: 11 }}>{st.label}</span>
                {shared && <span className="pill" style={{ background: '#fdeef4', color: '#c23f74', fontSize: 11 }}>💛 On the Writing Wall</span>}
              </div>
              <div style={{ fontSize: 12.5, color: 'var(--muted)', marginTop: 4, maxWidth: 560, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {excerpt || 'Nothing written yet'}{excerpt ? '…' : ''}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 3, fontWeight: 600 }}>
                {wcount} words · {sub.drafts.length} draft{sub.drafts.length > 1 ? 's' : ''} · {a.type}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn ghost" style={{ padding: '7px 15px', fontSize: 13 }} disabled={busy} onClick={() => onOpen(sub.id)}>
                {sub.published ? 'Read' : sub.drafts.length > 1 ? 'Revise →' : 'Open →'}
              </button>
              {!sub.published && wcount > 0 && (
                <button className="btn" style={{ padding: '7px 15px', fontSize: 13 }} disabled={busy}
                  onClick={() => act(() => api.publish(sub.id))}>🌟 Publish</button>
              )}
              {sub.published && !shared && (
                <button className="btn" style={{ padding: '7px 15px', fontSize: 13, background: '#c2571f' }} disabled={busy}
                  onClick={() => act(() => api.share(sub.id))}>💛 Share to Wall</button>
              )}
              {confirmId === sub.id ? (
                <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center', background: '#fdeeee', border: '1px solid #f0b9be', borderRadius: 10, padding: '5px 10px' }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#d84a57' }}>Discard forever?</span>
                  <button style={{ fontSize: 12.5, fontWeight: 800, color: '#d84a57' }} disabled={busy}
                    onClick={() => act(async () => { await api.discard(sub.id); setConfirmId(null) })}>Yes</button>
                  <button style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--muted)' }} onClick={() => setConfirmId(null)}>No</button>
                </span>
              ) : (
                <button title="Discard this piece" style={{ fontSize: 16, color: 'var(--muted)', padding: 6 }} disabled={busy}
                  onClick={() => setConfirmId(sub.id)}>🗑️</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
