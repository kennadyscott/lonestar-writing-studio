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
      prompt: "Rex tried to write a three-paragraph argument about recess, but it's weak! Judge it against the rubric, then revise it: real evidence, a counter-argument, and precise words.",
      weakText: `I think recess should be longer at our school. Recess is fun and everyone likes it. That is why I think it should be longer than it is now.

One reason is that recess is fun. We get to play games and hang out with our friends. Another reason is that kids like it. Everyone I know likes recess a lot. Also it is good to go outside. Being outside is better than being inside.

In conclusion, recess should be longer because it is fun and kids like it. The principal should make recess longer. That would be good for everyone at our school.`,
      checklist: ['Has a clear claim', 'Each reason is backed by evidence or an example', 'Answers what the other side would say', 'Each body paragraph does one job, linked with transitions', 'Word choice is precise — no vague "good" or "fun"', 'Conclusion does more than repeat the claim'] },
  } },
  { id: 'pr_nova', author: 'Nova the Robot 🤖', genre: 'narrative', bands: {
    elem: {
      prompt: "Nova's story is super plain. Judge it with the checklist, then rewrite it so we can really SEE the dog.",
      weakText: 'The dog ran. It was a good dog. The dog was happy. The end.',
      checklist: ['Tells who and where', 'Shows feelings instead of just naming them', 'Uses at least one vivid describing word', 'Has a real ending'] },
    mid: {
      prompt: "Nova wrote a three-paragraph story about a beach day, but it's flat. Evaluate it against the rubric, then revise with sensory detail, real feelings, and varied sentences.",
      weakText: `Last summer I went to the beach with my family. It was fun. We drove for a long time to get there. When we got there we set up our stuff on the sand.

I went in the water with my brother. The water was cold. We swam for a while. Then we built a sandcastle. It was big. After that we ate lunch. The sandwiches were good.

At the end of the day we packed up and went home. I was tired. It was a fun day at the beach. The end.`,
      checklist: ['Opens in a way that pulls the reader in', 'Uses sensory details (see, hear, feel)', 'Shows emotion through actions, not labels', 'Varies sentence length and beginnings', 'Events connect — one leads to the next', 'Ending resolves the story, not just stops it'] },
  } },
  { id: 'pr_byte', author: 'Byte the Robot 🤖', genre: 'informational', bands: {
    elem: {
      prompt: "Byte's explanation is too bare. Judge it with the checklist, then rewrite it to really teach the reader.",
      weakText: 'Deserts are hot. People live there. It is dry. That is about deserts.',
      checklist: ['Has a topic sentence', 'Gives at least two facts', 'Explains the facts with details', 'Has an ending sentence'] },
    mid: {
      prompt: "Byte wrote a three-paragraph explanation of deserts, but it's bare. Evaluate it against the rubric, then revise with organized facts, real examples, and precise vocabulary.",
      weakText: `Deserts are very dry places. They do not get much rain. Deserts are hot. Some deserts are actually cold but mostly they are hot. This paper is about deserts and what lives there.

People and animals live in deserts. They have ways to live there. Camels can go a long time without water. People wear clothes to stay cool. Plants live there too. A cactus holds water inside it. That is how they live in the desert.

Deserts are interesting places. They are dry and hot. Many things live there. That is what I learned about deserts.`,
      checklist: ['Has a clear central idea', 'Facts are grouped logically, not scattered', 'Each fact is explained or has an example', 'Uses precise vocabulary for the topic', 'No contradictions or filler sentences', 'Conclusion ties the information together'] },
  } },
]
export const bandFor = (grade) => (grade <= 5 ? 'elem' : 'mid')
export const todaysTask = () => PEER_TASKS[Math.floor(Date.now() / 86400000) % PEER_TASKS.length]

