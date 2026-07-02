import React, { useState } from 'react'
import { api, TRAIT_LABELS, LEVEL_NAMES, LEVEL_COLORS } from '../lib/api.js'

const PRESET_GOALS = [
  { id: 'g_ideas', trait: 'ideas', icon: '💡', text: 'Back up my opinion with strong, specific reasons' },
  { id: 'g_org', trait: 'organization', icon: '🧭', text: 'Organize my writing with a clear beginning, middle, and end' },
  { id: 'g_word', trait: 'word_choice', icon: '🎨', text: 'Swap plain words for exact, vivid ones' },
  { id: 'g_voice', trait: 'voice', icon: '🎤', text: 'Let my voice come through and write to my reader' },
  { id: 'g_fluency', trait: 'sentence_fluency', icon: '🌊', text: 'Vary my sentences so my writing flows when read aloud' },
]

const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''

/* ---------- Monthly progress chart ---------- */
function MonthChart({ label, months, data, color }) {
  const vals = data.filter((v) => v != null)
  const cur = vals[vals.length - 1], first = vals[0]
  const delta = cur != null && first != null ? +(cur - first).toFixed(1) : 0
  return (
    <div style={{ flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <span style={{ fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: color }} /> {label}
        </span>
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>
          now <b style={{ color: 'var(--ink)' }}>{cur?.toFixed(1) ?? '—'}</b>/4
          {delta > 0 && <span style={{ color: 'var(--good)', fontWeight: 700 }}> ▲ +{delta}</span>}
        </span>
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'flex-end', height: 96, borderBottom: '1px solid var(--line)' }}>
        {months.map((m, i) => {
          const v = data[i]
          return (
            <div key={m} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', height: '100%' }} title={v != null ? `${m}: ${v}/4` : `${m}: no data`}>
              <div style={{ width: '78%', height: v != null ? `${(v / 4) * 100}%` : '2px', background: v != null ? color : '#e6e8ec', borderRadius: '4px 4px 0 0', transition: 'height .3s' }} />
            </div>
          )
        })}
      </div>
      <div style={{ display: 'flex', gap: 4 }}>
        {months.map((m) => <div key={m} style={{ flex: 1, textAlign: 'center', fontSize: 10, color: 'var(--muted)', marginTop: 3 }}>{m}</div>)}
      </div>
    </div>
  )
}

/* ---------- Trait snapshot ---------- */
function traitSnapshot(subs) {
  const drafts = subs.flatMap((s) => s.drafts).filter((d) => d.traits).sort((a, b) => (a.createdAt > b.createdAt ? 1 : -1))
  if (drafts.length === 0) return null
  const latest = drafts[drafts.length - 1].traits.traits
  const earliest = drafts[0].traits.traits
  const cur = {}, grow = {}
  latest.forEach((t) => (cur[t.key] = t.level))
  earliest.forEach((t) => (grow[t.key] = (cur[t.key] ?? t.level) - t.level))
  const keys = Object.keys(cur)
  const strongest = keys.reduce((a, b) => (cur[b] > cur[a] ? b : a))
  const growing = keys.reduce((a, b) => (grow[b] > grow[a] ? b : a))
  return { cur, grow, strongest, growing, keys }
}

export default function GrowthPage({ state, me, onChange }) {
  const subs = state.submissions.filter((s) => s.studentId === me.id)
  const mp = state.monthlyProgress
  const snap = traitSnapshot(subs)
  const [picking, setPicking] = useState(!me.goal)
  const [custom, setCustom] = useState('')
  const [toast, setToast] = useState(null)
  const [mpTab, setMpTab] = useState('scr')

  const traitDrafts = subs.flatMap((s) => s.drafts.map((d) => ({ d, s }))).filter((x) => x.d.traits).sort((a, b) => (a.d.createdAt > b.d.createdAt ? 1 : -1))
  const latest = traitDrafts[traitDrafts.length - 1]
  const nextStep = latest ? { headline: latest.d.traits.headline, title: state.assignments.find((a) => a.id === latest.s.assignmentId)?.title } : null
  const shareWall = state.shareWall || []
  const sharedSubIds = new Set(shareWall.map((e) => e.submissionId).filter(Boolean))
  const shareable = subs.filter((s) => s.completedAt && !sharedSubIds.has(s.id))

  async function choose(g) { await api.setGoal(g); setPicking(false); onChange && onChange() }
  async function setCustomGoal() { if (!custom.trim()) return; await api.setGoal({ text: custom.trim(), trait: null }); setCustom(''); setPicking(false); onChange && onChange() }
  async function achieve() { const r = await api.achieveGoal(); setToast(r.coins); onChange && onChange() }
  async function share(subId) { await api.share(subId); onChange && onChange() }
  async function kudo(id) { await api.kudos(id); onChange && onChange() }

  const revisions = subs.reduce((a, s) => a + Math.max(0, s.drafts.length - 1), 0)
  const finished = subs.filter((s) => s.completedAt).length
  const growthCoins = state.coinEvents.filter((e) => e.studentId === me.id).reduce((a, e) => a + e.coins, 0)

  return (
    <div>
      {toast != null && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.45)', display: 'grid', placeItems: 'center', zIndex: 50 }} onClick={() => setToast(null)}>
          <div className="card" style={{ padding: 28, width: 380, textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 46 }}>🏆</div>
            <h2 style={{ margin: '6px 0' }}>Goal reached!</h2>
            <p style={{ color: 'var(--muted)', margin: '0 0 6px' }}>Amazing work sticking with it. You earned</p>
            <div className="coin" style={{ fontSize: 22, justifyContent: 'center' }}><span className="disc" style={{ width: 20, height: 20 }} />+{toast}</div>
            <button className="btn" style={{ marginTop: 14 }} onClick={() => setToast(null)}>Pick my next goal</button>
          </div>
        </div>
      )}

      <div className="eyebrow">The Writing Studio</div>
      <h1 className="page">My Growth 🌱</h1>
      <p className="page-sub">Set a goal, watch your averages climb, and celebrate how far you've come.</p>

      {/* ===== NEXT-STEP NUDGE + TEACHER SHOUT-OUT ===== */}
      {(nextStep || me.shoutOut) && (
        <div style={{ display: 'grid', gridTemplateColumns: nextStep && me.shoutOut ? '1fr 1fr' : '1fr', gap: 16, marginBottom: 18 }}>
          {nextStep && (
            <div className="card" style={{ padding: 18, background: 'linear-gradient(120deg,#fff6e8,#fff)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ fontSize: 26 }}>💡</div>
              <div>
                <div className="eyebrow" style={{ color: '#a37400' }}>Your coach's next step</div>
                <div style={{ fontSize: 15, fontWeight: 600, marginTop: 3, lineHeight: 1.4 }}>{nextStep.headline}</div>
                {nextStep.title && <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>From "{nextStep.title}"</div>}
              </div>
            </div>
          )}
          {me.shoutOut && (
            <div className="card" style={{ padding: 18, background: 'linear-gradient(120deg,#eef6f2,#fff)', display: 'flex', gap: 14, alignItems: 'flex-start' }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#d7ead9', display: 'grid', placeItems: 'center', fontSize: 13, fontWeight: 800, color: 'var(--good)', flexShrink: 0 }}>{me.shoutOut.initials}</div>
              <div>
                <div className="eyebrow" style={{ color: 'var(--good)' }}>Shout-out from {me.shoutOut.from} 📣</div>
                <div style={{ fontSize: 14, fontWeight: 500, marginTop: 3, lineHeight: 1.45, fontStyle: 'italic' }}>"{me.shoutOut.text}"</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ===== FOCUS GOAL ===== */}
      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <b style={{ fontSize: 17 }}>🎯 My Focus Goal</b>
          {me.goal && !picking && <button className="btn ghost" style={{ padding: '6px 14px' }} onClick={() => setPicking(true)}>Change goal</button>}
        </div>

        {me.goal && !picking ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, background: 'linear-gradient(120deg,#eef6f9,#fff)', border: '1px solid var(--line)', borderRadius: 12, padding: 18, marginTop: 10 }}>
            <div style={{ fontSize: 34 }}>{PRESET_GOALS.find((g) => g.id === me.goal.id)?.icon || '✍️'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 17, fontWeight: 700 }}>{me.goal.text}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>
                {me.goal.trait ? `Trait: ${TRAIT_LABELS[me.goal.trait]} · ` : ''}Set {fmtDate(me.goal.setOn)} · your coach will keep this in mind when you confer
              </div>
            </div>
            <button className="btn gold" onClick={achieve}>🎉 I reached this goal!</button>
          </div>
        ) : (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 12 }}>Pick one thing to focus on next. You can change it anytime.</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {PRESET_GOALS.map((g) => {
                const on = me.goal?.id === g.id
                return (
                  <button key={g.id} onClick={() => choose(g)}
                    style={{ display: 'flex', gap: 12, alignItems: 'center', textAlign: 'left', padding: '12px 14px', borderRadius: 12,
                      border: on ? '2px solid var(--navy-1)' : '1px solid var(--line)', background: on ? '#eef4f7' : '#fff', cursor: 'pointer' }}>
                    <span style={{ fontSize: 24 }}>{g.icon}</span>
                    <span>
                      <span style={{ display: 'block', fontWeight: 600, fontSize: 14 }}>{g.text}</span>
                      <span style={{ display: 'block', fontSize: 11, color: 'var(--cc-blue)', fontWeight: 700, marginTop: 2 }}>{TRAIT_LABELS[g.trait]}</span>
                    </span>
                  </button>
                )
              })}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '12px 14px', borderRadius: 12, border: '1px dashed var(--line)', gridColumn: '1 / -1' }}>
                <span style={{ fontSize: 22 }}>✏️</span>
                <input value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="Or write your own goal…"
                  onKeyDown={(e) => e.key === 'Enter' && setCustomGoal()}
                  style={{ flex: 1, padding: '9px 12px', borderRadius: 9, border: '1px solid var(--line)', fontFamily: 'inherit', fontSize: 14 }} />
                <button className="btn" disabled={!custom.trim()} onClick={setCustomGoal}>Set goal</button>
              </div>
            </div>
          </div>
        )}

        {me.goalHistory?.length > 0 && (
          <div style={{ marginTop: 16, borderTop: '1px solid var(--line)', paddingTop: 12 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--muted)' }}>🏆 Goals you've conquered</span>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
              {me.goalHistory.map((g, i) => (
                <span key={i} className="pill green" style={{ padding: '6px 12px' }}>✓ {g.text} <span style={{ opacity: .7, marginLeft: 4 }}>{fmtDate(g.achievedOn)}</span></span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ===== MONTHLY PROGRESS ===== */}
      <div className="card" style={{ padding: 22, marginBottom: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
          <b style={{ fontSize: 17 }}>📈 Monthly Progress</b>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>{mp.year} school year · average writing score (out of 4)</span>
        </div>
        <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 14px' }}>Toggle between short answers (SCR) and extended essays (ECR) to see each kind of growth.</p>
        <div style={{ display: 'inline-flex', background: '#eef1f4', borderRadius: 10, padding: 3, marginBottom: 18 }}>
          {[{ k: 'scr', label: 'SCR — Short Response' }, { k: 'ecr', label: 'ECR — Extended Response' }].map((t) => (
            <button key={t.k} onClick={() => setMpTab(t.k)}
              style={{ padding: '7px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                background: mpTab === t.k ? '#fff' : 'transparent', color: mpTab === t.k ? 'var(--navy-1)' : 'var(--muted)',
                boxShadow: mpTab === t.k ? 'var(--shadow)' : 'none' }}>{t.label}</button>
          ))}
        </div>
        {mpTab === 'scr'
          ? <MonthChart label="SCR — Short Response" months={mp.months} data={mp.scr} color="#0b8a8f" />
          : <MonthChart label="ECR — Extended Response" months={mp.months} data={mp.ecr} color="#375f9f" />}
      </div>

      {/* ===== TRAIT SNAPSHOT + HABITS ===== */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 18, marginBottom: 18 }}>
        <div className="card" style={{ padding: 22 }}>
          <b style={{ fontSize: 17 }}>✨ My Traits Right Now</b>
          {!snap ? <p style={{ color: 'var(--muted)' }}>Get trait feedback on a draft to see this.</p> : (
            <>
              <div style={{ display: 'flex', gap: 10, margin: '12px 0 16px', flexWrap: 'wrap' }}>
                <span className="pill" style={{ background: '#e6f6ee', color: 'var(--good)', padding: '7px 12px' }}>💪 Superpower: {TRAIT_LABELS[snap.strongest]}</span>
                {snap.grow[snap.growing] > 0 && <span className="pill blue" style={{ padding: '7px 12px' }}>🚀 Growing most: {TRAIT_LABELS[snap.growing]} (+{snap.grow[snap.growing]})</span>}
              </div>
              {snap.keys.map((k) => (
                <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ width: 130, fontSize: 13 }}>{TRAIT_LABELS[k]}</span>
                  <div style={{ flex: 1, height: 10, background: '#eef0f2', borderRadius: 5 }}>
                    <div style={{ height: '100%', width: `${(snap.cur[k] / 4) * 100}%`, background: LEVEL_COLORS[snap.cur[k]], borderRadius: 5 }} />
                  </div>
                  <span style={{ width: 78, fontSize: 11, fontWeight: 700, color: LEVEL_COLORS[snap.cur[k]] }}>{LEVEL_NAMES[snap.cur[k]]}</span>
                </div>
              ))}
            </>
          )}
        </div>

        <div className="card" style={{ padding: 22 }}>
          <b style={{ fontSize: 17 }}>🔥 My Writing Habits</b>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 14 }}>
            {[
              { k: 'Revisions made', v: revisions, sub: 'Every revision makes you stronger' },
              { k: 'Pieces finished', v: finished, sub: 'Start to polished' },
              { k: 'Coins from growing', v: growthCoins.toLocaleString(), sub: 'Earned by how you write' },
            ].map((s) => (
              <div key={s.k} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#f6f8f9', borderRadius: 12, padding: '12px 14px' }}>
                <div style={{ fontSize: 24, fontWeight: 800, minWidth: 44 }}>{s.v}</div>
                <div><div style={{ fontSize: 13, fontWeight: 600 }}>{s.k}</div><div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.sub}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===== GROWTH STORY ===== */}
      {subs.filter((s) => s.drafts.filter((d) => d.traits).length > 1).map((sub) => {
        const asg = state.assignments.find((a) => a.id === sub.assignmentId)
        const withTraits = sub.drafts.filter((d) => d.traits)
        const first = withTraits[0], last = withTraits[withTraits.length - 1]
        return (
          <div key={sub.id} className="card" style={{ padding: 22 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
              <b style={{ fontSize: 17 }}>📖 Growth Story — "{asg.title}"</b>
              <span style={{ fontSize: 12, color: 'var(--muted)' }}>Draft {first.n} → Draft {last.n}</span>
            </div>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '2px 0 14px' }}>Look what revising did — same writer, {withTraits.length} drafts apart.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[{ d: first, tag: 'First draft', bg: '#f6f8f9' }, { d: last, tag: 'Latest draft', bg: '#eef6f2' }].map((c) => (
                <div key={c.tag} style={{ background: c.bg, borderRadius: 12, padding: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: .5 }}>{c.tag}</div>
                  <div style={{ fontSize: 13, lineHeight: 1.5, marginTop: 6, maxHeight: 90, overflow: 'hidden', color: '#3a4149' }}>
                    {c.d.content.slice(0, 180)}{c.d.content.length > 180 ? '…' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {/* ===== SHARE WALL ===== */}
      <div className="card" style={{ padding: 22, marginTop: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <b style={{ fontSize: 17 }}>🌟 Share Wall</b>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Finished pieces the class is proud of</span>
        </div>

        {shareable.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'linear-gradient(120deg,#eef4ff,#fff)', border: '1px solid var(--line)', borderRadius: 12, padding: '12px 16px', margin: '14px 0' }}>
            <span style={{ fontSize: 22 }}>🎉</span>
            <div style={{ flex: 1 }}>
              <b style={{ fontSize: 14 }}>You finished "{state.assignments.find((a) => a.id === shareable[0].assignmentId)?.title}"!</b>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>Proud of it? Share it with the class.</div>
            </div>
            <button className="btn" onClick={() => share(shareable[0].id)}>Share to wall →</button>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 14 }}>
          {shareWall.map((e) => (
            <div key={e.id} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14, display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ width: 30, height: 30, borderRadius: '50%', background: '#eef3f6', display: 'grid', placeItems: 'center', fontSize: 16 }}>{e.avatar}</span>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.1 }}>{e.studentName}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{e.genre}</div>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{e.title}</div>
              <div style={{ fontSize: 12, color: '#3a4149', lineHeight: 1.5, marginTop: 4, flex: 1 }}>{e.excerpt}{e.excerpt.length >= 180 ? '…' : ''}</div>
              <button onClick={() => kudo(e.id)} title="Give kudos"
                style={{ marginTop: 10, alignSelf: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff0f1', color: '#d84a57', border: '1px solid #f6d6d9', borderRadius: 999, padding: '5px 12px', fontSize: 13, fontWeight: 700 }}>
                ❤️ {e.kudos}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
