import React from 'react'
import { BRAND } from '../lib/brand.js'
import ModuleBadge from '../components/ModuleBadge.jsx'

const STATUS = {
  completed: { label: 'COMPLETED', color: 'var(--good)', chipBg: '#e6f6ee' },
  in_progress: { label: 'IN PROGRESS', color: 'var(--link)', chipBg: '#e2f2fb' },
  not_started: { label: 'NOT STARTED', color: 'var(--muted)', chipBg: '#eef3f6' },
}

export default function LunaPage({ state, onBack }) {
  const modules = state.modules
  const done = modules.filter((m) => m.status === 'completed').length
  const current = modules.find((m) => m.status === 'in_progress')

  return (
    <div>
      {onBack && <button className="backlink" onClick={onBack}>← Back to Dashboard</button>}

      {/* hero */}
      <div className="card" style={{ padding: 0, overflow: 'hidden', marginBottom: 18, position: 'relative', background: 'linear-gradient(115deg,#0d2f55 0%,#02384d 70%,#01172d 100%)' }}>
        <div style={{ position: 'absolute', right: -10, top: -34, fontSize: 150, fontWeight: 800, color: 'rgba(255,255,255,.05)', pointerEvents: 'none', fontFamily: 'Manrope' }}>Luna</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 28px', color: '#fff' }}>
          <img src={BRAND.luna} alt="Luna" style={{ height: 84 }} />
          <div style={{ flex: 1 }}>
            <h1 style={{ margin: 0, fontSize: 24, fontWeight: 800 }}>Luna's Writing Nook</h1>
            <div style={{ fontSize: 14, opacity: .9, marginTop: 3 }}>Your writing path — six modules from short answers to polished pieces.</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, maxWidth: 420 }}>
              <div style={{ flex: 1, height: 9, background: 'rgba(255,255,255,.18)', borderRadius: 6 }}>
                <div style={{ height: '100%', width: `${(done / modules.length) * 100}%`, background: 'linear-gradient(90deg,var(--cyan-bright),var(--cyan))', borderRadius: 6 }} />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 800, whiteSpace: 'nowrap' }}>{done} of {modules.length} complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* up next */}
      {current && (
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px', marginBottom: 18, background: 'linear-gradient(120deg,#eef8fd,#fff)' }}>
          <ModuleBadge id={current.id} size={46} />
          <div style={{ flex: 1 }}>
            <div className="eyebrow">Up next for you</div>
            <b style={{ fontSize: 15 }}>{current.label}</b>
            <span style={{ fontSize: 13, color: 'var(--muted)' }}> · {Math.round(current.progress * 100)}% through</span>
          </div>
          <button className="btn">Continue →</button>
        </div>
      )}

      {/* module grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
        {modules.map((m, i) => {
          const st = STATUS[m.status]
          const locked = m.status === 'not_started'
          return (
            <div key={m.id} className="card" style={{ padding: '22px 18px 18px', textAlign: 'center', background: locked ? '#f4f7f9' : 'linear-gradient(180deg,#f2fafd,#ffffff)' }}>
              <ModuleBadge id={m.id} size={74} dim={locked} />
              <div style={{ fontWeight: 800, fontSize: 15.5, margin: '10px 0 2px', color: locked ? 'var(--muted)' : 'var(--ink)' }}>
                Module {i + 1}: {m.label}
              </div>
              <span className="pill" style={{ background: st.chipBg, color: st.color, marginTop: 6 }}>{locked ? '🔒 ' : ''}{st.label}</span>
              <div style={{ height: 8, background: '#e6eef3', borderRadius: 5, marginTop: 14 }}>
                <div style={{ height: '100%', width: `${m.progress * 100}%`, background: m.status === 'completed' ? 'var(--good)' : 'linear-gradient(90deg,var(--cyan-bright),var(--cyan))', borderRadius: 5 }} />
              </div>
              <div style={{ marginTop: 14 }}>
                {m.status === 'completed' && <button className="btn ghost" style={{ padding: '7px 18px' }}>Review ✓</button>}
                {m.status === 'in_progress' && <button className="btn" style={{ padding: '7px 18px' }}>Continue →</button>}
                {locked && <span style={{ fontSize: 12, color: 'var(--muted)', fontWeight: 700 }}>Finish Module {i} to unlock</span>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
