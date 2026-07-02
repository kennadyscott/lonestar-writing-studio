import React from 'react'

export function Logo() {
  return (
    <div className="logo">
      <span className="lone">LoneStar</span>
      <span className="cr">CR</span>
    </div>
  )
}

const STUDENT_NAV = [
  { key: 'home', label: 'My Writing', icon: '✍️' },
  { key: 'growth', label: 'My Growth', icon: '📈' },
]
const TEACHER_NAV = [
  { key: 'home', label: 'Class Overview', icon: '🏫' },
  { key: 'trends', label: 'Trait Trends', icon: '📊' },
  { key: 'scr_ecr', label: 'SCR / ECR Module', icon: '📝' },
]

export function Sidebar({ role, setRole, view, setView }) {
  const nav = role === 'student' ? STUDENT_NAV : TEACHER_NAV
  return (
    <aside className="sidebar">
      <Logo />
      <div className="nav">
        <div className="grp">The Writing Studio</div>
        {nav.map((n) => (
          <a key={n.key} className={view === n.key ? 'on' : ''} href="#"
             onClick={(e) => { e.preventDefault(); setView(n.key) }}>
            <span>{n.icon}</span>{n.label}
          </a>
        ))}
      </div>
      <div className="spacer" />
      <div className="rolepick">
        Viewing as
        <select value={role} onChange={(e) => { setRole(e.target.value); setView('home') }}>
          <option value="student">Student · Kayla Scott</option>
          <option value="teacher">Teacher · Dirk Nowitski</option>
        </select>
      </div>
    </aside>
  )
}

export function TopBar({ crumb, who, action }) {
  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: 18 }}>☰</div>
        <div className="crumb">{crumb}</div>
      </div>
      <div className="who">
        {action}
        <div style={{ position: 'relative', marginRight: 6 }}>
          <span style={{ fontSize: 20, color: 'var(--muted)' }}>🔔</span>
          <span style={{ position: 'absolute', top: -4, right: -4, background: '#e5484d', color: '#fff', fontSize: 10, fontWeight: 700, borderRadius: 999, padding: '0 5px' }}>1</span>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="nm">{who.name}</div>
          <div className="sub">{who.sub}</div>
        </div>
        <div className="av">{who.av}</div>
      </div>
    </div>
  )
}

export function ClassCadeButton({ coins, onClick }) {
  return (
    <button onClick={onClick} title="Switch to ClassCade"
      style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid var(--line)', borderRadius: 12, padding: '7px 14px', marginRight: 8, boxShadow: 'var(--shadow)' }}>
      <span style={{ fontWeight: 800, fontSize: 15, letterSpacing: -.3 }}>Class<span style={{ color: 'var(--cc-blue)' }}>Cade</span> 🤖</span>
      <span style={{ width: 1, height: 22, background: 'var(--line)' }} />
      <span style={{ textAlign: 'left', lineHeight: 1 }}>
        <span style={{ fontSize: 9, color: 'var(--muted)', fontWeight: 700, letterSpacing: .5, display: 'block' }}>SWITCH TO</span>
        <span className="coin" style={{ fontSize: 13 }}><span className="disc" />{coins.toLocaleString()}</span>
      </span>
    </button>
  )
}

export function CoinChip({ n }) {
  return <span className="coin"><span className="disc" />{n.toLocaleString()}</span>
}
