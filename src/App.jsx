import React, { useEffect, useState, useCallback } from 'react'
import { api } from './lib/api.js'
import { Sidebar, TopBar, ClassCadeButton } from './components/Shell.jsx'
import StudentHome from './student/StudentHome.jsx'
import WritingStudio from './student/WritingStudio.jsx'
import GrowthPage from './student/GrowthPage.jsx'
import ArcadePage from './student/ArcadePage.jsx'
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

  if (!state) return <div style={{ padding: 40, fontFamily: 'Inter' }}>Loading the Writing Studio…</div>

  const me = state.students.find((s) => s.id === ME_STUDENT)
  const who = role === 'student'
    ? { name: me.name, sub: 'Grade 6 Writer', av: me.avatar }
    : { name: state.teacher.name, sub: state.teacher.school, av: 'N' }

  let crumb, body
  if (role === 'student') {
    const sub = openSub ? state.submissions.find((s) => s.id === openSub) : null
    if (view === 'home' && sub) {
      crumb = <span><a href="#" onClick={(e)=>{e.preventDefault();setOpenSub(null)}}>My Writing</a> › <b>{state.assignments.find(a=>a.id===sub.assignmentId).title}</b></span>
      body = <WritingStudio state={state} sub={sub} health={health} onChange={refresh} onBack={() => setOpenSub(null)} />
    } else if (view === 'home') {
      crumb = <b>My Writing</b>
      body = <StudentHome state={state} me={me} onOpen={openSubmission} />
    } else if (view === 'growth') {
      crumb = <b>My Growth</b>; body = <GrowthPage state={state} me={me} onChange={refresh} />
    } else {
      crumb = <b>ClassCade Arcade</b>; body = <ArcadePage me={me} state={state} />
    }
  } else {
    const sub = openSub ? state.submissions.find((s) => s.id === openSub) : null
    if (view === 'home' && sub) {
      crumb = <span><a href="#" onClick={(e)=>{e.preventDefault();setOpenSub(null)}}>Class Overview</a> › <b>{state.students.find(s=>s.id===sub.studentId).name}</b></span>
      body = <Portfolio state={state} sub={sub} onBack={() => setOpenSub(null)} />
    } else if (view === 'home') {
      crumb = <b>Class Overview</b>; body = <TeacherHome state={state} onOpen={openSubmission} />
    } else if (view === 'trends') {
      crumb = <b>Trait Trends</b>; body = <TraitTrends state={state} />
    } else {
      crumb = <b>SCR / ECR Module</b>; body = <ScrEcrModule />
    }
  }

  const action = role === 'student'
    ? <ClassCadeButton coins={me.coins} onClick={() => { setView('arcade'); setOpenSub(null) }} />
    : null

  return (
    <div className="app">
      <Sidebar role={role} setRole={setRole} view={view} setView={(v) => { setView(v); setOpenSub(null) }} />
      <div className="main">
        <TopBar crumb={crumb} who={who} action={action} />
        <div className="content">{body}</div>
      </div>
    </div>
  )
}
