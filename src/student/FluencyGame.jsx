import React, { useState } from 'react'

// "Sentence Stretch" — a quick, low-stakes fluency game. Take a bare sentence and
// stretch it with detail. Builds sentence fluency + word choice without a grade.
const ROUNDS = [
  { base: 'The dog ran.', ask: 'Where? How? Add details to make us SEE it.' },
  { base: 'She was happy.', ask: 'Show it instead of telling it — what did she do?' },
  { base: 'It was cold.', ask: 'Make us feel the cold. Add sights, sounds, or feelings.' },
  { base: 'The team won.', ask: 'How did they win? What did it feel like?' },
]

export default function FluencyGame({ onClose }) {
  const [round, setRound] = useState(0)
  const [text, setText] = useState('')
  const [done, setDone] = useState([])
  const r = ROUNDS[round]
  const base = r.base.replace(/\.$/, '')
  const extra = text.trim().split(/\s+/).filter(Boolean).length
  const strong = extra >= 6

  function next() {
    setDone((d) => [...d, { base: r.base, stretched: text.trim(), words: extra }])
    setText('')
    if (round + 1 < ROUNDS.length) setRound(round + 1)
    else setRound(-1) // finished
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(10,20,30,.5)', display: 'grid', placeItems: 'center', zIndex: 60 }} onClick={onClose}>
      <div className="card" style={{ width: 560, maxWidth: '92vw', padding: 26 }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <div><span className="eyebrow">Fluency Game</span><h2 style={{ margin: '2px 0', fontSize: 20 }}>✨ Sentence Stretch</h2></div>
          <button onClick={onClose} style={{ background: 'none', fontSize: 22, color: 'var(--muted)' }}>×</button>
        </div>

        {round === -1 ? (
          <div>
            <p style={{ fontSize: 15 }}>You stretched {done.length} sentences — nice fluency workout! 💪</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, margin: '12px 0' }}>
              {done.map((d, i) => (
                <div key={i} style={{ background: '#f6f8f9', borderRadius: 10, padding: '8px 12px', fontSize: 14 }}>
                  <span style={{ color: 'var(--muted)' }}>{d.base}</span> → <b>{d.stretched || '(skipped)'}</b>
                </div>
              ))}
            </div>
            <button className="btn" style={{ width: '100%', justifyContent: 'center' }} onClick={onClose}>Done — back to writing</button>
          </div>
        ) : (
          <div>
            <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>Round {round + 1} of {ROUNDS.length}</div>
            <div style={{ background: '#eef4f7', borderRadius: 12, padding: 16, marginBottom: 10 }}>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>Stretch this sentence:</div>
              <div style={{ fontSize: 20, fontWeight: 700 }}>{r.base}</div>
              <div style={{ fontSize: 13, color: 'var(--cc-blue)', marginTop: 6 }}>{r.ask}</div>
            </div>
            <textarea value={text} onChange={(e) => setText(e.target.value)} autoFocus
              placeholder={`Start with "${base}…" and keep going`}
              style={{ width: '100%', minHeight: 90, borderRadius: 10, border: '1px solid var(--line)', padding: 12, fontFamily: 'inherit', fontSize: 15, resize: 'vertical' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <span style={{ fontSize: 13, color: strong ? 'var(--good)' : 'var(--muted)' }}>
                {extra === 0 ? 'Add at least a few vivid words' : strong ? '🔥 Now that paints a picture!' : `${extra} words — keep stretching`}
              </span>
              <button className="btn" disabled={extra < 2} onClick={next}>{round + 1 < ROUNDS.length ? 'Next →' : 'Finish'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
