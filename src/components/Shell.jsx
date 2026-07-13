import React from 'react'
import { BRAND } from '../lib/brand.js'

const TEACHER_NAV = [
  { key: 'home', label: 'Class Overview' },
  { key: 'trends', label: 'Trait Trends' },
  { key: 'scr_ecr', label: 'SCR / ECR Module' },
]

export function TopBar({ role, view, setView, who, onArcade, onLogo }) {
  return (
    <header className="topbar">
      <button className="logo-chip" onClick={onLogo} title="Home">
        <img src={BRAND.logo} alt="LoneStar CR" />
      </button>

      {role === 'teacher' && (
        <nav className="topnav">
          {TEACHER_NAV.map((n) => (
            <button key={n.key} className={view === n.key ? 'on' : ''} onClick={() => setView(n.key)}>{n.label}</button>
          ))}
        </nav>
      )}

      <div style={{ flex: 1 }} />

      {role === 'student' && (
        <button className="cc-btn" onClick={onArcade} title="Switch to ClassCade">
          <img src={BRAND.classcade} alt="ClassCade" />
          <span className="split" />
          <span>
            <small>SWITCH TO</small>
            <b>ClassCade</b>
          </span>
        </button>
      )}

      <div className="who">
        <div className="av-init">{who.initials}</div>
        <div>
          <div className="nm">{who.name}</div>
          <div className="sub">{who.sub}</div>
        </div>
        <button className="pwr" title="Log out (demo)">⏻</button>
      </div>
    </header>
  )
}

export function RoleSwitcher({ role, setRole, onSkipPath, onResetDemo }) {
  return (
    <div className="rolepick">
      Viewing as
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="student">Student · Kayla Scott</option>
        <option value="teacher">Teacher · Dirk Nowitski</option>
      </select>
      {role === 'student' && onSkipPath && (
        <button onClick={onSkipPath} style={{ display: 'block', width: '100%', marginTop: 7, padding: '6px 8px', borderRadius: 8, background: '#fdf1dc', color: '#8a6400', fontSize: 11.5, fontWeight: 800 }}>
          ⚡ Demo: complete today's path
        </button>
      )}
      {onResetDemo && (
        <button onClick={onResetDemo} style={{ display: 'block', width: '100%', marginTop: 5, padding: '6px 8px', borderRadius: 8, background: '#eef3f6', color: 'var(--muted)', fontSize: 11.5, fontWeight: 800 }}>
          ↺ Reset demo data
        </button>
      )}
    </div>
  )
}

export function CoinChip({ n }) {
  return <span className="coin"><span className="disc" />{n.toLocaleString()}</span>
}
