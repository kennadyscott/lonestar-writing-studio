import React, { useState, useMemo } from 'react'
import { api, TRAIT_LABELS } from '../lib/api.js'
import { BRAND } from '../lib/brand.js'
import FluencyGame from './FluencyGame.jsx'
import ModuleBadge from '../components/ModuleBadge.jsx'
import { DataGoalsTab, ShareWallTab } from './GrowthPage.jsx'

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

function LunaNook({ modules, onLuna }) {
  const current = modules.find((m) => m.status === 'in_progress') || modules[0]
  const idx = modules.indexOf(current)
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', background: 'linear-gradient(120deg,#0d2f55,#02384d)', color: '#fff' }}>
        <img src={BRAND.luna} alt="Luna" style={{ height: 40 }} />
        <b style={{ fontSize: 15 }}>Luna's Writing Nook</b>
        <button onClick={onLuna} style={{ marginLeft: 'auto', color: '#cfeefb', fontSize: 12, fontWeight: 700 }}>Your writing path →</button>
      </div>
      <div style={{ padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ModuleBadge id={current.id} size={44} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5, fontWeight: 800 }}>Module {idx + 1}: {current.label}</div>
            <div style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600, margin: '2px 0 5px' }}>4 of 6 activities completed</div>
            <div style={{ height: 7, background: '#e6eef3', borderRadius: 5 }}>
              <div style={{ height: '100%', width: `${current.progress * 100}%`, background: 'linear-gradient(90deg,var(--cyan-bright),var(--cyan))', borderRadius: 5 }} />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
          <div style={{ display: 'flex', gap: 7 }}>
            {modules.map((m) => (
              <span key={m.id} title={m.label} style={{ opacity: m.status === 'not_started' ? .45 : 1 }}>
                <ModuleBadge id={m.id} size={26} dim={m.status === 'not_started'} />
              </span>
            ))}
          </div>
          <button className="btn" style={{ padding: '7px 16px', fontSize: 13 }} onClick={onLuna}>Continue →</button>
        </div>
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
  const stats = [
    { k: 'Current Average', v: `${gs.currentAverage}% ↗`, sub: `↑ ${gs.weeklyDelta}% this week`, c: 'var(--good)' },
    { k: 'Writing Streak', v: `${gs.streakDays} days 🔥`, sub: 'Keep it up!', c: 'var(--muted)' },
    { k: 'Badges Earned', v: `${gs.badges} 🏅`, sub: 'See all badges', c: 'var(--muted)' },
  ]
  return (
    <div className="card" style={{ padding: '18px 22px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '0.9fr 1.2fr 0.9fr', gap: 24, alignItems: 'center' }}>
      <div>
        <div style={{ fontSize: 19, fontWeight: 800 }}>My Data 📊</div>
        <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.5, margin: '6px 0 12px' }}>Your averages at a glance — dig deeper in Data & Goals.</p>
        <button className="btn" style={{ padding: '8px 18px' }} onClick={onGrowth}>See full data →</button>
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
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 16 }}>
        {stats.map((t) => (
          <div key={t.k}>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)' }}>{t.k}</div>
            <div style={{ fontSize: 17, fontWeight: 800, color: 'var(--teal)' }}>{t.v}</div>
            <div style={{ fontSize: 10.5, color: t.c, fontWeight: 600 }}>{t.sub}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Home tab: one featured assignment ---- */
function UpNextCard({ row, busy, begin, onAll }) {
  if (!row) return null
  const s = STATUS_CHIP[row.status]
  return (
    <div className="card" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className="eyebrow">⭐ Up next for you</span>
        <button onClick={onAll} style={{ color: 'var(--link)', fontSize: 12.5, fontWeight: 800 }}>See all assignments →</button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 17 }}>{row.a.title}</div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 7, flexWrap: 'wrap' }}>
            <FormatBadge format={row.a.format} />
            <span className="pill" style={{ background: s.c, color: s.t }}>{row.a.type}</span>
            <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>{row.a.teacher.name}</span>
            <DueChip dueDate={row.a.dueDate} status={row.status} />
          </div>
        </div>
        <button className="btn" disabled={busy} onClick={() => begin(row)}>
          {row.status === 'in_progress' ? 'Continue →' : 'Begin ▶'}
        </button>
      </div>
    </div>
  )
}

/* ---- Assignments tab: active goal banner ---- */
function GoalBanner({ me, onData }) {
  return (
    <div className="card" style={{ padding: '14px 20px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 14, background: 'linear-gradient(120deg,#eef6f9,#fff)' }}>
      <span style={{ fontSize: 28 }}>🎯</span>
      {me.goal ? (
        <>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="eyebrow">My active goal</div>
            <div style={{ fontSize: 15.5, fontWeight: 800 }}>{me.goal.text}</div>
            {me.goal.trait && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 2 }}>Trait: {TRAIT_LABELS[me.goal.trait]} · your coach keeps this in mind when you confer</div>}
          </div>
          <button className="btn ghost" style={{ padding: '7px 16px', whiteSpace: 'nowrap' }} onClick={onData}>Manage goal →</button>
        </>
      ) : (
        <>
          <div style={{ flex: 1 }}>
            <div className="eyebrow">No goal set</div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>Pick one thing to focus on — it shapes your coaching.</div>
          </div>
          <button className="btn" onClick={onData}>Set a goal →</button>
        </>
      )}
    </div>
  )
}

/* ---- Free Write chooser: revise an unfinished story or start fresh ---- */
function FreeWriteModal({ stories, onPick, onNew, onClose, onBank, busy }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60 }} onClick={onClose}>
      <div className="card" style={{ width: 500, maxWidth: '94vw', padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 26 }}>🕊️</span>
          <b style={{ fontSize: 18 }}>Free Write</b>
          <button onClick={onClose} style={{ marginLeft: 'auto', fontSize: 22, color: 'var(--muted)' }}>×</button>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 14px' }}>You have unfinished stories — pick one up where you left off, or start something brand new.</p>

        <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: .5, color: 'var(--teal)', textTransform: 'uppercase', marginBottom: 8 }}>✏️ Revise stories</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto', marginBottom: 16 }}>
          {stories.map(({ sub, a, wcount, excerpt }) => (
            <button key={sub.id} onClick={() => onPick(sub.id)} disabled={busy}
              style={{ display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left', border: '1px solid var(--line)', borderRadius: 12, padding: '11px 14px', background: '#fff' }}>
              <span style={{ fontSize: 20 }}>📄</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 800, fontSize: 14 }}>{a.title}</span>
                <span style={{ display: 'block', fontSize: 12, color: 'var(--muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {excerpt || 'Nothing written yet'} · {wcount} words · Draft {sub.drafts.length}
                </span>
              </span>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: 'var(--link)', whiteSpace: 'nowrap' }}>Revise →</span>
            </button>
          ))}
        </div>

        <button className="btn" disabled={busy} onClick={onNew} style={{ width: '100%', justifyContent: 'center', padding: '11px 0' }}>
          ✨ Start new writing piece
        </button>
        {onBank && (
          <button onClick={onBank} style={{ width: '100%', marginTop: 10, color: 'var(--link)', fontSize: 13, fontWeight: 800 }}>
            🗂️ See everything in my Writing Bank →
          </button>
        )}
      </div>
    </div>
  )
}

/* ---- Assignments tab: companion-product sections ---- */
function ClearSheetsCard({ sheets }) {
  return (
    <div className="card" style={{ padding: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 18 }}>🧾</span><b style={{ fontSize: 15 }}>ClearSheets</b>
        <span style={{ fontSize: 11.5, color: 'var(--muted)', fontWeight: 600 }}>· Worksheets</span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {sheets.map((w) => (
          <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{w.title}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 3 }}>
                <span className="pill" style={{ fontSize: 10.5, padding: '2px 8px', background: '#e2f2f3', color: 'var(--scr)' }}>{w.subject}</span>
                {w.status === 'done'
                  ? <span style={{ fontSize: 11.5, color: 'var(--good)', fontWeight: 700 }}>✓ Done</span>
                  : <DueChip dueDate={w.due} status="not_started" />}
              </div>
            </div>
            <button className={w.status === 'done' ? 'btn ghost' : 'btn'} style={{ padding: '6px 14px', fontSize: 12.5 }} title="Opens in ClearSheets">
              {w.status === 'done' ? 'Review' : 'Open'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

// Crystal Instruction brand: magenta gem + pink wordmark.
function CrystalGem({ size = 20 }) {
  return (
    <svg viewBox="0 0 100 130" width={size} height={size * 1.3} aria-hidden="true">
      <polygon points="50,2 96,52 4,52" fill="#f27bea" />
      <polygon points="50,2 96,52 50,52" fill="#ee3fe0" />
      <polygon points="4,52 96,52 50,128" fill="#e62edf" />
      <polygon points="50,52 96,52 50,128" fill="#c21fb5" />
    </svg>
  )
}

function CrystalQuestCard({ quests }) {
  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 9, padding: '12px 16px', background: 'linear-gradient(120deg,#e62edf,#a916a5)', color: '#fff' }}>
        <CrystalGem size={17} />
        <b style={{ fontSize: 15 }}>Crystal Quest</b>
        <span style={{ fontSize: 11.5, opacity: .9, fontWeight: 600 }}>· Independent learning paths</span>
      </div>
      <div style={{ padding: '13px 16px', display: 'flex', flexDirection: 'column', gap: 13, flex: 1 }}>
        {quests.map((q) => (
          <div key={q.id} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ width: 38, height: 38, borderRadius: 10, background: '#fbe4f9', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
              <CrystalGem size={17} />
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{q.title}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600, margin: '1px 0 5px' }}>{q.area} · <span style={{ color: '#c21fb5', fontWeight: 800 }}>{q.crystals}</span></div>
              <div style={{ height: 6, background: '#f7ddf5', borderRadius: 4 }}>
                <div style={{ height: '100%', width: `${q.progress * 100}%`, background: 'linear-gradient(90deg,#f06ee6,#c21fb5)', borderRadius: 4 }} />
              </div>
            </div>
            <button className="btn" style={{ padding: '6px 14px', fontSize: 12.5, background: '#c21fb5' }} title="Opens in Crystal Quest">Continue</button>
          </div>
        ))}
        <div style={{ fontSize: 11.5, color: 'var(--muted)', marginTop: 'auto' }}>Earn crystals by finishing each step of a path — at your own pace.</div>
      </div>
    </div>
  )
}

/* ---- Full assignments list (owns its filter state) ---- */
function AssignmentsCard({ rows, busy, begin }) {
  const [tab, setTab] = useState('active')
  const [sort, setSort] = useState('due')
  const [typeFilter, setTypeFilter] = useState('all')
  const [formatFilter, setFormatFilter] = useState('all')
  const [query, setQuery] = useState('')

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

  return (
    <div className="card" style={{ overflow: 'hidden', flex: 1 }}>
      <div style={{ display: 'flex', gap: 8, padding: '14px 16px 12px' }}>
        {['active', 'completed'].map((t) => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: '9px 18px', borderRadius: 999, fontWeight: 800, fontSize: 13.5,
              background: tab === t ? 'var(--teal-mid)' : '#eef3f6', color: tab === t ? '#fff' : 'var(--muted)' }}>
            {t === 'active' ? '📋 Active Assignments' : '📗 Completed Assignments'}
          </button>
        ))}
      </div>
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
  )
}

export default function StudentHome({ state, me, onOpen, onLuna, onQuickWrite, onBank, onChange }) {
  const [homeTab, setHomeTab] = useState('home')
  const [busy, setBusy] = useState(false)
  const [game, setGame] = useState(false)
  const [fwChooser, setFwChooser] = useState(false)

  const rows = useMemo(() => {
    const subFor = (aid) => state.submissions.find((s) => s.assignmentId === aid && s.studentId === me.id)
    return state.assignments
      .filter((a) => !a.isPeerRevision)
      .map((a) => {
        const sub = subFor(a.id)
        const status = sub?.completedAt ? 'completed' : sub ? 'in_progress' : 'not_started'
        return { a, sub, status }
      })
  }, [state, me.id])

  // featured: the most urgent not-completed assignment
  const upNext = rows.filter((r) => r.status !== 'completed').sort((x, y) => daysTo(x.a.dueDate) - daysTo(y.a.dueDate))[0]

  async function launch(mode) {
    setBusy(true)
    try { const r = await api.quickWrite(mode); setFwChooser(false); onOpen(r.submissionId) } finally { setBusy(false) }
  }

  // unfinished free-write stories (for the Free Write chooser)
  const openStories = state.submissions
    .filter((s) => s.studentId === me.id && !s.completedAt)
    .map((s) => ({ sub: s, a: state.assignments.find((a) => a.id === s.assignmentId) }))
    .filter(({ a }) => a && a.genre === 'free')
    .map(({ sub, a }) => {
      const last = sub.drafts[sub.drafts.length - 1]
      const words = (last.content || '').trim().split(/\s+/).filter(Boolean)
      return { sub, a, wcount: words.length, excerpt: words.slice(0, 9).join(' ') }
    })

  function freeWrite() {
    if (openStories.length > 0) setFwChooser(true)
    else launch('free')
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
  const dc = state.dailyChallenge

  return (
    <div>
      {game && <FluencyGame onClose={() => setGame(false)} />}
      {fwChooser && (
        <FreeWriteModal stories={openStories} busy={busy} onBank={() => { setFwChooser(false); onBank && onBank() }}
          onPick={(id) => { setFwChooser(false); onOpen(id) }}
          onNew={() => launch('free')}
          onClose={() => setFwChooser(false)} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="page" style={{ margin: 0, fontSize: 26 }}>Hi Kayla — ready to write today? 👋</h1>
        <div style={{ display: 'inline-flex', background: '#dcebf3', borderRadius: 12, padding: 4 }}>
          {[['home', '🏠 Home'], ['assignments', '📋 Assignments'], ['data', '📊 Data & Goals']].map(([k, label]) => (
            <button key={k} onClick={() => setHomeTab(k)}
              style={{ padding: '9px 18px', borderRadius: 9, fontSize: 13.5, fontWeight: 800,
                background: homeTab === k ? 'var(--teal-mid)' : 'transparent', color: homeTab === k ? '#fff' : 'var(--teal)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= HOME ================= */}
      {homeTab === 'home' && (<>
      <div className="hero-banner" style={{ marginBottom: 18 }}>
        <span className="spark" style={{ left: '38%', top: 12 }}>✦</span>
        <span className="spark" style={{ left: '55%', bottom: 14, fontSize: 9 }}>✦</span>
        <span className="spark" style={{ left: '70%', top: 20, fontSize: 10 }}>✦</span>
        <span className="art">📓💻☕</span>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: 'rgba(255,255,255,.12)', border: '1px solid rgba(255,255,255,.25)', display: 'grid', placeItems: 'center', fontSize: 30, flexShrink: 0 }}>🤖</div>
        <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: .8, opacity: .85, textTransform: 'uppercase' }}>Daily Challenge · Revision{dc?.genre ? ` · ${dc.genre}` : ''}</div>
          <div style={{ fontSize: 19, fontWeight: 800 }}>
            {dc?.done ? "Today's challenge is done — nice work! ✓" : `${dc?.author || 'A robot'} wrote something rough — can you fix it up?`}
          </div>
          <div style={{ fontSize: 13, opacity: .9, marginTop: 2 }}>
            {dc?.done ? 'A brand-new challenge lands tomorrow. You can still look back at your revision.' : "Judge it against the rubric, then rewrite it stronger. It's not yours, so revise boldly!"}
          </div>
        </div>
        <button className="btn white" disabled={busy} onClick={peer} style={{ whiteSpace: 'nowrap', position: 'relative' }}>
          {dc?.done ? 'Review →' : dc?.started ? 'Keep going →' : 'Start Revising →'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.65fr) 400px', gap: 18, alignItems: 'stretch', marginBottom: 18 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <UpNextCard row={upNext} busy={busy} begin={begin} onAll={() => setHomeTab('assignments')} />
          {gs && <GrowthSummaryCard gs={gs} onGrowth={() => setHomeTab('data')} />}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div className="card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 17 }}>🖊️</span><b style={{ fontSize: 15 }}>Ways to Write</b>
              <button onClick={onBank} style={{ marginLeft: 'auto', color: 'var(--link)', fontSize: 12.5, fontWeight: 800 }}>🗂️ Writing Bank →</button>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <WayTile icon="⚡" title="Quick Write" sub="A timed prompt to warm up" busy={busy} onClick={onQuickWrite} />
              <WayTile icon="🕊️" title="Free Write" sub="Write anything, no rules" busy={busy} onClick={freeWrite} />
              <WayTile icon="🎯" title="Fluency Game" sub="Stretch sentences, fast" onClick={() => setGame(true)} />
            </div>
          </div>
          <LunaNook modules={state.modules} onLuna={onLuna} />
        </div>
      </div>

      <ShareWallTab state={state} me={me} onChange={onChange} />
      </>)}

      {/* ================= ASSIGNMENTS ================= */}
      {homeTab === 'assignments' && (<>
        <GoalBanner me={me} onData={() => setHomeTab('data')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.65fr) 400px', gap: 18, alignItems: 'stretch', marginBottom: 18 }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <AssignmentsCard rows={rows} busy={busy} begin={begin} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <ClearSheetsCard sheets={state.clearSheets || []} />
            <CrystalQuestCard quests={state.crystalQuests || []} />
          </div>
        </div>
        {gs && <GrowthSummaryCard gs={gs} onGrowth={() => setHomeTab('data')} />}
      </>)}

      {/* ================= DATA & GOALS ================= */}
      {homeTab === 'data' && <DataGoalsTab state={state} me={me} onChange={onChange} />}
    </div>
  )
}

const selStyle = { padding: '8px 10px', borderRadius: 10, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 13, background: '#fff', fontWeight: 600, color: 'var(--ink)' }
