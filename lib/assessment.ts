import type { StyleKey } from "./learning-styles"

export type Modality = "visual" | "audio" | "text"

export type QuestionOption = {
  id: string
  label: string
  /** small emoji/icon shown on the option card */
  emoji?: string
  style: StyleKey
}

export type Question = {
  id: string
  modality: Modality
  /** the question text shown on screen */
  prompt: string
  /** helper line under the prompt */
  helper?: string
  /** for audio questions: text the mascot speaks aloud */
  spoken?: string
  options: QuestionOption[]
}

/**
 * Multi-modal VARK-style assessment.
 * Items are delivered as visual, audio, and read/write tasks so the
 * experience itself samples every modality. Each option maps to a style.
 */
export const QUESTIONS: Question[] = [
  {
    id: "q1",
    modality: "visual",
    prompt: "A new science kit arrives. What do you do first?",
    helper: "Pick the one that feels most like you.",
    options: [
      { id: "a", emoji: "📺", label: "Watch the video showing how it works", style: "visual" },
      { id: "b", emoji: "🎧", label: "Listen to someone explain it to me", style: "auditory" },
      { id: "c", emoji: "📖", label: "Read the instruction booklet", style: "readwrite" },
      { id: "d", emoji: "🛠️", label: "Just start building it with my hands", style: "kinesthetic" },
    ],
  },
  {
    id: "q2",
    modality: "audio",
    prompt: "Listen to the mascot, then choose your answer.",
    helper: "Tap the speaker to hear the question.",
    spoken:
      "When you want to remember a new science fact, what helps you the most?",
    options: [
      { id: "a", emoji: "🖼️", label: "Seeing a picture or diagram of it", style: "visual" },
      { id: "b", emoji: "🔊", label: "Hearing it said out loud a few times", style: "auditory" },
      { id: "c", emoji: "✍️", label: "Writing it down in my notebook", style: "readwrite" },
      { id: "d", emoji: "🤹", label: "Acting it out or doing it myself", style: "kinesthetic" },
    ],
  },
  {
    id: "q3",
    modality: "text",
    prompt: "Read this: \"A circuit needs a loop for electricity to flow.\" How do you best understand it?",
    helper: "Choose how you'd make this idea click.",
    options: [
      { id: "a", emoji: "🔁", label: "Draw the loop as a picture", style: "visual" },
      { id: "b", emoji: "🗣️", label: "Say it out loud and discuss it", style: "auditory" },
      { id: "c", emoji: "📝", label: "Re-read and rewrite it in my words", style: "readwrite" },
      { id: "d", emoji: "🔌", label: "Build a real circuit to see the loop", style: "kinesthetic" },
    ],
  },
  {
    id: "q4",
    modality: "visual",
    prompt: "Which picture would you rather learn from?",
    options: [
      { id: "a", emoji: "📊", label: "A colorful chart or infographic", style: "visual" },
      { id: "b", emoji: "🎙️", label: "A podcast cover (listen-only lesson)", style: "auditory" },
      { id: "c", emoji: "📄", label: "A clear written step-by-step guide", style: "readwrite" },
      { id: "d", emoji: "🧩", label: "A hands-on puzzle or model", style: "kinesthetic" },
    ],
  },
  {
    id: "q5",
    modality: "audio",
    prompt: "Listen, then pick what sounds most fun.",
    helper: "Tap the speaker to hear it.",
    spoken: "Which way of doing a math problem sounds the most fun to you?",
    options: [
      { id: "a", emoji: "🎨", label: "Solve it with pictures and color", style: "visual" },
      { id: "b", emoji: "🎵", label: "Turn it into a rhyme or song", style: "auditory" },
      { id: "c", emoji: "📋", label: "Write out every step neatly", style: "readwrite" },
      { id: "d", emoji: "✋", label: "Use blocks or fingers to count", style: "kinesthetic" },
    ],
  },
  {
    id: "q6",
    modality: "text",
    prompt: "When a lesson gets tricky, what do you wish you had?",
    options: [
      { id: "a", emoji: "🎞️", label: "An animation that shows it", style: "visual" },
      { id: "b", emoji: "👂", label: "Someone to explain it aloud", style: "auditory" },
      { id: "c", emoji: "📚", label: "A page I can read slowly", style: "readwrite" },
      { id: "d", emoji: "🧪", label: "An experiment I can try", style: "kinesthetic" },
    ],
  },
  {
    id: "q7",
    modality: "visual",
    prompt: "You finished a project! How do you like to show it?",
    options: [
      { id: "a", emoji: "🖌️", label: "A poster or drawing", style: "visual" },
      { id: "b", emoji: "🎤", label: "Tell everyone about it out loud", style: "auditory" },
      { id: "c", emoji: "🧾", label: "Write a report about it", style: "readwrite" },
      { id: "d", emoji: "🏗️", label: "Show the thing I built", style: "kinesthetic" },
    ],
  },
  {
    id: "q8",
    modality: "audio",
    prompt: "Last one — listen and choose.",
    helper: "Tap the speaker to hear it.",
    spoken: "After a long day, how would you most enjoy exploring a STEM idea?",
    options: [
      { id: "a", emoji: "📱", label: "Watching a cool science video", style: "visual" },
      { id: "b", emoji: "🎧", label: "Listening to a fun science story", style: "auditory" },
      { id: "c", emoji: "📖", label: "Reading about something new", style: "readwrite" },
      { id: "d", emoji: "🤖", label: "Tinkering with a kit or app", style: "kinesthetic" },
    ],
  },
]

export type Answers = Record<string, StyleKey>

export type ScoreResult = {
  scores: Record<StyleKey, number>
  primary: StyleKey
  /** ordered styles, strongest first */
  ranked: StyleKey[]
  /** percentages keyed by style (0-100) */
  percentages: Record<StyleKey, number>
}

export function scoreAssessment(answers: Answers): ScoreResult {
  const scores: Record<StyleKey, number> = {
    visual: 0,
    auditory: 0,
    readwrite: 0,
    kinesthetic: 0,
  }

  for (const style of Object.values(answers)) {
    scores[style] += 1
  }

  const total = Object.values(scores).reduce((a, b) => a + b, 0) || 1

  const percentages = {
    visual: Math.round((scores.visual / total) * 100),
    auditory: Math.round((scores.auditory / total) * 100),
    readwrite: Math.round((scores.readwrite / total) * 100),
    kinesthetic: Math.round((scores.kinesthetic / total) * 100),
  }

  const ranked = (Object.keys(scores) as StyleKey[]).sort(
    (a, b) => scores[b] - scores[a],
  )

  return { scores, primary: ranked[0], ranked, percentages }
}
