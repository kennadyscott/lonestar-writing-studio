// Poorly-written responses students revise. Not the student's own work -> no
// integrity issue; pure revision practice, framed as helping a robot writer.
// Each task has grade-band variants (elem = gr 3-5, mid = gr 6-8): the weak
// text, the prompt, and the rubric checklist all scale in complexity.
export const PEER_TASKS = [
  { id: 'pr_rex', author: 'Rex the Robot 🤖', genre: 'argument', bands: {
    elem: {
      prompt: "Rex wrote an opinion about recess, but it's weak! First judge it with the checklist, then rewrite it to make it stronger.",
      weakText: 'Recess should be longer. Recess is fun. I like recess. Recess is good. So recess should be longer.',
      checklist: ['States an opinion clearly', 'Gives a real reason — not just "it is fun"', 'Uses different words instead of repeating', 'Has a closing sentence'] },
    mid: {
      prompt: "Rex tried to write an argument about recess, but it's weak! First judge it against the rubric, then revise it: real reasons, no repetition, stronger words.",
      weakText: 'Recess should be longer. Recess is fun. I like recess. Recess is good. Everyone likes recess. So recess should be longer because it is fun.',
      checklist: ['Has a clear claim', 'Each reason is backed by evidence or an example', 'Answers what the other side would say', 'Uses transitions (First, Also, However)', 'Word choice is precise — no vague "good" or "fun"', 'Conclusion does more than repeat the claim'] },
  } },
  { id: 'pr_nova', author: 'Nova the Robot 🤖', genre: 'narrative', bands: {
    elem: {
      prompt: "Nova's story is super plain. Judge it with the checklist, then rewrite it so we can really SEE the dog.",
      weakText: 'The dog ran. It was a good dog. The dog was happy. The end.',
      checklist: ['Tells who and where', 'Shows feelings instead of just naming them', 'Uses at least one vivid describing word', 'Has a real ending'] },
    mid: {
      prompt: "Nova's story is flat. Evaluate it against the rubric, then revise with sensory detail, varied sentences, and a real arc.",
      weakText: 'The dog ran. It was a good dog. The dog was happy. Then the dog ate. It was a fun day. The end.',
      checklist: ['Opens in a way that pulls the reader in', 'Uses sensory details (see, hear, feel)', 'Shows emotion through actions, not labels', 'Varies sentence length and beginnings', 'Events connect — one leads to the next', 'Ending resolves the story, not just stops it'] },
  } },
  { id: 'pr_byte', author: 'Byte the Robot 🤖', genre: 'informational', bands: {
    elem: {
      prompt: "Byte's explanation is too bare. Judge it with the checklist, then rewrite it to really teach the reader.",
      weakText: 'Deserts are hot. People live there. It is dry. That is about deserts.',
      checklist: ['Has a topic sentence', 'Gives at least two facts', 'Explains the facts with details', 'Has an ending sentence'] },
    mid: {
      prompt: "Byte's explanation is too bare. Evaluate it against the rubric, then revise with organized facts, examples, and precise language.",
      weakText: 'Deserts are hot. People live there. It is dry. They get water. Deserts are cool. That is about deserts.',
      checklist: ['Has a clear central idea', 'Facts are grouped logically, not scattered', 'Each fact is explained or has an example', 'Uses precise vocabulary for the topic', 'No contradictions or filler sentences', 'Conclusion ties the information together'] },
  } },
]
export const bandFor = (grade) => (grade <= 5 ? 'elem' : 'mid')
export const todaysTask = () => PEER_TASKS[Math.floor(Date.now() / 86400000) % PEER_TASKS.length]

