import React from 'react'

function avgLevel(sub) {
  const latest = [...sub.drafts].reverse().find((d) => d.traits)
  if (!latest) return null
  return latest.traits.traits.reduce((a, t) => a + t.level, 0) / latest.traits.traits.length
}

// Build a "Writer's Reel" style activity feed from real submission data.
function buildReel(state) {
  const items = []
  const nameOf = (id) => state.students.find((s) => s.id === id)?.name || 'A writer'
  const avOf = (id) => state.students.find((s) => s.id === id)?.avatar || '🧑'
  for (const sub of state.submissions) {
    const asg = state.assignments.find((a) => a.id === sub.assignmentId)
    for (const m of sub.milestones) {
      const kind = m.type === 'held_the_pen' ? 'integrity' : m.type === 'trait_growth' ? 'growth' : 'revision'
      items.push({ ts: m.ts, subId: sub.id, studentId: sub.studentId,
        icon: avOf(sub.studentId), tag: kind,
        text: `${nameOf(sub.studentId)} — ${m.label}`, sub: `${asg.title} · +${m.coins} coins` })
    }
    const conf = sub.drafts.filter((d) => d.conference.length).slice(-1)[0]
    if (conf) items.push({ ts: conf.conference[conf.conference.length - 1].ts || '', subId: sub.id, studentId: sub.studentId,
      icon: avOf(sub.studentId), tag: 'confer', text: `${nameOf(sub.studentId)} conferred on Draft ${conf.n}`, sub: `${asg.title} · ${conf.conference.length} turns` })
  }
  return items.sort((a, b) => (b.ts > a.ts ? 1 : -1)).slice(0, 6)
}

const TAG_STYLE = {
  revision: { bg: '#0b8a8f', label: 'Revised' },
  growth: { bg: '#5b4aa0', label: 'Grew on rubric' },
  integrity: { bg: '#2e9e6b', label: 'Kept the pen' },
  confer: { bg: '#375f9f', label: 'Conferred' },
}

function StatTile({ k, v, icon, grad }) {
  return (
    <div className="stat-tile" style={{ background: grad, position: 'relative', overflow: 'hidden' }}>
      <div className="k">{k}</div>
      <div className="v">{v}</div>
      <div style={{ position: 'absolute', right: 16, top: 18, fontSize: 34, opacity: .5 }}>{icon}</div>
    </div>
  )
}

export default function TeacherHome({ state, onOpen }) {
  const subByStudent = {}
  state.submissions.forEach((s) => (subByStudent[s.studentId] = s))
  const asg = state.assignments[0]
  const words = state.submissions.reduce((a, s) => a + s.drafts.reduce((b, d) => b + (d.content || '').split(/\s+/).filter(Boolean).length, 0), 0)
  const revisions = state.submissions.reduce((a, s) => a + Math.max(0, s.drafts.length - 1), 0)
  const heldPen = state.submissions.filter((s) => s.drafts.some((d) => d.conference.some((m) => m.redirect))).length
  const reel = buildReel(state)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 360px', gap: 18, alignItems: 'start' }}>
      {/* ===== main column ===== */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* hero row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 16 }}>
          <div className="card" style={{ padding: 20, background: 'linear-gradient(120deg,#eef6f9,#ffffff)' }}>
            <div className="eyebrow">The Writing Studio</div>
            <h2 style={{ fontSize: 19, margin: '4px 0 8px' }}>From grading papers to developing writers</h2>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
              Every student now drafts, confers with an AI coach that only asks questions, and revises. You see the whole
              process — not just a score. SCR/ECR is now one module inside it.
            </p>
            <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
              <span className="pill blue">{asg.genre} · Grade {asg.gradeLevel}</span>
              <span className="pill" style={{ background: '#eef1f4', color: '#556' }}>{asg.title}</span>
            </div>
          </div>

          <div className="card" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 20 }}>🖊️</span><b style={{ fontSize: 15 }}>Integrity spotlight</b>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 14, margin: '0 0 10px', lineHeight: 1.5 }}>
              {heldPen > 0
                ? `${heldPen} writer kept the pen this week — the coach was asked to "just write it," and redirected them to do their own thinking.`
                : 'When a student asks the coach to write for them, it redirects — and you see it here.'}
            </p>
            <span className="pill green">✓ Students do the cognitive work — always</span>
          </div>
        </div>

        {/* stat tiles */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          <StatTile k="Words Written" v={words.toLocaleString()} icon="✍️" grad="linear-gradient(140deg,#0b3a49,#0f5a72)" />
          <StatTile k="Revisions Made" v={revisions} icon="🔁" grad="linear-gradient(140deg,#0b3a49,#0f5a72)" />
          <StatTile k="Kept-the-Pen" v={heldPen} icon="🖊️" grad="linear-gradient(140deg,#0b493a,#0f724f)" />
        </div>

        {/* writer's reel */}
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{ fontSize: 22 }}>🧑‍💻</span>
            <b style={{ fontSize: 17 }}>Writer's Reel — Recent Activity</b>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {reel.length === 0 && <div style={{ color: 'var(--muted)' }}>No activity yet — assign a piece to get writers going.</div>}
            {reel.map((it, i) => {
              const ts = TAG_STYLE[it.tag]
              return (
                <div key={i} onClick={() => subByStudent[it.studentId] && onOpen(it.subId)}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 12, cursor: 'pointer' }}>
                  <div style={{ width: 38, height: 38, borderRadius: 10, background: '#f0f4f6', display: 'grid', placeItems: 'center', fontSize: 20 }}>{it.icon}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{it.text}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{it.sub}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', background: ts.bg, padding: '4px 10px', borderRadius: 999 }}>{ts.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ===== ClassCade rail ===== */}
      <ClassCadeRail state={state} subByStudent={subByStudent} onOpen={onOpen} />
    </div>
  )
}

function ClassCadeRail({ state, subByStudent, onOpen }) {
  return (
    <div className="card" style={{ overflow: 'hidden', padding: 0 }}>
      <div style={{ background: 'linear-gradient(120deg,#2f4f8f,#3f66a8)', color: '#fff', padding: '16px 18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 800, letterSpacing: -.3, fontSize: 18 }}>Class<span style={{ color: 'var(--gold)' }}>Cade</span></span>
          <span style={{ fontSize: 18 }}>🤖</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
          <b style={{ fontSize: 18 }}>Quick Rewards</b>
          <select style={{ borderRadius: 8, border: 'none', padding: '5px 8px', fontFamily: 'inherit', fontSize: 12 }}><option>All Classes</option></select>
        </div>
      </div>
      <div style={{ padding: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, maxHeight: 560, overflowY: 'auto' }}>
        {state.students.map((stu) => {
          const has = !!subByStudent[stu.id]
          return (
            <div key={stu.id} onClick={() => has && onOpen(subByStudent[stu.id].id)}
              style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 10, position: 'relative', cursor: has ? 'pointer' : 'default', background: has ? '#fbfdff' : '#fff' }}>
              <span style={{ position: 'absolute', top: 8, right: 8, fontSize: 11, fontWeight: 700, color: '#a37400', background: '#fff4d6', borderRadius: 999, padding: '2px 7px', display: 'inline-flex', gap: 3, alignItems: 'center' }}>
                <span className="disc" style={{ width: 11, height: 11 }} />+{stu.coins.toLocaleString()}
              </span>
              <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eef3f6', display: 'grid', placeItems: 'center', fontSize: 18, marginBottom: 6 }}>{stu.avatar}</div>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1 }}>{stu.name}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Gifted Coins: {stu.coins.toLocaleString()}</div>
              {has && <div style={{ fontSize: 10, color: 'var(--cc-blue)', fontWeight: 700, marginTop: 4 }}>Open portfolio →</div>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
