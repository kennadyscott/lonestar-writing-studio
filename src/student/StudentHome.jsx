import React, { useState, useMemo } from 'react'
import { api } from '../lib/api.js'
import FluencyGame from './FluencyGame.jsx'

const TODAY = new Date('2026-07-02T00:00:00')
const fmt = (d) => d ? new Date(d + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'
const daysTo = (d) => d ? Math.round((new Date(d + 'T00:00:00') - TODAY) / 86400000) : Infinity

function DueChip({ dueDate, status }) {
  if (status === 'completed') return <span className="pill green">✓ Turned in</span>
  const dt = daysTo(dueDate)
  if (dueDate == null) return <span style={{ fontSize: 13, color: 'var(--muted)' }}>No due date</span>
  const color = dt < 0 ? '#e5484d' : dt <= 2 ? '#e08a2b' : 'var(--muted)'
  const label = dt < 0 ? `Overdue` : dt === 0 ? 'Due today' : dt === 1 ? 'Due tomorrow' : `Due ${fmt(dueDate)}`
  return <span style={{ fontSize: 13, fontWeight: 600, color }}>{label}</span>
}

const STATUS_CHIP = {
  in_progress: { c: '#eaf1fb', t: 'var(--cc-blue)', label: 'In progress' },
  not_started: { c: '#eef1f4', t: '#667', label: 'Not started' },
  completed: { c: '#e6f6ee', t: 'var(--good)', label: 'Completed' },
}

const TIER_MEDAL = { Bronze: '🥉', Silver: '🥈', Gold: '🥇' }

const FORMAT_META = {
  ECR: { bg: '#375f9f', full: 'Extended Constructed Response' },
  SCR: { bg: '#0b8a8f', full: 'Short Constructed Response' },
}
function FormatBadge({ format }) {
  if (!format) return <span title="Self-started practice" style={{ fontSize: 11, fontWeight: 800, letterSpacing: .4, color: '#8a94a0', background: '#eef1f4', padding: '3px 8px', borderRadius: 6 }}>PRACTICE</span>
  const m = FORMAT_META[format]
  return <span title={m.full} style={{ fontSize: 11, fontWeight: 800, letterSpacing: .4, color: '#fff', background: m.bg, padding: '3px 8px', borderRadius: 6 }}>{format}</span>
}

function WayTile({ icon, title, sub, onClick, busy }) {
  return (
    <button onClick={onClick} disabled={busy}
      style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', background: '#fff',
        border: '1px solid var(--line)', borderRadius: 12, padding: '12px 14px', cursor: busy ? 'wait' : 'pointer' }}>
      <span style={{ fontSize: 24, width: 40, height: 40, borderRadius: 10, background: '#eef4f7', display: 'grid', placeItems: 'center', flexShrink: 0 }}>{icon}</span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontWeight: 700, fontSize: 14 }}>{title}</span>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)' }}>{sub}</span>
      </span>
    </button>
  )
}

export default function StudentHome({ state, me, onOpen }) {
  const [tab, setTab] = useState('active')
  const [sort, setSort] = useState('due')
  const [typeFilter, setTypeFilter] = useState('all')
  const [formatFilter, setFormatFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const [game, setGame] = useState(false)

  const rows = useMemo(() => {
    const subFor = (aid) => state.submissions.find((s) => s.assignmentId === aid && s.studentId === me.id)
    return state.assignments.map((a) => {
      const sub = subFor(a.id)
      const status = sub?.completedAt ? 'completed' : sub ? 'in_progress' : 'not_started'
      return { a, sub, status }
    })
  }, [state, me.id])

  const types = ['all', ...Array.from(new Set(rows.map((r) => r.a.type)))]

  const filtered = rows
    .filter((r) => (tab === 'completed' ? r.status === 'completed' : r.status !== 'completed'))
    .filter((r) => typeFilter === 'all' || r.a.type === typeFilter)
    .filter((r) => formatFilter === 'all' || r.a.format === formatFilter)
    .filter((r) => r.a.title.toLowerCase().includes(query.toLowerCase()))
    .sort((x, y) => {
      if (sort === 'due') return (daysTo(x.a.dueDate)) - (daysTo(y.a.dueDate))
      if (sort === 'title') return x.a.title.localeCompare(y.a.title)
      if (sort === 'type') return x.a.type.localeCompare(y.a.type)
      if (sort === 'teacher') return x.a.teacher.name.localeCompare(y.a.teacher.name)
      return 0
    })

  async function launch(mode) {
    setBusy(true)
    try { const r = await api.quickWrite(mode); onOpen(r.submissionId) } finally { setBusy(false) }
  }
  async function peer() {
    setBusy(true)
    try { const r = await api.peerRevision(); onOpen(r.submissionId) } finally { setBusy(false) }
  }
  async function begin(row) {
    if (row.sub) return onOpen(row.sub.id)
    setBusy(true)
    try { const r = await api.start(row.a.id); onOpen(r.submissionId) } finally { setBusy(false) }
  }

  return (
    <div>
      {game && <FluencyGame onClose={() => setGame(false)} />}
      <div className="eyebrow">The Writing Studio</div>
      <h1 className="page" style={{ marginBottom: 16 }}>Hi Kayla — what are we writing today?</h1>

      {/* Featured: Peer Revision Challenge */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 18, display: 'flex' }}>
        <div style={{ background: 'linear-gradient(135deg,#3a2f6b,#5b4aa0)', color: '#fff', padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, flex: 1 }}>
          <div style={{ fontSize: 40 }}>🤖</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: .6, opacity: .85, textTransform: 'uppercase' }}>Daily Challenge · Revision</div>
            <div style={{ fontSize: 18, fontWeight: 800 }}>A robot wrote something rough — can you fix it up?</div>
            <div style={{ fontSize: 13, opacity: .9, marginTop: 2 }}>Revise a weak response into strong writing. It's not yours, so revise boldly!</div>
          </div>
          <button className="btn gold" disabled={busy} onClick={peer} style={{ whiteSpace: 'nowrap' }}>Start revising →</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.7fr) 320px', gap: 18, alignItems: 'start' }}>
        {/* ===== assignments ===== */}
        <div className="card" style={{ overflow: 'hidden' }}>
          {/* tabs */}
          <div style={{ display: 'flex', gap: 6, padding: '12px 16px 0' }}>
            {['active', 'completed'].map((t) => (
              <button key={t} onClick={() => setTab(t)}
                style={{ padding: '9px 16px', borderRadius: '10px 10px 0 0', fontWeight: 700, fontSize: 14,
                  background: tab === t ? '#eef4f7' : 'transparent', color: tab === t ? 'var(--navy-1)' : 'var(--muted)' }}>
                {t === 'active' ? '📋 Active' : '✓ Completed'} Assignments
              </button>
            ))}
          </div>
          {/* toolbar */}
          <div style={{ display: 'flex', gap: 8, padding: '12px 16px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: '#fbfcfd', flexWrap: 'wrap' }}>
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="🔍 Search assignments…"
              style={{ flex: 1, minWidth: 140, padding: '8px 12px', borderRadius: 9, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 13 }} />
            <select value={formatFilter} onChange={(e) => setFormatFilter(e.target.value)} style={selStyle}>
              <option value="all">All formats</option>
              <option value="SCR">SCR only</option>
              <option value="ECR">ECR only</option>
            </select>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={selStyle}>
              {types.map((t) => <option key={t} value={t}>{t === 'all' ? 'All types' : t}</option>)}
            </select>
            <select value={sort} onChange={(e) => setSort(e.target.value)} style={selStyle}>
              <option value="due">Sort: Due date</option>
              <option value="title">Sort: Title</option>
              <option value="type">Sort: Type</option>
              <option value="teacher">Sort: Teacher</option>
            </select>
          </div>
          {/* rows */}
          <div>
            {filtered.length === 0 && <div style={{ padding: 28, textAlign: 'center', color: 'var(--muted)' }}>Nothing here — try the other tab or clear filters.</div>}
            {filtered.map((row) => {
              const s = STATUS_CHIP[row.status]
              return (
                <div key={row.a.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', borderBottom: '1px solid var(--line)' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{row.a.title}</div>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 5, flexWrap: 'wrap' }}>
                      <FormatBadge format={row.a.format} />
                      <span className="pill" style={{ background: s.c, color: s.t }}>{row.a.type}</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: '#eef1f4', display: 'grid', placeItems: 'center', fontSize: 10, fontWeight: 700 }}>{row.a.teacher.initials}</span>
                        {row.a.teacher.name}
                      </span>
                    </div>
                  </div>
                  <div style={{ width: 110, textAlign: 'right' }}><DueChip dueDate={row.a.dueDate} status={row.status} /></div>
                  <div style={{ width: 96, textAlign: 'right' }}>
                    <button className={row.status === 'not_started' ? 'btn' : 'btn ghost'} style={{ padding: '7px 14px' }} disabled={busy} onClick={() => begin(row)}>
                      {row.status === 'completed' ? 'Review' : row.status === 'in_progress' ? 'Continue' : 'Begin ▶'}
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ===== right column ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 18 }}>🖊️</span><b style={{ fontSize: 15 }}>Ways to Write</b>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <WayTile icon="⚡" title="Quick Write" sub="A fresh prompt to warm up" busy={busy} onClick={() => launch('quick')} />
              <WayTile icon="🕊️" title="Free Write" sub="Write anything, no rules" busy={busy} onClick={() => launch('free')} />
              <WayTile icon="🎯" title="Fluency Game" sub="Stretch sentences, fast" onClick={() => setGame(true)} />
            </div>
          </div>

          {/* Luna compact */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', background: 'linear-gradient(120deg,#0b1f3a,#123a63)', color: '#fff' }}>
              <span style={{ fontSize: 20 }}>🌟</span>
              <b style={{ fontSize: 14 }}>Luna's Writing Nook</b>
              <span style={{ marginLeft: 'auto', fontSize: 11, opacity: .8 }}>Your writing path</span>
            </div>
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {state.modules.map((m, i) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 18, opacity: m.status === 'not_started' ? .4 : 1 }}>{TIER_MEDAL[m.tier]}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      Module {i + 1}: {m.label}
                    </div>
                    <div style={{ height: 6, background: '#eef0f2', borderRadius: 4, marginTop: 3 }}>
                      <div style={{ height: '100%', width: `${m.progress * 100}%`, background: 'var(--cyan)', borderRadius: 4 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 700, color: m.status === 'in_progress' ? 'var(--cc-blue)' : 'var(--muted)' }}>
                    {m.status === 'in_progress' ? 'IN PROGRESS' : m.status === 'completed' ? 'DONE' : 'LOCKED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

const selStyle = { padding: '8px 10px', borderRadius: 9, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 13, background: '#fff' }
