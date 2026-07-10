import React, { useState, useMemo } from 'react'
import { api } from '../lib/api.js'
import { BRAND } from '../lib/brand.js'
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
  return <span style={{ fontSize: 13, fontWeight: 700, color }}>{label}</span>
}

const STATUS_CHIP = {
  in_progress: { c: '#e5f1fb', t: 'var(--ecr)' },
  not_started: { c: '#eef3f6', t: '#5c7285' },
  completed: { c: '#e6f6ee', t: 'var(--good)' },
}

function FormatBadge({ format }) {
  if (!format) return <span title="Self-started practice" style={{ fontSize: 11, fontWeight: 800, letterSpacing: .4, color: '#8a94a0', background: '#eef3f6', padding: '3px 9px', borderRadius: 7 }}>PRACTICE</span>
  const meta = format === 'ECR'
    ? { bg: 'var(--ecr)', full: 'Extended Constructed Response' }
    : { bg: 'var(--scr)', full: 'Short Constructed Response' }
  return <span title={meta.full} style={{ fontSize: 11, fontWeight: 800, letterSpacing: .4, color: '#fff', background: meta.bg, padding: '3px 9px', borderRadius: 7 }}>{format}</span>
}

function WayTile({ icon, title, sub, onClick, busy }) {
  return (
    <button onClick={onClick} disabled={busy}
      style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 6, background: '#fff',
        border: '1px solid var(--line)', borderRadius: 14, padding: '16px 10px', cursor: busy ? 'wait' : 'pointer' }}>
      <span style={{ fontSize: 26 }}>{icon}</span>
      <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--ink)' }}>{title}</span>
      <span style={{ fontSize: 11.5, color: 'var(--muted)', lineHeight: 1.35 }}>{sub}</span>
    </button>
  )
}

const MEDAL = ['#c0392b', '#8e6bbf', '#f5b400'] // module medals like the mockup

function LunaNook({ modules, onGrowth }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'linear-gradient(120deg,#0d2f55,#02384d)', color: '#fff' }}>
        <img src={BRAND.luna} alt="Luna" style={{ height: 40 }} />
        <b style={{ fontSize: 15 }}>Luna's Writing Nook</b>
        <button onClick={onGrowth} style={{ marginLeft: 'auto', color: '#cfeefb', fontSize: 12, fontWeight: 700 }}>Your writing path →</button>
      </div>
      <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {modules.map((m, i) => {
          const locked = m.status === 'not_started'
          return (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, opacity: locked ? .75 : 1 }}>
              <span style={{ width: 30, height: 30, borderRadius: '50%', background: MEDAL[i], color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 800, fontSize: 13, boxShadow: 'inset 0 -2px 0 rgba(0,0,0,.25)' }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 800, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ color: 'var(--muted)', fontWeight: 700, whiteSpace: 'nowrap' }}>Module {i + 1}:</span>
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{m.label}</span>
                  {locked && <span style={{ fontSize: 12 }}>🔒</span>}
                </div>
                <div style={{ height: 7, background: '#e6eef3', borderRadius: 5, marginTop: 5 }}>
                  <div style={{ height: '100%', width: `${m.progress * 100}%`, background: 'linear-gradient(90deg,var(--cyan-bright),var(--cyan))', borderRadius: 5 }} />
                </div>
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: .5, color: locked ? 'var(--muted)' : 'var(--link)' }}>
                {m.status === 'in_progress' ? 'IN PROGRESS' : m.status === 'completed' ? 'DONE' : 'LOCKED'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Average-score-over-time line (single series, direct-labeled per point).
function ScoreLine({ points }) {
  const W = 320, H = 128, PX = 26, PT = 26, PB = 24
  const lo = Math.min(...points.map((p) => p.pct)) - 6
  const hi = Math.max(...points.map((p) => p.pct)) + 6
  const x = (i) => PX + (i * (W - 2 * PX)) / (points.length - 1)
  const y = (v) => PT + (1 - (v - lo) / (hi - lo)) * (H - PT - PB)
  const line = points.map((p, i) => `${x(i)},${y(p.pct)}`).join(' ')
  const area = `${x(0)},${H - PB} ${line} ${x(points.length - 1)},${H - PB}`
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: 360, display: 'block' }} role="img" aria-label="Average writing score over time">
      <defs>
        <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06aade" stopOpacity=".22" />
          <stop offset="100%" stopColor="#06aade" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#scoreFill)" />
      <polyline points={line} fill="none" stroke="#06aade" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <g key={p.label}>
          <circle cx={x(i)} cy={y(p.pct)} r="4" fill="#fff" stroke="#06aade" strokeWidth="2.5">
            <title>{`${p.label}: ${p.pct}%`}</title>
          </circle>
          <text x={x(i)} y={y(p.pct) - 9} textAnchor="middle" fontSize="11" fontWeight="700" fill="#14344a">{p.pct}%</text>
          <text x={x(i)} y={H - 8} textAnchor="middle" fontSize="9.5" fill="#5c7285">{p.label}</text>
        </g>
      ))}
    </svg>
  )
}

function GrowthSummaryCard({ gs, onGrowth }) {
  const away = Math.max(0, gs.goalPercent - gs.currentAverage)
  return (
    <div className="card" style={{ padding: '20px 22px', display: 'grid', gridTemplateColumns: '0.9fr 1.2fr 0.9fr', gap: 24, alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 19, fontWeight: 800 }}>My Growth 🌱</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: '6px 0 12px' }}>Set a goal, watch your averages climb, and celebrate how far you've come.</p>
        <button className="btn" style={{ padding: '8px 18px' }} onClick={onGrowth}>Set Goal</button>
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800, marginBottom: 2 }}>Average Score Over Time</div>
        <ScoreLine points={gs.scoreOverTime} />
      </div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 800 }}>Goal Progress</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', margin: '8px 0 6px' }}>
          <span style={{ fontSize: 13, color: 'var(--muted)' }}>Goal: {gs.goalPercent}%</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: 'var(--teal)' }}>{gs.currentAverage}%</span>
        </div>
        <div style={{ height: 12, background: '#e6eef3', borderRadius: 7 }}>
          <div style={{ height: '100%', width: `${(gs.currentAverage / gs.goalPercent) * 100}%`, background: 'linear-gradient(90deg,var(--cyan-bright),var(--teal))', borderRadius: 7 }} />
        </div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 8 }}>
          You're <b style={{ color: 'var(--cyan-bright)' }}>{away}%</b> away from your goal!
        </div>
      </div>
    </div>
  )
}

function GrowthStatsRail({ gs, onGrowth }) {
  const tiles = [
    { k: 'Current Average', v: `${gs.currentAverage}%`, sub: `↑ ${gs.weeklyDelta}% from last week`, subColor: 'var(--good)', vExtra: ' ↗' },
    { k: 'Writing Streak', v: `${gs.streakDays} days 🔥`, sub: 'Keep it up!', subColor: 'var(--muted)' },
    { k: 'Badges Earned', v: `${gs.badges} 🏅`, sub: 'See all badges', subColor: 'var(--muted)' },
  ]
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <b style={{ fontSize: 15 }}>My Growth 🌱</b>
        <button onClick={onGrowth} style={{ color: 'var(--link)', fontSize: 12.5, fontWeight: 800 }}>View full report →</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {tiles.map((t) => (
          <div key={t.k} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '12px 10px' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', marginBottom: 4 }}>{t.k}</div>
            <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--teal)' }}>{t.v}{t.vExtra && <span style={{ color: 'var(--good)', fontSize: 14 }}>{t.vExtra}</span>}</div>
            <div style={{ fontSize: 10.5, color: t.subColor, marginTop: 3, fontWeight: 600 }}>{t.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function StudentHome({ state, me, onOpen, onGrowth }) {
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

  const gs = state.growthSummary

  return (
    <div>
      {game && <FluencyGame onClose={() => setGame(false)} />}

      <h1 className="page" style={{ marginBottom: 16, fontSize: 26 }}>Hi Kayla — ready to write today? 👋</h1>

      {/* Daily Challenge banner */}
      <div className="hero-banner" style={{ marginBottom: 18 }}>
        <span className="spark" style={{ left: '38%', top: 12 }}>✦</span>
        <span className="spark" style={{ left: '55%', bottom: 14, fontSize: 9 }}>✦</span>
        <span className="spark" style={{ left: '70%', top: 20, fontSize: 10 }}>✦</span>
        <span className="art">📓💻☕</span>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', display: 'grid', placeItems: 'center', fontSize: 30, flexShrink: 0 }}>🤖</div>
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .8, opacity: .85, textTransform: 'uppercase' }}>Daily Challenge · Revision</div>
          <div style={{ fontSize: 19, fontWeight: 800 }}>A robot wrote something rough — can you fix it up?</div>
          <div style={{ fontSize: 13, opacity: .9, marginTop: 2 }}>Revise a weak response into strong writing. It's not yours, so revise boldly!</div>
        </div>
        <button className="btn white" disabled={busy} onClick={peer} style={{ whiteSpace: 'nowrap', position: 'relative' }}>Start Revising →</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.65fr) 400px', gap: 18, alignItems: 'start' }}>
        {/* ===== left column ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            {/* tabs */}
            <div style={{ display: 'flex', gap: 8, padding: '14px 16px 12px' }}>
              {['active', 'completed'].map((t) => (
                <button key={t} onClick={() => setTab(t)}
                  style={{ padding: '9px 18px', borderRadius: 999, fontWeight: 800, fontSize: 13.5,
                    background: tab === t ? 'var(--teal-mid)' : '#eef3f6', color: tab === t ? '#fff' : 'var(--muted)' }}>
                  {t === 'active' ? '📋 Active Assignments' : '📗 Completed Assignments'}
                </button>
              ))}
            </div>
            {/* toolbar */}
            <div style={{ display: 'flex', gap: 8, padding: '10px 16px', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)', background: '#f8fbfd', flexWrap: 'wrap' }}>
              <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="🔍 Search assignments…"
                style={{ flex: 1, minWidth: 140, padding: '8px 12px', borderRadius: 10, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 13 }} />
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
                      <div style={{ fontWeight: 800, fontSize: 15 }}>{row.a.title}</div>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 6, flexWrap: 'wrap' }}>
                        <FormatBadge format={row.a.format} />
                        <span className="pill" style={{ background: s.c, color: s.t }}>{row.a.type}</span>
                        <span style={{ fontSize: 12, color: 'var(--muted)', display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
                          <span style={{ width: 21, height: 21, borderRadius: '50%', background: '#e2eef5', color: 'var(--teal)', display: 'grid', placeItems: 'center', fontSize: 9.5, fontWeight: 800 }}>{row.a.teacher.initials}</span>
                          {row.a.teacher.name}
                        </span>
                      </div>
                    </div>
                    <div style={{ width: 112, textAlign: 'right' }}><DueChip dueDate={row.a.dueDate} status={row.status} /></div>
                    <div style={{ width: 104, textAlign: 'right' }}>
                      <button className={row.status === 'not_started' ? 'btn' : 'btn ghost'} style={{ padding: '8px 16px' }} disabled={busy} onClick={() => begin(row)}>
                        {row.status === 'completed' ? 'Review' : row.status === 'in_progress' ? 'Continue' : 'Begin ▶'}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {gs && <GrowthSummaryCard gs={gs} onGrowth={onGrowth} />}
        </div>

        {/* ===== right column ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 17 }}>🖊️</span><b style={{ fontSize: 15 }}>Ways to Write</b>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <WayTile icon="⚡" title="Quick Write" sub="A fresh prompt to warm up" busy={busy} onClick={() => launch('quick')} />
              <WayTile icon="🕊️" title="Free Write" sub="Write anything, no rules" busy={busy} onClick={() => launch('free')} />
              <WayTile icon="🎯" title="Fluency Game" sub="Stretch sentences, fast" onClick={() => setGame(true)} />
            </div>
          </div>

          <LunaNook modules={state.modules} onGrowth={onGrowth} />

          {gs && <GrowthStatsRail gs={gs} onGrowth={onGrowth} />}
        </div>
      </div>
    </div>
  )
}

const selStyle = { padding: '8px 10px', borderRadius: 10, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 13, background: '#fff', fontWeight: 600, color: 'var(--ink)' }
