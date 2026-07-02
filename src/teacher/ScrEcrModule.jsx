import React from 'react'

const ECR_ITEMS = [
  { t: 'The Amazing Adaptations of the Arctic Fox', type: 'Argumentative', grade: 3 },
  { t: 'How People Change the Land', type: 'Argumentative', grade: 3 },
  { t: 'The Amazing World of Atoms', type: 'Informational', grade: 6 },
  { t: 'The Power of Kindness', type: 'Informational', grade: 3 },
]

export default function ScrEcrModule() {
  return (
    <div>
      <div className="eyebrow">The Writing Studio · Applied Output</div>
      <h1 className="page">SCR / ECR — now one module, not the whole product</h1>
      <p className="page-sub">Your existing test-prep tool stays exactly where teachers expect it — but it's now the <b>applied output</b> of real writing development.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <b>What stays the same</b>
          <ul style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, paddingLeft: 18 }}>
            <li>Your SCR & ECR Designers, your existing prompts, your STAAR formats.</li>
            <li>No migration — every SCR/ECR response is just a <b>submission with a short draft chain</b> in the same pipeline.</li>
            <li>Current customers lose nothing.</li>
          </ul>
        </div>
        <div className="card" style={{ padding: 20 }}>
          <b>What's new around it</b>
          <ul style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.6, paddingLeft: 18 }}>
            <li>The same <b>Socratic conference</b> and <b>6-Traits feedback</b> now coach SCR/ECR too.</li>
            <li>A STAAR <b>rubric overlay</b> sits on top of the trait engine for test-format scoring.</li>
            <li>Test prep becomes the <b>proof</b> of strong writing — not the point of it.</li>
          </ul>
        </div>
      </div>

      <div className="card" style={{ padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <b>Your existing ECR library — same content, now studio-connected</b>
          <span className="pill blue">argument content already here</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {ECR_ITEMS.map((e, i) => (
            <div key={i} style={{ border: '1px solid var(--line)', borderRadius: 12, padding: 14, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{e.t}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>{e.type} Prompt · Grade {e.grade}</div>
              </div>
              <span className="pill" style={{ background: e.type === 'Argumentative' ? '#eaf1fb' : '#eef1f4', color: e.type === 'Argumentative' ? 'var(--cc-blue)' : '#667' }}>{e.type}</span>
            </div>
          ))}
        </div>
        <p style={{ color: 'var(--muted)', fontSize: 13, marginTop: 14 }}>
          Note: SCR/ECR rubric integration references released TEA items only — never secured or live test content.
        </p>
      </div>
    </div>
  )
}
