const j = (r) => r.json()

// In Vite dev (port 5173) requests are proxied via /api. When served as a
// static production build (any other port), hit the API backend directly —
// the backend sends Access-Control-Allow-Origin: *.
const BASE = (typeof location !== 'undefined' && location.port === '5173') ? '' : 'http://localhost:8787'
const u = (p) => BASE + p

export const api = {
  health: () => fetch(u('/api/health')).then(j),
  state: () => fetch(u('/api/state')).then(j),
  reset: () => fetch(u('/api/reset'), { method: 'POST' }).then(j),
  saveContent: (draftId, content) =>
    fetch(u(`/api/drafts/${draftId}`), { method: 'PATCH', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ content }) }).then(j),
  traits: (draftId) => fetch(u(`/api/drafts/${draftId}/traits`), { method: 'POST' }).then(j),
  confer: (subId, message) =>
    fetch(u(`/api/submissions/${subId}/conference`), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ message }) }).then(j),
  saveRevision: (subId) => fetch(u(`/api/submissions/${subId}/save-revision`), { method: 'POST' }).then(j),
  quickWrite: (mode) => fetch(u('/api/quickwrite'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ mode }) }).then(j),
  start: (assignmentId) => fetch(u('/api/submissions/start'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ assignmentId }) }).then(j),
  setGoal: (payload) => fetch(u('/api/goal'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then(j),
  achieveGoal: () => fetch(u('/api/goal/achieve'), { method: 'POST' }).then(j),
  peerRevision: () => fetch(u('/api/peerrevision'), { method: 'POST' }).then(j),
  share: (submissionId) => fetch(u('/api/share'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ submissionId }) }).then(j),
  kudos: (id) => fetch(u(`/api/share/${id}/kudos`), { method: 'POST' }).then(j),
  shoutOut: (payload) => fetch(u('/api/shoutout'), { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) }).then(j),
}

export const TRAIT_LABELS = {
  ideas: 'Ideas', organization: 'Organization', voice: 'Voice',
  word_choice: 'Word Choice', sentence_fluency: 'Sentence Fluency', conventions: 'Conventions',
}
export const LEVEL_NAMES = { 1: 'Emerging', 2: 'Developing', 3: 'Proficient', 4: 'Strong' }
export const LEVEL_COLORS = { 1: '#e08a2b', 2: '#e0b52b', 3: '#4aa96c', 4: '#2e9e6b' }
