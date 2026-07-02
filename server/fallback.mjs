// Used when no ANTHROPIC_API_KEY is set, so the app is fully explorable offline.
// A lightweight scripted Socratic partner — it still models the "ask, never write"
// stance, but it is rule-based, not the real conference. Live Claude replaces it
// the moment a key is present.

const OPENERS = [
  "I can see you've got real ideas here — nice.",
  "You're off to a genuine start, and I can hear your thinking.",
  "There's something to build on in this draft already.",
  "Good — you put your thoughts down, and that's the hard part.",
]

const NUDGES = [
  "What's the ONE thing you most want your reader to believe by the end? Say it plainly.",
  "Which of your reasons is the strongest? What makes it stronger than the others?",
  "If a reader disagreed with you, what would they say — and how could you answer them?",
  "Where's your best piece of evidence? What does it prove, exactly?",
  "How does your ending leave the reader? What do you want them thinking about?",
  "You use the word 'good' a lot — what's a more exact word for what you mean?",
]

// Detect "just write it for me" style requests.
const BEG_PATTERNS = [
  /write (it|this|my|the)/i, /do it for me/i, /give me (a|an|the|some) (sentence|paragraph|example|answer)/i,
  /just (write|do|finish)/i, /can you (write|make|create)/i, /finish (it|this|my)/i, /rewrite/i,
]

export function isBegging(text = '') {
  return BEG_PATTERNS.some((re) => re.test(text))
}

export function fallbackConference({ history = [], message = '', draft = '' }) {
  if (isBegging(message)) {
    return {
      text: "I hear you — starting is the tough part! But this is your piece, and your reader wants to hear YOUR thinking, not mine. So let's find it together: what's the most important thing you want them to believe? Just say it to me the way you'd tell a friend.",
      source: 'fallback',
      redirect: true,
    }
  }
  const turn = history.filter((m) => m.role === 'assistant').length
  const opener = OPENERS[turn % OPENERS.length]
  const nudge = NUDGES[turn % NUDGES.length]
  const wordCount = draft.trim().split(/\s+/).filter(Boolean).length
  const context = wordCount < 25
    ? " You've got a little down so far — let's grow it."
    : " There's plenty here to sharpen."
  return { text: `${opener}${context} ${nudge}`, source: 'fallback', redirect: false }
}

export function fallbackTraits({ draft = '' }) {
  const words = draft.trim().split(/\s+/).filter(Boolean)
  const wc = words.length
  const sentences = draft.split(/[.!?]+/).filter((s) => s.trim().length > 0)
  const hasBecause = /\bbecause\b|\bsince\b|\bso that\b/i.test(draft)
  const varied = new Set(sentences.map((s) => s.trim().split(/\s+/)[0]?.toLowerCase())).size
  const lvl = (b) => Math.max(1, Math.min(4, b))
  return {
    source: 'fallback',
    headline: wc < 40
      ? 'Your biggest win right now is adding more — say more about your best reason.'
      : 'You have enough down to start sharpening — focus on making your reasons prove your claim.',
    traits: [
      { key: 'ideas', level: lvl(hasBecause ? 3 : 2), strength: 'You have a position and you are trying to back it up.', next_step: 'Add one specific reason and explain WHY it matters to your claim.' },
      { key: 'organization', level: lvl(sentences.length >= 4 ? 3 : 2), strength: 'Your ideas are grouped together.', next_step: 'Add a transition word (First, Also, Most importantly) to guide your reader.' },
      { key: 'voice', level: lvl(2), strength: 'Your own thinking comes through.', next_step: 'Write one sentence directly to your reader to pull them in.' },
      { key: 'word_choice', level: lvl(2), strength: 'Your words are clear.', next_step: 'Swap one general word (like "good" or "bad") for a more exact one.' },
      { key: 'sentence_fluency', level: lvl(varied > 2 ? 3 : 2), strength: 'Your sentences make sense.', next_step: 'Read it aloud and combine two short sentences that belong together.' },
      { key: 'conventions', level: lvl(3), strength: 'Most punctuation is in place.', next_step: 'Check that every sentence starts with a capital and ends with a mark.' },
    ],
  }
}
