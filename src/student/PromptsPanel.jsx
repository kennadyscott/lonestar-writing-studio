import React, { useState } from 'react'

// Free Write idea bank — 30 fun story sparks. Display-only: the student still
// does all the writing; this just breaks the blank page.
const PROMPTS = [
  'Your pet suddenly starts talking — but only to complain.',
  'You find a backpack that packs itself with exactly what you will need tomorrow.',
  'The school vending machine starts giving out mysterious items instead of snacks.',
  'You wake up ten inches tall. Breakfast is now a mission.',
  'A dragon shows up at school and insists it is a new student.',
  'You get a text from your future self. It is a warning.',
  'The library book you opened starts reading YOU.',
  'Every time you sneeze, you swap places with someone in the room.',
  'Your shadow quit this morning. It left a note.',
  'You are elected mayor of your town for one week.',
  'The last slice of pizza holds a secret.',
  'Gravity turns off for exactly ten minutes.',
  'You find a door in your basement that was not there yesterday.',
  'Your grandma reveals she used to be a spy — and she needs your help one last time.',
  'All the teachers vanish at noon. The students must run the school.',
  'You inherit a llama farm. The llamas have strong opinions.',
  'Rain falls UP on Tuesdays now.',
  'You can suddenly hear what animals think — starting with the class hamster.',
  'Your video game character climbs out of the screen and asks for a snack.',
  'The new kid at school is definitely a robot. Probably.',
  'You find a remote control that can pause everyone but you.',
  'Your sandwich starts giving you life advice at lunch.',
  'The moon disappears for one night — and you saw who took it.',
  'You win a contest to live in a treehouse mansion for a year.',
  'You find socks that make you invisible — but only one of them works.',
  'The field trip bus takes a wrong turn into another century.',
  'Every lie you tell becomes true one hour later.',
  'A message in a bottle washes up with YOUR name on it.',
  'Your reflection waves at you first.',
  'The world’s grumpiest wizard moves in next door.',
]

export default function PromptsPanel() {
  const [idx, setIdx] = useState(null)
  const [spins, setSpins] = useState(0)

  function spin() {
    let next = Math.floor(Math.random() * PROMPTS.length)
    if (next === idx) next = (next + 1) % PROMPTS.length
    setIdx(next)
    setSpins((s) => s + 1)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--line)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 22 }}>🎲</div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 15 }}>Need an idea?</div>
          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Spin for a story spark — then write wherever it takes you.</div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16, textAlign: 'center' }}>
        {idx === null ? (
          <>
            <div style={{ fontSize: 52 }}>🎲</div>
            <p style={{ color: 'var(--muted)', fontSize: 14, maxWidth: 240, margin: 0 }}>
              {PROMPTS.length} fun story ideas are waiting. Spin one!
            </p>
            <button className="btn" style={{ padding: '11px 26px', fontSize: 15 }} onClick={spin}>🎲 Spin a prompt</button>
          </>
        ) : (
          <>
            <div key={spins} style={{ background: 'linear-gradient(140deg,#eaf6fd,#d8eefa)', border: '1.5px solid #bfe0f2', borderRadius: 16, padding: '22px 20px', width: '100%', position: 'relative' }}>
              <span style={{ position: 'absolute', top: 10, left: 14, color: '#8fcbe8', fontSize: 13 }}>✦</span>
              <span style={{ position: 'absolute', bottom: 12, right: 16, color: '#f5c542', fontSize: 12 }}>✦</span>
              <div style={{ fontSize: 12, fontWeight: 800, letterSpacing: .6, color: 'var(--link)', textTransform: 'uppercase', marginBottom: 8 }}>Story spark #{idx + 1}</div>
              <div style={{ fontSize: 16.5, fontWeight: 700, lineHeight: 1.5, color: '#0d2f55' }}>{PROMPTS[idx]}</div>
            </div>
            <button className="btn ghost" style={{ padding: '9px 22px' }} onClick={spin}>🎲 Another one!</button>
            <p style={{ fontSize: 12, color: 'var(--muted)', margin: 0, maxWidth: 250 }}>
              No rules — twist it, break it, or ignore it. Your page, your story.
            </p>
          </>
        )}
      </div>
    </div>
  )
}
