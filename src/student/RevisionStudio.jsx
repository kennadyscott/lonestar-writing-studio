import React, { useState, useRef, useEffect } from 'react'
import { api } from '../lib/api.js'
import ConferencePanel from './ConferencePanel.jsx'

/*
 * Daily Revision Challenge — a two-part process:
 *   Part 1 (evaluate): judge the robot's draft against a grade-leveled rubric checklist.
 *   Part 2 (rewrite):  the original stays visible on top; the student revises in
 *                      their own box directly underneath, then submits for feedback.
 */

function Stepper({ phase }) {
  const steps = [
    { k: 'evaluate', n: 1, label: 'Judge it against the rubric' },
    { k: 'rewrite', n: 2, label: 'Rewrite it stronger' },
    { k: 'done', n: 3, label: 'Get feedback' },
  ]
  const idx = steps.findIndex((s) => s.k === phase)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '14px 0' }}>
      {steps.map((s, i) => (
        <React.Fragment key={s.k}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 26, height: 26, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 12.5, fontWeight: 800,
              background: i < idx ? 'var(--good)' : i === idx ? 'var(--navy)' : '#dfe9ef', color: i <= idx ? '#fff' : 'var(--muted)' }}>
              {i < idx ? '✓' : s.n}
            </span>
            <span style={{ fontSize: 13, fontWeight: i === idx ? 800 : 600, color: i === idx ? 'var(--ink)' : 'var(--muted)' }}>{s.label}</span>
          </div>
          {i < steps.length - 1 && <span style={{ flex: 'none', width: 34, height: 2, background: i < idx ? 'var(--good)' : '#dfe9ef', borderRadius: 2 }} />}
        </React.Fragment>
      ))}
    </div>
  )
}

function FeedbackModal({ result, onClose }) {
  if (!result) return null
  const top = (result.traits?.traits || []).filter((t) => t.level <= 2).slice(0, 2)
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60 }} onClick={onClose}>
      <div className="card" style={{ padding: 28, width: 480, maxWidth: '92vw' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 46 }}>🎉</div>
          <h2 style={{ margin: '4px 0 2px' }}>Revision submitted!</h2>
          <p style={{ color: 'var(--muted)', margin: '0 0 12px', fontSize: 14 }}>You just did what real writers do — judge, then improve.</p>
        </div>
        {result.traits?.headline && (
          <div style={{ background: '#eef6f9', borderRadius: 12, padding: '12px 14px', fontSize: 14, lineHeight: 1.45, marginBottom: 10 }}>
            <b>Coach's feedback:</b> {result.traits.headline}
          </div>
        )}
        {top.length > 0 && (
          <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 10 }}>
            {top.map((t) => <div key={t.key} style={{ marginTop: 4 }}>→ {t.next_step}</div>)}
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, margin: '12px 0' }}>
          {result.newMilestones.map((m) => (
            <div key={m.id} className="pill gold" style={{ justifyContent: 'space-between', fontSize: 13, padding: '8px 12px' }}>
              <span>🏅 {m.label}</span><span className="coin"><span className="disc" />+{m.coins}</span>
            </div>
          ))}
        </div>
        <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>Back to my dashboard</button>
      </div>
    </div>
  )
}

function ChecklistPanel({ asg, sub, phase, answers, setAnswers, fixed, setFixed, onStartRewrite, busy }) {
  const list = asg.checklist || []
  const allAnswered = list.every((_, i) => answers[i] === true || answers[i] === false)
  const evaluation = sub.evaluation || answers

  if (phase === 'evaluate') {
    return (
      <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10, height: '100%', overflowY: 'auto' }}>
        <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5 }}>
          Read {asg.teacher.name.split(' ')[0]}'s draft, then judge it: does it do each of these? <b>Be honest — this is the rubric a grader would use.</b>
        </div>
        {list.map((item, i) => (
          <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: '10px 12px' }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 8 }}>{item}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ v: true, label: '✓ Yes', on: '#e6f6ee', onC: 'var(--good)' }, { v: false, label: '✗ No', on: '#fdeeee', onC: '#d84a57' }].map((o) => (
                <button key={String(o.v)} onClick={() => setAnswers({ ...answers, [i]: o.v })}
                  style={{ flex: 1, padding: '7px 0', borderRadius: 9, fontWeight: 800, fontSize: 13,
                    border: answers[i] === o.v ? `2px solid ${o.onC}` : '1px solid var(--line)',
                    background: answers[i] === o.v ? o.on : '#fff', color: answers[i] === o.v ? o.onC : 'var(--muted)' }}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        <button className="btn" disabled={!allAnswered || busy} onClick={onStartRewrite} style={{ justifyContent: 'center', marginTop: 4 }}>
          {allAnswered ? 'Now rewrite it stronger →' : `Judge all ${list.length} to continue`}
        </button>
      </div>
    )
  }

  // rewrite phase: the checklist becomes the fix-list
  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 9, height: '100%', overflowY: 'auto' }}>
      <div style={{ fontSize: 13.5, color: 'var(--muted)', lineHeight: 1.5 }}>
        Your judgment of the original — <b style={{ color: '#d84a57' }}>fix the ✗ items</b> in your rewrite, and check them off as you go.
      </div>
      {list.map((item, i) => {
        const failed = evaluation[i] === false
        const done = !!fixed[i]
        return (
          <button key={i} onClick={() => setFixed({ ...fixed, [i]: !done })}
            style={{ display: 'flex', alignItems: 'flex-start', gap: 10, textAlign: 'left', padding: '10px 12px', borderRadius: 12,
              border: failed && !done ? '1.5px solid #f0b9be' : '1px solid var(--line)',
              background: done ? '#e6f6ee' : failed ? '#fff8f8' : '#fff' }}>
            <span style={{ width: 20, height: 20, borderRadius: 6, flexShrink: 0, display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 800,
              background: done ? 'var(--good)' : '#fff', border: done ? 'none' : '1.5px solid #c8d6de', color: '#fff' }}>{done ? '✓' : ''}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: done ? 'var(--good)' : 'var(--ink)', textDecoration: done ? 'line-through' : 'none' }}>
              {item}
              {failed && !done && <span style={{ display: 'block', fontSize: 11, color: '#d84a57', fontWeight: 800, marginTop: 2 }}>✗ The original missed this — fix it!</span>}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export default function RevisionStudio({ state, sub, health, onChange, onBack }) {
  const asg = state.assignments.find((a) => a.id === sub.assignmentId)
  const original = sub.drafts[0]
  const working = sub.drafts[sub.drafts.length - 1]
  const [phase, setPhase] = useState(sub.phase || 'evaluate')
  const [answers, setAnswers] = useState(() => (sub.evaluation ? Object.fromEntries(sub.evaluation.map((v, i) => [i, v])) : {}))
  const [fixed, setFixed] = useState({})
  const [content, setContent] = useState(working.content)
  const [tab, setTab] = useState('checklist')
  const [busy, setBusy] = useState(false)
  const [result, setResult] = useState(null)
  const timer = useRef(null)

  useEffect(() => { setPhase(sub.phase || 'evaluate') }, [sub.phase])

  function edit(v) {
    setContent(v)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => api.saveContent(working.id, v), 500)
  }

  async function startRewrite() {
    setBusy(true)
    try {
      const list = (asg.checklist || []).map((_, i) => answers[i] === true)
      await api.evaluate(sub.id, list)
      setPhase('rewrite')
      onChange && onChange()
    } finally { setBusy(false) }
  }

  async function submit() {
    setBusy(true)
    try {
      clearTimeout(timer.current)
      await api.saveContent(working.id, content)
      const r = await api.submitRevision(sub.id)
      setResult(r)
      onChange && onChange()
    } finally { setBusy(false) }
  }

  const changed = content.trim() !== original.content.trim()
  const wc = (content || '').split(/\s+/).filter(Boolean).length

  return (
    <div>
      <FeedbackModal result={result} onClose={() => { setResult(null); onBack && onBack() }} />
      {onBack && <button className="backlink" onClick={onBack}>← Back to My Writing</button>}

      {/* challenge banner */}
      <div className="card" style={{ padding: '14px 18px', marginBottom: 4, display: 'flex', gap: 14, alignItems: 'center' }}>
        <div style={{ fontSize: 30 }}>🤖</div>
        <div style={{ flex: 1 }}>
          <div className="eyebrow">Daily Revision Challenge · {asg.genre} · Grade {asg.gradeLevel} rubric</div>
          <div style={{ fontSize: 14, marginTop: 2 }}>{asg.prompt}</div>
        </div>
      </div>

      <Stepper phase={phase} />

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1.45fr) minmax(300px,1fr)', gap: 16, alignItems: 'stretch' }}>
        {/* ===== left: original + (in rewrite) the student's own box underneath ===== */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="card" style={{ overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f6f9fb' }}>
              <b style={{ fontSize: 14 }}>🤖 {asg.teacher.name}'s original draft</b>
              <span className="pill" style={{ background: '#eef3f6', color: 'var(--muted)' }}>read only</span>
            </div>
            <div style={{ padding: 16, fontSize: 15, lineHeight: 1.65, color: '#3a4149', whiteSpace: 'pre-wrap' }}>{original.content}</div>
          </div>

          {phase !== 'evaluate' && (
            <div className="card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--line)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f2fafd' }}>
                <b style={{ fontSize: 14 }}>✍️ Your revision</b>
                <span style={{ fontSize: 12, color: 'var(--muted)' }}>{wc} words · autosaves</span>
              </div>
              <textarea value={content} onChange={(e) => edit(e.target.value)} disabled={phase === 'done'}
                placeholder="Rewrite it here — make it the response the robot WISHES it wrote…"
                style={{ flex: 1, minHeight: 240, border: 'none', outline: 'none', resize: 'vertical', padding: 16, fontSize: 15.5, lineHeight: 1.65, fontFamily: 'Manrope, sans-serif', color: 'var(--ink)', background: '#fff' }} />
              <div style={{ borderTop: '1px solid var(--line)', padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: changed ? 'var(--good)' : 'var(--muted)', fontWeight: 600 }}>
                  {phase === 'done' ? '✓ Submitted' : changed ? '✓ You\'re changing it — keep going' : 'Start reshaping the original above'}
                </span>
                {phase !== 'done' && (
                  <button className="btn gold" disabled={busy || !changed} onClick={submit}>📬 Submit for feedback</button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== right: checklist first, conference second ===== */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', minHeight: 440 }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--line)' }}>
            {[{ k: 'checklist', label: '✅ Revision Checklist' }, { k: 'confer', label: '💬 Confer' }].map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)}
                style={{ flex: 1, padding: '12px', fontWeight: 800, fontSize: 13.5, background: tab === t.k ? '#fff' : '#f4f8fa',
                  color: tab === t.k ? 'var(--navy)' : 'var(--muted)', borderBottom: tab === t.k ? '2px solid var(--navy)' : '2px solid transparent' }}>
                {t.label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1, minHeight: 0 }}>
            {tab === 'checklist'
              ? <ChecklistPanel asg={asg} sub={sub} phase={phase} answers={answers} setAnswers={setAnswers} fixed={fixed} setFixed={setFixed} onStartRewrite={startRewrite} busy={busy} />
              : <ConferencePanel sub={sub} draft={working} readOnly={phase === 'done'} health={health} onChange={onChange} />}
          </div>
        </div>
      </div>
    </div>
  )
}
