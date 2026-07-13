import React, { useEffect, useState, useCallback } from 'react'
import { api } from './lib/api.js'
import { TopBar, RoleSwitcher } from './components/Shell.jsx'
import { ShareWallTab } from './student/GrowthPage.jsx'
import StudentHome from './student/StudentHome.jsx'
import WritingStudio from './student/WritingStudio.jsx'
import RevisionStudio from './student/RevisionStudio.jsx'
import ArcadePage from './student/ArcadePage.jsx'
import LunaPage from './student/LunaPage.jsx'
import QuickWritePage from './student/QuickWritePage.jsx'
import WritingBankPage from './student/WritingBankPage.jsx'
import TeacherHome from './teacher/TeacherHome.jsx'
import Portfolio from './teacher/Portfolio.jsx'
import TraitTrends from './teacher/TraitTrends.jsx'
import ScrEcrModule from './teacher/ScrEcrModule.jsx'

const ME_STUDENT = 'stu_kscott'

export default function App() {
  const [state, setState] = useState(null)
  const [health, setHealth] = useState({ hasKey: false })
  const [role, setRole] = useState('student')
  const [view, setView] = useState('home')
  const [openSub, setOpenSub] = useState(null) // submission id for studio/portfolio

  const refresh = useCallback(async () => setState(await api.state()), [])
  useEffect(() => { refresh(); api.health().then(setHealth) }, [refresh])

  // Always refresh state before opening a submission — quick/free writes and
  // "Begin" create the submission server-side and it must be in state first.
  const openSubmission = useCallback(async (id) => { setState(await api.state()); setOpenSub(id) }, [])

  if (!state) return <div style={{ padding: 40, fontFamily: 'Manrope, sans-serif' }}>Loading the Writing Studio…</div>

  const me = state.students.find((s) => s.id === ME_STUDENT)
  const who = role === 'student'
    ? { name: me.name, sub: state.teacher.school, initials: me.initials }
    : { name: state.teacher.name, sub: state.teacher.school, initials: 'DN' }

  const goHome = () => { setView('home'); setOpenSub(null) }

  // prototype demo controls (floating switcher)
  async function skipPath() {
    const wp = state?.writingPath
    if (!wp?.steps || wp.completed) return
    if (!wp.started) await api.pathStart()
    for (let i = 0; i < wp.steps.length; i++) { if (!wp.done[i]) await api.pathAdvance(wp.steps[i]) }
    await refresh()
  }
  async function resetDemo() {
    Object.keys(localStorage).filter((k) => k.startsWith('pathCelebrated')).forEach((k) => localStorage.removeItem(k))
    await api.reset()
    goHome()
    await refresh()
  }

  let body
  if (role === 'student') {
    const sub = openSub ? state.submissions.find((s) => s.id === openSub) : null
    if (view === 'home' && sub) {
      body = sub.isPeerRevision
        ? <RevisionStudio state={state} sub={sub} health={health} onChange={refresh} onBack={goHome} />
        : <WritingStudio state={state} sub={sub} health={health} onChange={refresh} onBack={goHome} />
    } else if (view === 'home') {
      body = <StudentHome state={state} me={me} onOpen={openSubmission} onLuna={() => setView('luna')} onQuickWrite={() => setView('quickwrite')} onBank={() => setView('bank')} onWall={() => setView('wall')} onChange={refresh} />
    } else if (view === 'luna') {
      body = <LunaPage state={state} onBack={goHome} onChange={refresh} />
    } else if (view === 'quickwrite') {
      body = <QuickWritePage state={state} onBack={goHome} onChange={refresh} />
    } else if (view === 'wall') {
      body = (
        <div>
          <button className="backlink" onClick={goHome}>← Back to Dashboard</button>
          <ShareWallTab state={state} me={me} onChange={refresh} />
        </div>
      )
    } else if (view === 'bank') {
      body = <WritingBankPage state={state} me={me} onBack={goHome} onOpen={openSubmission} onWall={() => setView('wall')} onChange={refresh} />
    } else {
      body = <ArcadePage me={me} state={state} onBack={goHome} />
    }
  } else {
    const sub = openSub ? state.submissions.find((s) => s.id === openSub) : null
    if (view === 'home' && sub) {
      body = <Portfolio state={state} sub={sub} onBack={goHome} />
    } else if (view === 'home') {
      body = <TeacherHome state={state} onOpen={openSubmission} />
    } else if (view === 'trends') {
      body = <TraitTrends state={state} />
    } else {
      body = <ScrEcrModule />
    }
  }

  return (
    <div className="app">
      <TopBar
        role={role} view={view} who={who}
        setView={(v) => { setView(v); setOpenSub(null) }}
        onArcade={() => { setView('arcade'); setOpenSub(null) }}
        onLogo={goHome}
      />
      <div className="content">{body}</div>
      <RoleSwitcher role={role} setRole={(r) => { setRole(r); goHome() }} onSkipPath={skipPath} onResetDemo={resetDemo} />
    </div>
  )
}
