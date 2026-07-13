import React, { useState, useMemo, useEffect } from 'react'
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
    <div style={{ flex: 1, borderRadius: 18, background: 'linear-gradient(135deg,#0d2f55,#0a2342)', padding: 14, position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', gap: 12, boxShadow: 'var(--shadow)' }}>
      <span style={{ position: 'absolute', top: 12, right: 18, color: 'rgba(255,255,255,.5)', fontSize: 12 }}>✦</span>
      <span style={{ position: 'absolute', bottom: 14, right: 40, color: '#f5c542', fontSize: 10 }}>✦</span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
        <img src={BRAND.luna} alt="Luna" style={{ height: 44 }} />
        <div>
          <b style={{ fontSize: 16, color: '#fff' }}>Luna's Writing Nook</b>
          <div style={{ fontSize: 12, color: '#bcdcf0', fontWeight: 600 }}>Your writing path</div>
        </div>
      </div>
      <div style={{ background: '#fff', borderRadius: 14, padding: '14px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 9 }}>
        <b style={{ fontSize: 14.5 }}>Module {idx + 1}: {current.label}</b>
        <div style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 600 }}>4 of 6 activities completed</div>
        <div style={{ height: 8, background: '#e6eef3', borderRadius: 5 }}>
          <div style={{ height: '100%', width: `${current.progress * 100}%`, background: 'linear-gradient(90deg,var(--cyan-bright),var(--cyan))', borderRadius: 5 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, margin: '4px 0 6px' }}>
          {modules.map((m) => (
            <span key={m.id} title={m.label} style={{ opacity: m.status === 'not_started' ? .4 : 1 }}>
              <ModuleBadge id={m.id} size={30} dim={m.status === 'not_started'} />
            </span>
          ))}
        </div>
        <button className="btn" style={{ alignSelf: 'flex-start', padding: '9px 22px', fontSize: 13.5 }} onClick={onLuna}>Go to my path →</button>
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
    <div style={{ position: 'relative', background: '#fff', border: '2.5px solid #0a7dba', borderRadius: 18, boxShadow: '0 8px 24px rgba(6,170,222,.16)', padding: '24px 22px 14px' }}>
      <span style={{ position: 'absolute', top: -14, left: 18, background: 'linear-gradient(120deg,#f5b400,#e89a00)', color: '#3d2c00', fontSize: 11.5, fontWeight: 800, letterSpacing: .6, padding: '5px 15px', borderRadius: 999, boxShadow: '0 2px 8px rgba(180,120,0,.35)' }}>
        ⭐ UP NEXT FOR YOU
      </span>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ transform: 'scale(1.2)', transformOrigin: 'left center' }}><FormatBadge format={row.a.format} /></span>
            <span style={{ fontWeight: 800, fontSize: 23, color: '#0d2f55' }}>{row.a.title}</span>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginTop: 10, flexWrap: 'wrap' }}>
            <span className="pill" style={{ background: s.c, color: s.t }}>{row.a.type}</span>
            <span style={{ fontSize: 13, color: 'var(--muted)', fontWeight: 600 }}>{row.a.teacher.name}</span>
            <DueChip dueDate={row.a.dueDate} status={row.status} />
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 9 }}>
          <button className="btn" disabled={busy} onClick={() => begin(row)} style={{ padding: '13px 30px', fontSize: 15.5 }}>
            {row.status === 'in_progress' ? 'Continue →' : 'Begin ▶'}
          </button>
          <button onClick={onAll} style={{ color: 'var(--link)', fontSize: 13, fontWeight: 800 }}>See all assignments →</button>
        </div>
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

/* ---- Daily Writing Path: the Writing Launchpad (mission control) ---- */
const STEP_META = {
  assignments: { icon: '📄', label: 'ECR or SCR Assignment', accent: 'Show What You Know', badge: '📄',
    desc: 'Work on the writing your teacher assigned — draft, revise, or polish.', ctaWord: 'Continue Assignment', illus: ['📄', '✨'] },
  quickwrite: { icon: '⚡', label: 'Quick Write', accent: 'Spark a Response', badge: '⚡',
    desc: "Write a short response to today's question using clear ideas.", ctaWord: 'Start Writing', illus: ['📓', '🖊️'] },
  luna: { icon: '🌟', label: "Luna's Writing Nook", accent: 'Level Up Your Skills', badge: '🌟',
    desc: 'Complete one activity in your current module.', ctaWord: "Open Luna's Nook", illus: ['🌟', '📚'] },
  revision: { icon: '✏️', label: 'Daily Revision Challenge', accent: 'Make It Shine', badge: '✏️',
    desc: 'Improve one short piece of writing by fixing and strengthening sentences.', ctaWord: 'Take the Challenge', illus: ['✏️', '✨'] },
  freewrite: { icon: '🕊️', label: 'Free Write', accent: 'Follow Your Idea', badge: '✍️',
    desc: 'Write about anything you choose. Start with a prompt or your own topic.', ctaWord: 'Start a New Free Write', illus: ['📖', '🌙'] },
  games: { icon: '🎯', label: 'Fluency Games', accent: 'Build Your Flow', badge: '🎮',
    desc: 'Play short games that help you write complete sentences quickly and smoothly.', ctaWord: 'Play', illus: ['🎮', '⭐'] },
  goal_data: { icon: '🎯', label: 'My Writing Goals', accent: 'Choose Your Next Focus', badge: '⭐',
    desc: 'Check the skill you are working on and see your progress.', ctaWord: 'View My Goal', illus: ['⭐', '📈'] },
}
const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MISSION_COLORS = ['#8b5cf6', '#2f8ceb', '#0b8a8f']

const MISSION_GRADS = [['#8b5cf6', '#6d3fd8'], ['#2f8ceb', '#1668c4'], ['#0b8a8f', '#067276']]

function WritingLaunchpad({ state, me, wp, busy, upNext, onMission, onHow, onQuickWrite, onFreeWrite, onGames, onBank }) {
  const day = DAY_NAMES[wp?.day ?? new Date().getDay()]
  const quest = !!(wp?.steps && !wp.completed)
  const weekend = !wp?.steps
  const curIdx = quest ? wp.done.findIndex((d) => !d) : -1
  const doneCount = wp?.steps ? wp.done.filter(Boolean).length : 0

  // live detail rows per card (time, type, status — real data)
  const qp = state.quickPrompts?.length ? state.quickPrompts[Math.floor(Date.now() / 86400000) % state.quickPrompts.length] : null
  const mod = state.modules?.find((m) => m.status === 'in_progress') || state.modules?.[0]
  const qMin = Math.round((state.settings?.quickWriteSeconds ?? 180) / 60)
  const lastFree = (state.submissions || []).filter((x) => x.studentId === me.id && state.assignments.find((a) => a.id === x.assignmentId)?.genre === 'free').slice(-1)[0]
  const lastFreeTitle = lastFree ? state.assignments.find((a) => a.id === lastFree.assignmentId)?.title : null
  const gameCount = (state.fluencyGames || []).filter((g) => g.kind !== 'soon').length
  const rowsFor = (t) => ({
    quickwrite: [
      ['💬', qp ? `Today's prompt: “${qp.title}”` : 'A fresh prompt each day'],
      ['🕐', `About ${qMin} minutes`],
      ['👤', 'Practice — builds your streak'],
    ],
    assignments: [
      ['📄', upNext ? `${upNext.a.format || 'SCR'} · ${upNext.a.title}` : 'Pick any assignment'],
      ['🕐', 'About 10–15 minutes'],
      ['👤', upNext ? `Assigned by ${upNext.a.teacher.name}` : 'From your teacher'],
    ],
    luna: [
      ['🌟', mod ? `Module ${state.modules.indexOf(mod) + 1}: ${mod.label}` : 'Your writing path'],
      ['📈', '4 of 6 activities complete'],
      ['🕐', 'One activity'],
    ],
    revision: [
      ['✏️', 'One challenge a day'],
      ['🕐', 'Usually 3–10 minutes'],
      ['🔥', 'Feeds your daily streak'],
    ],
    freewrite: [
      ['📄', lastFreeTitle ? `Your last free write: ${lastFreeTitle}` : 'A blank page, all yours'],
      ['🕐', '10–20 minutes'],
      ['💾', 'Autosaves as you write'],
    ],
    games: [
      ['🎮', `${gameCount} games in the library`],
      ['🏆', 'Play any 2 to finish'],
      ['🕐', '5–10 minutes'],
    ],
    goal_data: [
      ['🎯', me.goal ? `Current goal: ${me.goal.text}` : 'No goal set — pick one!'],
      ['📈', 'Then take a quick data dive'],
      ['🕐', 'About 5 minutes'],
    ],
  })[t]

  const freeTiles = [
    { icon: '⚡', title: 'Quick Write', sub: 'A timed prompt to warm up', onClick: onQuickWrite },
    { icon: '🕊️', title: 'Free Write', sub: 'Write anything, no rules', onClick: onFreeWrite },
    { icon: '🎯', title: 'Fluency Games', sub: 'A library of games to play', onClick: onGames },
  ]

  return (
    <div className="card" style={{ padding: '16px 18px 12px' }}>
      {/* header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 14 }}>
        <img src={BRAND.rocket} alt="" style={{ height: 42 }} />
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 18 }}>Writing Launchpad</b>
          <div style={{ fontSize: 12.5, color: 'var(--muted)', fontWeight: 600 }}>
            {quest ? 'Your daily writing path. One mission at a time.' : weekend ? 'Mission Control is open — no missions today.' : 'Missions complete — free flight!'}
          </div>
        </div>
        <button onClick={onHow} style={{ display: 'inline-flex', alignItems: 'center', gap: 7, border: '1.5px solid var(--line)', borderRadius: 999, padding: '8px 16px', fontSize: 13, fontWeight: 800, color: 'var(--ink)', background: '#fff', boxShadow: 'var(--shadow)' }}>
          <span style={{ width: 17, height: 17, borderRadius: '50%', background: '#0d2f55', color: '#fff', display: 'grid', placeItems: 'center', fontSize: 10.5, fontWeight: 800 }}>?</span>
          How it works
        </button>
      </div>

      {/* space panel (real art) */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 16, padding: '24px 26px 96px', color: '#fff',
          background: `linear-gradient(95deg, rgba(7,16,48,.94) 0%, rgba(7,16,48,.72) 38%, rgba(7,16,48,.22) 66%, rgba(7,16,48,.05) 100%), url(${BRAND.launchBg}) right center / cover no-repeat, linear-gradient(115deg,#0b1e4b,#12306b)` }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 2, color: '#7fd4ff', textTransform: 'uppercase' }}>
            {quest ? `Today · ${day}` : weekend ? `${day} · Open Studio` : `Today · ${day} · Complete`}
          </div>
          <div style={{ fontSize: 27, fontWeight: 800, margin: '4px 0 3px', textShadow: '0 2px 10px rgba(0,0,0,.5)' }}>Launch Sequence</div>
          <div style={{ fontSize: 14, color: '#cdddf5' }}>
            {quest ? 'Complete 3 missions to power up your day!' : weekend ? 'No missions — pick anything and fly.' : 'All 3 missions complete. Mission Control is yours!'}
          </div>
        </div>

        {quest ? (
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, padding: '0 20px', marginTop: -70, alignItems: 'stretch' }}>
            {wp.steps.map((t, i) => {
              const done = wp.done[i]
              const current = i === curIdx
              return (
                <TaskCard key={t} meta={STEP_META[t]} rows={rowsFor(t)} number={i + 1}
                  status={done ? 'done' : current ? 'current' : 'future'}
                  gamesNote={t === 'games' && (current || done) ? `${Math.min(wp.gamesPlayed, 2)} of 2 played` : null}
                  ctaLabel={STEP_META[t].ctaWord} onAction={() => onMission(i)} busy={busy} />
              )
            })}
          </div>
        ) : (
          <div style={{ position: 'relative', display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 24, padding: '0 20px', marginTop: -70, alignItems: 'stretch' }}>
            <TaskCard meta={STEP_META.quickwrite} rows={rowsFor('quickwrite')} status="free" ctaLabel="Start Writing" onAction={onQuickWrite} busy={busy} />
            <TaskCard meta={STEP_META.freewrite} rows={rowsFor('freewrite')} status="free" ctaLabel="Start a New Free Write" onAction={onFreeWrite} busy={busy} />
            <TaskCard meta={STEP_META.games} rows={rowsFor('games')} status="free" ctaLabel="Play" onAction={onGames} busy={busy} />
          </div>
        )}
      </div>

      {/* progress / status row */}
      {wp?.steps ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, background: '#f4f8fb', borderRadius: 13, padding: '10px 16px', margin: '16px 0 4px' }}>
          <span style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(140deg,#f5c542,#e89a00)', display: 'grid', placeItems: 'center', fontSize: 17, flexShrink: 0 }}>⭐</span>
          <b style={{ fontSize: 13.5, whiteSpace: 'nowrap' }}>{doneCount} of 3 missions completed</b>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', maxWidth: 260, margin: '0 auto' }}>
            {[0, 1, 2].map((i) => (
              <React.Fragment key={i}>
                {i > 0 && <span style={{ flex: 1, height: 4, background: wp.done[i - 1] && wp.done[i] ? '#f5b400' : '#dbe5ee' }} />}
                <span style={{ width: 15, height: 15, borderRadius: '50%', background: wp.done[i] ? '#f5b400' : '#dbe5ee', boxShadow: wp.done[i] ? '0 0 8px rgba(245,180,0,.6)' : 'none' }} />
              </React.Fragment>
            ))}
          </div>
          <span style={{ fontSize: 12, fontWeight: 700, color: quest ? 'var(--muted)' : 'var(--good)', whiteSpace: 'nowrap' }}>
            {quest ? 'Finish all 3 to unlock your full dashboard! 🔒' : '🎉 Dashboard unlocked!'}
          </span>
        </div>
      ) : null}
      {!quest && (
        <div style={{ textAlign: 'right', margin: '6px 0 2px' }}>
          <button onClick={onBank} style={{ color: 'var(--link)', fontSize: 12.5, fontWeight: 800 }}>🗂️ Writing Bank →</button>
        </div>
      )}
    </div>
  )
}

function HowItWorksModal({ onClose }) {
  const rows = [
    ['🗓️', 'Every school day has a 3-mission writing path — a different mix each day.'],
    ['1️⃣', 'Do the missions in order. The colored button shows your current mission.'],
    ['🎯', 'On Fluency Game days, play 2 games and the mission checks itself off.'],
    ['🤖', "Nova's Daily Revision Challenge is a bonus — it unlocks after your first 2 missions and pays 100 coins."],
    ['🎁', 'Finish all 3: +25 coins, your streak grows, and Mission Control unlocks for free choice.'],
    ['🏖️', 'Weekends are open flight — no path, Mission Control is unlocked all day.'],
  ]
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.55)', display: 'grid', placeItems: 'center', zIndex: 70 }} onClick={onClose}>
      <div className="card" style={{ padding: 26, width: 460, maxWidth: '94vw' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 24 }}>🚀</span><b style={{ fontSize: 17 }}>How the Writing Launchpad works</b>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map(([icon, text], i) => (
            <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: 13.5, lineHeight: 1.45 }}>
              <span style={{ fontSize: 16 }}>{icon}</span><span>{text}</span>
            </div>
          ))}
        </div>
        <button className="btn" style={{ width: '100%', justifyContent: 'center', marginTop: 16 }} onClick={onClose}>Got it!</button>
      </div>
    </div>
  )
}

/* ---- celebration when the final stop lands (trophy mockup) ---- */
function PathCelebration({ wp, streak, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,9,38,.78)', display: 'grid', placeItems: 'center', zIndex: 70 }}>
      <div style={{ position: 'relative', width: 620, maxWidth: '94vw', background: '#f7f5fc', borderRadius: 28,
        border: '2px solid #8b7cf5', boxShadow: '0 0 60px rgba(120,100,240,.35), 0 24px 60px rgba(0,0,0,.5)',
        padding: '38px 44px 34px', textAlign: 'center', animation: 'popIn .35s ease' }}>
        <span style={{ position: 'absolute', top: 26, left: 34, color: '#a894f8', fontSize: 20 }}>✦</span>
        <span style={{ position: 'absolute', top: 44, left: 58, color: '#e2c96a', fontSize: 11 }}>✦</span>
        <span style={{ position: 'absolute', top: 30, right: 38, color: '#a894f8', fontSize: 16 }}>✦</span>
        <span style={{ position: 'absolute', top: 52, right: 62, color: '#c9bcfa', fontSize: 10 }}>✦</span>
        <span style={{ position: 'absolute', bottom: 34, left: 40, color: '#c9bcfa', fontSize: 13 }}>✦</span>
        <span style={{ position: 'absolute', bottom: 46, right: 44, color: '#a894f8', fontSize: 12 }}>✦</span>

        <img src={BRAND.trophy} alt="" style={{ width: 230, mixBlendMode: 'multiply', WebkitMaskImage: 'radial-gradient(ellipse 62% 58% at 50% 50%, #000 52%, transparent 76%)', maskImage: 'radial-gradient(ellipse 62% 58% at 50% 50%, #000 52%, transparent 76%)' }} />

        <h2 style={{ margin: '10px 0 8px', fontSize: 36, fontWeight: 800, color: '#151238', letterSpacing: -.5 }}>Sequence Complete</h2>
        <p style={{ color: '#43406e', margin: '0 0 22px', fontSize: 16.5, fontWeight: 600 }}>
          You did the writer's work today — <b style={{ color: CARD_PURPLE }}>Mission Control</b> is <b style={{ color: CARD_PURPLE }}>unlocked</b>.
        </p>

        {/* stat chips */}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 22 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#fff', border: '1.5px solid #ead9a0', borderRadius: 999, padding: '10px 20px', fontSize: 14.5, fontWeight: 800, color: '#8a6400', boxShadow: '0 3px 10px rgba(190,150,30,.12)' }}>
            🪙 Coins Earned <span style={{ background: '#fdf1d2', borderRadius: 999, padding: '2px 10px' }}>+25</span>
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 9, background: '#fff', border: '1.5px solid #f2c9b0', borderRadius: 999, padding: '10px 20px', fontSize: 14.5, fontWeight: 800, color: '#c2571f', boxShadow: '0 3px 10px rgba(194,87,31,.12)' }}>
            🔥 Streak <span style={{ background: '#fdeee3', borderRadius: 999, padding: '2px 10px' }}>{streak} days</span>
          </span>
        </div>

        <button onClick={onClose}
          style={{ width: '100%', padding: '16px 0', borderRadius: 14, fontSize: 16.5, fontWeight: 800, letterSpacing: .3, color: '#fff',
            background: `linear-gradient(120deg, ${CARD_PURPLE}, #7d5df0)`, boxShadow: `0 8px 24px ${CARD_PURPLE}66`, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          🚀 Take me to Mission Control <span>→</span>
        </button>
      </div>
    </div>
  )
}

/* ---- slim ribbons for the unlocked dashboard ---- */
function PathRibbon({ wp }) {
  const day = DAY_NAMES[wp?.day ?? new Date().getDay()]
  if (!wp) return null
  if (!wp.steps) {
    return (
      <div className="card" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, background: 'linear-gradient(120deg,#f0faff,#fff)' }}>
        <span style={{ fontSize: 24 }}>🏖️</span>
        <span style={{ fontSize: 14, fontWeight: 700 }}>No writing path on {day}s — Mission Control is all yours.</span>
      </div>
    )
  }
  return (
    <div style={{ borderRadius: 16, background: 'linear-gradient(115deg,#1e8a5c,#2e9e6b)', color: '#fff', padding: '11px 20px', display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18, boxShadow: '0 4px 16px rgba(46,158,107,.3)' }}>
      <span style={{ fontSize: 22 }}>🎉</span>
      <b style={{ fontSize: 14.5 }}>{day}'s path complete — Mission Control is open. Write, play, revise, share!</b>
    </div>
  )
}

/* ---- demo-only: scrub through the week ---- */
function DemoWeekStrip({ wp, onPick }) {
  const realDow = new Date().getDay()
  const effective = wp?.day ?? realDow
  const days = [[1, 'Monday'], [2, 'Tuesday'], [3, 'Wednesday'], [4, 'Thursday'], [5, 'Friday'], [0, '🏖️ Weekend']]
  return (
    <div style={{ marginTop: 26, border: '2px dashed #c3d5e4', borderRadius: 14, padding: '12px 18px', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', background: 'rgba(255,255,255,.6)' }}>
      <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1, color: 'var(--muted)', textTransform: 'uppercase' }}>🎛️ Demo · preview the week</span>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
        {days.map(([d, label]) => (
          <button key={d} onClick={() => onPick(d)}
            style={{ padding: '7px 15px', borderRadius: 999, fontSize: 12.5, fontWeight: 800,
              background: effective === d ? '#0d2f55' : '#fff', color: effective === d ? '#fff' : 'var(--teal)',
              border: '1.5px solid ' + (effective === d ? '#0d2f55' : 'var(--line)') }}>
            {label}
          </button>
        ))}
      </div>
      <button onClick={() => onPick(null)} title="Back to the real day"
        style={{ fontSize: 12, fontWeight: 800, color: 'var(--muted)', padding: '7px 10px' }}>↩ Real today</button>
    </div>
  )
}

/* ---- unified task card: illustration, badge, plain title + accent, desc, details, CTA ---- */
const CARD_PURPLE = '#6455e0'
function TaskCard({ meta, rows, number, status, gamesNote, ctaLabel, onAction, busy }) {
  const done = status === 'done'
  const current = status === 'current' || status === 'free'
  const future = status === 'future'
  return (
    <div style={{ position: 'relative', background: '#fff', borderRadius: 20, display: 'flex', flexDirection: 'column',
      border: done ? '2px solid #7ccfa4' : current && status !== 'free' ? `2px solid ${CARD_PURPLE}` : '2px solid #2b2361',
      boxShadow: current && status !== 'free' ? `0 12px 30px ${CARD_PURPLE}45` : '0 8px 20px rgba(30,25,80,.14)',
      filter: future ? 'saturate(.5) opacity(.75)' : 'none', overflow: 'visible' }}>
      {number != null && (
        <span style={{ position: 'absolute', top: -14, left: -14, width: 38, height: 38, borderRadius: '50%', display: 'grid', placeItems: 'center', zIndex: 3,
          background: done ? 'var(--good)' : CARD_PURPLE, color: '#fff', fontWeight: 800, fontSize: 17, border: '3px solid #fff', boxShadow: '0 4px 12px rgba(30,25,80,.35)' }}>
          {done ? '✓' : number}
        </span>
      )}
      {/* illustration zone */}
      <div style={{ position: 'relative', height: 108, borderRadius: '17px 17px 0 0', overflow: 'hidden',
        background: 'radial-gradient(ellipse at 75% 20%, rgba(120,90,220,.55) 0%, transparent 55%), linear-gradient(160deg,#251c52,#3d2f80)' }}>
        <span style={{ position: 'absolute', top: 12, left: '14%', color: '#f5d97a', fontSize: 11 }}>✦</span>
        <span style={{ position: 'absolute', top: 30, right: '16%', color: 'rgba(255,255,255,.75)', fontSize: 8 }}>✦</span>
        <span style={{ position: 'absolute', bottom: 26, left: '24%', color: 'rgba(255,255,255,.5)', fontSize: 7 }}>✦</span>
        <span style={{ position: 'absolute', top: 16, right: '38%', color: '#f5d97a', fontSize: 8 }}>✦</span>
        <span style={{ position: 'absolute', left: '50%', top: '44%', transform: 'translate(-50%,-50%) rotate(-6deg)', fontSize: 44, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,.45))' }}>{meta.illus[0]}</span>
        <span style={{ position: 'absolute', left: '64%', top: '58%', fontSize: 22, filter: 'drop-shadow(0 2px 3px rgba(0,0,0,.4))' }}>{meta.illus[1]}</span>
      </div>
      {/* circular badge bridging the zones */}
      <span style={{ alignSelf: 'center', marginTop: -26, width: 52, height: 52, borderRadius: '50%', display: 'grid', placeItems: 'center', zIndex: 2,
        background: done ? 'var(--good)' : CARD_PURPLE, border: '4px solid #fff', fontSize: 22, boxShadow: '0 4px 12px rgba(30,25,80,.3)' }}>
        {done ? '✓' : meta.badge}
      </span>
      {/* content */}
      <div style={{ padding: '10px 16px 14px', display: 'flex', flexDirection: 'column', flex: 1, textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 15.5, letterSpacing: .4, textTransform: 'uppercase', color: '#1c1650', lineHeight: 1.2 }}>{meta.label}</div>
        <div style={{ fontSize: 13, color: CARD_PURPLE, fontWeight: 800, marginTop: 3 }}>{meta.accent}</div>
        <p style={{ fontSize: 12.5, color: '#41586b', lineHeight: 1.5, margin: '9px 0 0', fontWeight: 600 }}>{meta.desc}</p>
        <div style={{ borderTop: '1px solid var(--line)', margin: '11px 0 10px' }} />
        {/* detail rows */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, textAlign: 'left', flex: 1 }}>
          {rows.map(([icon, text], ri) => (
            <div key={ri} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', fontSize: 12, fontWeight: 700, color: '#33475a' }}>
              <span style={{ fontSize: 13, width: 18, textAlign: 'center', flexShrink: 0 }}>{icon}</span>
              <span style={{ lineHeight: 1.35, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{text}</span>
            </div>
          ))}
          {gamesNote && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, fontWeight: 800, color: CARD_PURPLE }}>
              <span style={{ fontSize: 13, width: 18, textAlign: 'center' }}>▶</span>{gamesNote}
            </div>
          )}
        </div>
        {/* CTA */}
        <button disabled={busy || (!current && !done ? true : done)} onClick={current ? onAction : undefined}
          style={{ marginTop: 12, width: '100%', padding: '12px 0', borderRadius: 12, fontWeight: 800, fontSize: 13.5, letterSpacing: .6, textTransform: 'uppercase',
            color: done ? 'var(--good)' : current ? '#fff' : '#9db0c0',
            background: done ? '#e6f6ee' : current ? CARD_PURPLE : '#eef0f6',
            boxShadow: current ? `0 6px 16px ${CARD_PURPLE}55` : 'none', cursor: current ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {done ? '✓ Done!' : current ? <>{ctaLabel} <span>→</span></> : `After Mission ${number - 1}`}
        </button>
      </div>
    </div>
  )
}

/* ---- unlocked studio: big bold task cards (structurally distinct from the Launchpad) ---- */
function BigTask({ icon, title, sub, grad, onClick, busy }) {
  const [c1, c2] = grad
  return (
    <button disabled={busy} onClick={onClick}
      style={{ position: 'relative', overflow: 'hidden', borderRadius: 20, padding: '24px 24px', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 18,
        background: `linear-gradient(120deg,${c1},${c2})`, boxShadow: `0 10px 26px ${c1}55`, color: '#fff', cursor: 'pointer' }}>
      <span style={{ position: 'absolute', top: 12, right: 74, color: 'rgba(255,255,255,.6)', fontSize: 12 }}>✦</span>
      <span style={{ position: 'absolute', bottom: 14, right: 150, color: 'rgba(255,255,255,.4)', fontSize: 9 }}>✦</span>
      <span style={{ width: 66, height: 66, borderRadius: 18, background: 'rgba(255,255,255,.18)', border: '1.5px solid rgba(255,255,255,.35)', display: 'grid', placeItems: 'center', fontSize: 34, flexShrink: 0 }}>{icon}</span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 20, fontWeight: 800 }}>{title}</span>
        <span style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,.88)', fontWeight: 600, marginTop: 3 }}>{sub}</span>
      </span>
      <span style={{ background: '#fff', color: c1, fontWeight: 800, borderRadius: 999, padding: '10px 24px', fontSize: 14.5, whiteSpace: 'nowrap' }}>Go →</span>
    </button>
  )
}

/* ---- Daily Challenge banner: navy space theme (mockup) ---- */
function Spark({ x, y, c, s: size, glyph = '✦' }) {
  return <span style={{ position: 'absolute', left: x, top: y, color: c, fontSize: size, pointerEvents: 'none', textShadow: `0 0 8px ${c}` }}>{glyph}</span>
}

function Comet({ x, y, c, rot = -18, w = 80 }) {
  return <span style={{ position: 'absolute', left: x, top: y, width: w, height: 3, borderRadius: 3, background: `linear-gradient(90deg, transparent, ${c})`, transform: `rotate(${rot}deg)`, pointerEvents: 'none', boxShadow: `0 0 6px ${c}` }} />
}

function DailyBanner({ dc, busy, onGo, locked, missionsDone }) {
  return (
    <div style={{ position: 'relative', overflow: 'hidden', borderRadius: 22, color: '#fff', padding: '24px 28px', display: 'flex', alignItems: 'center', gap: 24,
      background: 'radial-gradient(ellipse at 12% 15%, rgba(60,90,200,.45) 0%, transparent 45%), radial-gradient(ellipse at 88% 85%, rgba(40,70,160,.4) 0%, transparent 50%), linear-gradient(110deg,#0a1434 0%,#0e1d4a 55%,#0a1434 100%)',
      boxShadow: '0 10px 30px rgba(8,16,50,.45)' }}>

      {/* star field + comets */}
      <Spark x="30%" y={12} c="#ffffff" s={9} />
      <Spark x="44%" y="72%" c="#8fd8ff" s={13} />
      <Spark x="56%" y={16} c="#ffd76b" s={11} glyph="⭐" />
      <Spark x="63%" y="58%" c="#ffffff" s={7} />
      <Spark x="71%" y={26} c="#5aa8ff" s={18} />
      <Spark x="80%" y="70%" c="#ffd76b" s={9} />
      <Spark x="90%" y={14} c="#ffd76b" s={14} glyph="⭐" />
      <Spark x="95%" y="60%" c="#8fd8ff" s={8} />
      <Comet x="47%" y="80%" c="#ff8fb0" rot={-14} w={70} />
      <Comet x="58%" y="34%" c="#ffd76b" rot={-20} w={90} />
      <Comet x="86%" y="42%" c="#5ad7ff" rot={-16} w={64} />

      {/* robot in glowing ring orb */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <div style={{ width: 108, height: 108, borderRadius: '50%', padding: 3.5,
          background: 'conic-gradient(from 210deg, #8b5cf6, #38b6ff, #6ee7ff, #8b5cf6)',
          boxShadow: locked ? 'none' : '0 0 30px rgba(110,150,255,.7)', filter: locked ? 'grayscale(.45) brightness(.8)' : 'none' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', position: 'relative', overflow: 'hidden',
            background: 'radial-gradient(circle at 35% 28%, #2b4bb8 0%, #14205a 55%, #0c1440 100%)',
            display: 'grid', placeItems: 'center', fontSize: 52 }}>
            <span style={{ position: 'absolute', top: 12, right: 16, color: '#fff', fontSize: 7 }}>✦</span>
            <span style={{ position: 'absolute', bottom: 16, left: 14, color: '#8fd8ff', fontSize: 6 }}>✦</span>
            🤖
          </div>
        </div>
        <span style={{ position: 'absolute', bottom: -2, left: -10, fontSize: 24, filter: 'drop-shadow(0 0 6px rgba(255,200,60,.8))' }}>⭐</span>
        <span style={{ position: 'absolute', top: -6, right: -4, fontSize: 14, filter: 'drop-shadow(0 0 5px rgba(255,200,60,.8))' }}>⭐</span>
        {locked && <span style={{ position: 'absolute', bottom: -2, right: -4, width: 34, height: 34, borderRadius: '50%', background: '#f5b400', display: 'grid', placeItems: 'center', fontSize: 17, boxShadow: '0 2px 10px rgba(0,0,0,.45)', zIndex: 2 }}>🔒</span>}
      </div>

      {/* content */}
      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: 2.2, color: '#e8f1ff', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span>Daily Challenge</span>
          <span style={{ color: '#5aa8ff', fontSize: 10 }}>●</span>
          <span>Revision</span>
          {dc?.genre && (<><span style={{ color: '#5aa8ff', fontSize: 10 }}>●</span><span>{dc.genre}</span></>)}
        </div>
        <div style={{ fontSize: 23, fontWeight: 800, margin: '6px 0 4px', textShadow: '0 1px 8px rgba(0,0,0,.4)' }}>
          {dc?.done ? "Today's challenge is done — nice work! ✓" : `${dc?.author || 'A robot'} wrote something rough — can you fix it up?`}
        </div>
        <div style={{ fontSize: 14.5, color: '#c9dbf4', marginBottom: 13 }}>
          {dc?.done ? 'A brand-new challenge lands tomorrow. You can still look back at your revision.'
            : locked ? 'A bonus challenge — finish 2 missions in your Launch Sequence to unlock it!'
            : "Judge it against the rubric, then rewrite it stronger. It's not yours, so revise boldly!"}
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, borderRadius: 999, padding: '8px 20px', fontSize: 13.5, fontWeight: 800, letterSpacing: .6,
          background: 'linear-gradient(120deg,#f5c542,#e89a00)', color: '#3d2c00', border: '1.5px solid rgba(255,225,140,.9)', boxShadow: '0 0 16px rgba(245,180,0,.55)' }}>
          🪙 EARN 100 COINS!
        </span>
      </div>

      {/* rubric laptop + charged mug vignette */}
      <div aria-hidden style={{ position: 'relative', flexShrink: 0, alignSelf: 'flex-end', display: 'flex', alignItems: 'flex-end', gap: 4, marginBottom: -4 }}>
        <div>
          <div style={{ width: 84, height: 54, borderRadius: '7px 7px 0 0', border: '3px solid #c9955c', borderBottom: 'none', background: '#0d2438', padding: '5px 7px' }}>
            <div style={{ fontSize: 7, fontWeight: 800, letterSpacing: 1, color: '#7fd4a0' }}>RUBRIC</div>
            {[0, 1].map((i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
                <span style={{ flex: 1, height: 4, borderRadius: 2, background: 'rgba(150,190,230,.45)' }} />
                <span style={{ fontSize: 8, color: '#57d98a' }}>✔</span>
              </div>
            ))}
          </div>
          <div style={{ width: 100, height: 8, background: 'linear-gradient(#d8a86b,#b07d43)', borderRadius: '2px 2px 8px 8px', margin: '0 auto' }} />
        </div>
        <span style={{ fontSize: 30, filter: 'hue-rotate(165deg) saturate(2) brightness(1.15)' }}>☕</span>
        <span style={{ position: 'absolute', right: 6, bottom: 8, fontSize: 11 }}>⚡</span>
      </div>

      {/* locked: dim the whole banner under an explicit lock panel */}
      {locked && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 6, borderRadius: 22, display: 'grid', placeItems: 'center',
          background: 'rgba(7,11,34,.72)', backdropFilter: 'saturate(.35) blur(1.5px)', border: '2px dashed rgba(150,170,220,.4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '14px 30px', maxWidth: '92%' }}>
            <span style={{ width: 62, height: 62, borderRadius: '50%', flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 30,
              background: 'linear-gradient(135deg,#f5c542,#e89a00)', border: '3px solid rgba(255,235,170,.9)', boxShadow: '0 0 26px rgba(245,180,0,.6)' }}>🔒</span>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 15, fontWeight: 800, letterSpacing: 3.5, color: '#ffd76b', textTransform: 'uppercase', textShadow: '0 0 12px rgba(245,180,0,.5)' }}>Locked</div>
              <div style={{ fontSize: 15.5, fontWeight: 700, color: '#eaf1ff', margin: '3px 0 7px' }}>
                Finish 2 Launch Sequence missions to open the Daily Challenge.
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {[0, 1].map((i) => (
                  <span key={i} style={{ width: 15, height: 15, borderRadius: '50%',
                    background: i < missionsDone ? '#57d98a' : 'rgba(255,255,255,.16)',
                    border: '2px solid ' + (i < missionsDone ? '#57d98a' : 'rgba(255,255,255,.45)'),
                    boxShadow: i < missionsDone ? '0 0 8px rgba(87,217,138,.7)' : 'none' }} />
                ))}
                <span style={{ fontSize: 13, fontWeight: 800, color: '#c9dbf4' }}>{missionsDone} of 2 missions done</span>
                <span style={{ fontSize: 12.5, fontWeight: 800, color: '#3d2c00', background: 'linear-gradient(120deg,#f5c542,#e89a00)', borderRadius: 999, padding: '4px 12px', marginLeft: 6 }}>
                  🪙 Worth 100 coins
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* glowing CTA */}
      <button disabled={busy || locked} onClick={locked ? undefined : onGo}
        style={{ position: 'relative', flexShrink: 0, whiteSpace: 'nowrap', color: locked ? '#8fa3c8' : '#fff', fontWeight: 800, fontSize: locked ? 15 : 19, borderRadius: 20, padding: locked ? '18px 24px' : '20px 32px',
          background: locked ? 'rgba(20,40,90,.6)' : 'linear-gradient(120deg,#1d3a8f,#2a4dab)', border: locked ? '2.5px solid #33507e' : '2.5px solid #55d7ff',
          boxShadow: locked ? 'none' : '0 0 26px rgba(85,215,255,.55), inset 0 0 18px rgba(85,215,255,.22)', cursor: locked ? 'default' : 'pointer' }}>
        {locked ? `🔒 Unlocks after 2 missions (${missionsDone}/2)` : dc?.done ? 'Review →' : dc?.started ? 'Keep going →' : 'Start Revising →'}
      </button>
    </div>
  )
}

/* ---- Share Wall right rail (mockup) ---- */
function relTime(d) {
  const days = Math.max(0, Math.floor((Date.now() - new Date(d + 'T12:00:00')) / 86400000))
  if (days === 0) return 'Today'
  if (days < 7) return `${days}d ago`
  return `${Math.floor(days / 7)}w ago`
}

function ShareWallRail({ state, me, onChange, onViewAll }) {
  const wall = (state.shareWall || []).slice(0, 3)
  async function kudo(id) { await api.kudos(id); onChange && onChange() }
  return (
    <div className="card" style={{ padding: 18, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', gap: 9, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20 }}>🌟</span>
        <div style={{ flex: 1 }}>
          <b style={{ fontSize: 16 }}>Share Wall</b>
          <div style={{ fontSize: 12.5, color: 'var(--muted)' }}>See what other students are writing!</div>
        </div>
        <button className="btn ghost" style={{ padding: '6px 13px', fontSize: 12.5 }} onClick={onViewAll}>View all →</button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, marginTop: 8 }}>
        {wall.map((e, i) => (
          <div key={e.id} style={{ padding: '13px 0', borderBottom: i < wall.length - 1 ? '1px solid var(--line)' : 'none' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span style={{ width: 34, height: 34, borderRadius: '50%', background: '#eef3f6', display: 'grid', placeItems: 'center', fontSize: 17 }}>{e.avatar}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 800, lineHeight: 1.15 }}>{e.studentName}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{e.genre}</div>
              </div>
            </div>
            <div style={{ fontSize: 14, fontWeight: 700, margin: '7px 0 6px', color: '#0d2f55' }}>{e.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button onClick={() => kudo(e.id)} title="Give kudos"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#d84a57', fontWeight: 800, fontSize: 13.5, padding: 0 }}>
                ❤️ {e.kudos}
              </button>
              <span style={{ fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>{relTime(e.sharedOn)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ---- Fluency game picker: the growing games library, by grade level ---- */
function GamePickerModal({ games, grade, onPlayBuiltin, onPlayed, onClose }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60 }} onClick={onClose}>
      <div className="card" style={{ width: 520, maxWidth: '94vw', padding: 24 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <span style={{ fontSize: 26 }}>🎯</span>
          <b style={{ fontSize: 18 }}>Fluency Games</b>
          <button onClick={onClose} style={{ marginLeft: 'auto', fontSize: 22, color: 'var(--muted)' }}>×</button>
        </div>
        <p style={{ fontSize: 13.5, color: 'var(--muted)', margin: '0 0 14px' }}>
          Quick games that build writing muscles. New games are added by grade level — you're in <b>Grade {grade}</b>.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 420, overflowY: 'auto', paddingRight: 4 }}>
          {games.map((g) => {
            const soon = g.kind === 'soon'
            return (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', gap: 12, border: '1px solid var(--line)', borderRadius: 12, padding: '11px 14px', opacity: soon ? .6 : 1 }}>
                <span style={{ width: 42, height: 42, borderRadius: 11, background: '#e8f5fb', display: 'grid', placeItems: 'center', fontSize: 22, flexShrink: 0 }}>{g.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 800, fontSize: 14.5 }}>{g.title}</div>
                  <div style={{ display: 'flex', gap: 7, alignItems: 'center', marginTop: 3 }}>
                    <span className="pill" style={{ fontSize: 10.5, padding: '2px 8px', background: '#e2f2f3', color: 'var(--scr)' }}>{g.skill}</span>
                    <span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--muted)' }}>Grades {g.grades}</span>
                  </div>
                </div>
                {soon ? (
                  <span style={{ fontSize: 11.5, fontWeight: 800, color: 'var(--muted)' }}>COMING SOON</span>
                ) : g.kind === 'external' ? (
                  <button className="btn" style={{ padding: '7px 16px', fontSize: 13 }} onClick={() => { window.open(g.url, '_blank', 'noopener'); onPlayed && onPlayed() }}>Play ↗</button>
                ) : (
                  <button className="btn" style={{ padding: '7px 16px', fontSize: 13 }} onClick={onPlayBuiltin}>Play ▶</button>
                )}
              </div>
            )
          })}
        </div>
        <p style={{ fontSize: 11.5, color: 'var(--muted)', margin: '12px 0 0', textAlign: 'center' }}>
          🎮 The library grows all year — games publish straight from the ClearK12 games repo.
        </p>
      </div>
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

export default function StudentHome({ state, me, onOpen, onLuna, onQuickWrite, onBank, onWall, onChange }) {
  const [homeTab, setHomeTab] = useState('home')
  const [busy, setBusy] = useState(false)
  const [game, setGame] = useState(false)
  const [fwChooser, setFwChooser] = useState(false)
  const [gamePicker, setGamePicker] = useState(false)

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
  const wp = state.writingPath

  // one-sentence orientation: point the student at today's priority
  const nudge = (() => {
    const day = DAY_NAMES[wp?.day ?? new Date().getDay()]
    const due = upNext?.a.dueDate != null ? daysTo(upNext.a.dueDate) : null
    const dueWord = due != null && due < 0 ? 'overdue' : due === 0 ? 'due today' : due === 1 ? 'due tomorrow' : null
    if (wp?.steps && !wp.completed) {
      const curIdx = wp.done.findIndex((d) => !d)
      const aIdx = wp.steps.indexOf('assignments')
      if (dueWord && aIdx >= 0 && !wp.done[aIdx]) return `"${upNext.a.title}" is ${dueWord} — it's mission ${aIdx + 1} on today's path. Let's knock it out. 💪`
      if (!wp.started) return `${day}'s path is ready — 3 quick missions, starting with ${STEP_META[wp.steps[0]].label}. 🚀`
      return `Mission ${curIdx + 1} is up: ${STEP_META[wp.steps[curIdx]].label}. Keep it rolling! ⚡`
    }
    if (wp?.steps && wp.completed) {
      if (dueWord) return `Path complete! Want to get ahead? "${upNext.a.title}" is ${dueWord}. 🌟`
      return `Today's path is done — Mission Control is all yours. 🎉`
    }
    return `No missions on ${day}s — write anything, play anything. 🏖️`
  })()
  const pathLocked = !!(wp && wp.steps && !wp.completed)
  const missionsDone = wp?.steps ? wp.done.filter(Boolean).length : 0
  const challengeLocked = !!(wp?.steps && missionsDone < 2)

  function launchStep(step) {
    if (step === 'assignments') { upNext ? begin(upNext) : setHomeTab('assignments') }
    else if (step === 'quickwrite') onQuickWrite()
    else if (step === 'luna') onLuna()
    else if (step === 'revision') peer()
    else if (step === 'freewrite') freeWrite()
    else if (step === 'games') setGamePicker(true)
    else if (step === 'goal_data') setHomeTab('data')
  }
  async function missionStart(i) {
    if (!wp?.steps) return
    const curIdx = wp.done.findIndex((d) => !d)
    if (i !== curIdx) return
    if (!wp.started) { try { await api.pathStart(); onChange && onChange() } catch {} }
    launchStep(wp.steps[i])
  }
  // Friday's Goals & Data step completes by visiting the Data & Goals tab
  useEffect(() => {
    if (homeTab !== 'data' || !wp || !wp.steps || wp.completed || !wp.started) return
    const idx = wp.done.findIndex((d) => !d)
    if (idx >= 0 && wp.steps[idx] === 'goal_data') {
      api.pathAdvance('goal_data').then(() => onChange && onChange()).catch(() => {})
    }
  }, [homeTab])
  function pickDemoDay(d) {
    api.pathDemoDay(d).then(() => onChange && onChange()).catch(() => {})
  }
  function gamePlayed() {
    api.pathGame().then((r) => {
      onChange && onChange()
      const pth = r.path
      if (pth?.steps) {
        const gi = pth.steps.indexOf('games')
        if (gi >= 0 && pth.done[gi]) { setGamePicker(false); setGame(false) }
      }
    }).catch(() => {})
  }
  // one-time celebration when today's path completes
  const celebrateKey = wp ? `pathCelebrated-${wp.date}-${wp.day ?? 'x'}` : null
  const [celebrate, setCelebrate] = useState(false)
  const [how, setHow] = useState(false)
  useEffect(() => {
    if (wp?.completed && wp.steps && celebrateKey && !localStorage.getItem(celebrateKey)) {
      localStorage.setItem(celebrateKey, '1')
      setCelebrate(true)
    }
  }, [wp?.completed])

  return (
    <div>
      {game && <FluencyGame onClose={() => setGame(false)} onFinished={gamePlayed} />}
      {gamePicker && (
        <GamePickerModal games={state.fluencyGames || []} grade={me.gradeLevel ?? 6} onPlayed={gamePlayed}
          onPlayBuiltin={() => { setGamePicker(false); setGame(true) }}
          onClose={() => setGamePicker(false)} />
      )}
      {fwChooser && (
        <FreeWriteModal stories={openStories} busy={busy} onBank={() => { setFwChooser(false); onBank && onBank() }}
          onPick={(id) => { setFwChooser(false); onOpen(id) }}
          onNew={() => launch('free')}
          onClose={() => setFwChooser(false)} />
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h1 className="page" style={{ margin: 0, fontSize: 21, lineHeight: 1.35, maxWidth: 720 }}>
          Hi Kayla! <span style={{ fontWeight: 700, color: '#28536e' }}>{nudge}</span>
        </h1>
        <div style={{ display: 'inline-flex', background: '#dcebf3', borderRadius: 12, padding: 4 }}>
          {[['home', '🏠 Home'], ['assignments', '📋 Assignments'], ['data', '📊 Data & Goals']].map(([k, label]) => (
            <button key={k} onClick={() => setHomeTab(k)}
              style={{ padding: '9px 18px', borderRadius: 9, fontSize: 13.5, fontWeight: 800,
                background: homeTab === k ? '#0d2f55' : 'transparent', color: homeTab === k ? '#fff' : 'var(--teal)' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ================= HOME ================= */}
      {homeTab === 'home' && (<>
      {celebrate && (
        <PathCelebration wp={wp} streak={gs?.streakDays ?? 0} onClose={() => setCelebrate(false)} />
      )}
      {how && <HowItWorksModal onClose={() => setHow(false)} />}

      {pathLocked ? (
        /* QUEST — the Launch Sequence */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1180, margin: '0 auto' }}>
          <WritingLaunchpad state={state} me={me} wp={wp} busy={busy} upNext={upNext} onMission={missionStart} onHow={() => setHow(true)}
            onQuickWrite={onQuickWrite} onFreeWrite={freeWrite} onGames={() => setGamePicker(true)} onBank={onBank} />
          <DailyBanner dc={dc} busy={busy} onGo={peer} locked={challengeLocked} missionsDone={missionsDone} />
        </div>
      ) : (
        /* UNLOCKED STUDIO — a different world: big open task cards */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 1180, margin: '0 auto' }}>
          <PathRibbon wp={wp} />
          <div className="home-split" style={{ gridTemplateColumns: '1fr 1fr', flex: 'none' }}>
            <BigTask icon="⚡" title="Quick Write" sub="A timed prompt to warm up your brain" grad={['#8b5cf6', '#6d3fd8']} busy={busy} onClick={onQuickWrite} />
            <BigTask icon="🕊️" title="Free Write" sub="Your page, your rules — write anything" grad={['#2f8ceb', '#1668c4']} busy={busy} onClick={freeWrite} />
            <BigTask icon="🎯" title="Fluency Games" sub="A whole arcade of writing games" grad={['#0b8a8f', '#067276']} onClick={() => setGamePicker(true)} />
            <BigTask icon="🗂️" title="Writing Bank" sub="Revise, publish & share your pieces" grad={['#e89a00', '#c97a00']} onClick={onBank} />
          </div>
          <LunaNook modules={state.modules} onLuna={onLuna} />
          <DailyBanner dc={dc} busy={busy} onGo={peer} locked={challengeLocked} missionsDone={missionsDone} />
        </div>
      )}

      <DemoWeekStrip wp={wp} onPick={pickDemoDay} />
      </>)}

      {/* ================= ASSIGNMENTS ================= */}
      {homeTab === 'assignments' && (<>
        <GoalBanner me={me} onData={() => setHomeTab('data')} />
        <div className="assign-grid">
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
