import {
  Eye,
  Ear,
  BookOpen,
  Hand,
  type LucideIcon,
} from "lucide-react"

export type StyleKey = "visual" | "auditory" | "readwrite" | "kinesthetic"

export type AgeGroup =
  | "early" // 3-5
  | "elementary" // 6-8
  | "middle" // 9-12
  | "teen" // 13-18

export const AGE_GROUPS: {
  key: AgeGroup
  label: string
  range: string
  emoji: string
}[] = [
  { key: "early", label: "Early Childhood", range: "Ages 3–5", emoji: "🐣" },
  { key: "elementary", label: "Elementary", range: "Ages 6–8", emoji: "🌱" },
  { key: "middle", label: "Middle School", range: "Ages 9–12", emoji: "🚀" },
  { key: "teen", label: "Teens", range: "Ages 13–18", emoji: "🔭" },
]

export type LearningStyle = {
  key: StyleKey
  name: string
  shortName: string
  icon: LucideIcon
  /** tailwind token color name, maps to css var via text-[color] etc. */
  colorVar: string
  tagline: string
  description: string
  strengths: string[]
}

export const LEARNING_STYLES: Record<StyleKey, LearningStyle> = {
  visual: {
    key: "visual",
    name: "Visual Learner",
    shortName: "Visual",
    icon: Eye,
    colorVar: "var(--visual)",
    tagline: "You learn best by seeing.",
    description:
      "You understand STEM ideas fastest when they are shown as pictures, diagrams, colors, and videos. Charts and animations help things click.",
    strengths: [
      "Remembering diagrams & charts",
      "Following visual demonstrations",
      "Color-coding and mind maps",
      "Watching simulations & videos",
    ],
  },
  auditory: {
    key: "auditory",
    name: "Auditory Learner",
    shortName: "Auditory",
    icon: Ear,
    colorVar: "var(--auditory)",
    tagline: "You learn best by listening.",
    description:
      "You absorb STEM concepts when you hear them explained, talk them through, or learn with sounds, songs, and discussion.",
    strengths: [
      "Listening to explanations",
      "Discussing ideas out loud",
      "Learning with songs & rhythm",
      "Podcasts & read-aloud lessons",
    ],
  },
  readwrite: {
    key: "readwrite",
    name: "Read / Write Learner",
    shortName: "Read/Write",
    icon: BookOpen,
    colorVar: "var(--readwrite)",
    tagline: "You learn best by reading & writing.",
    description:
      "You make sense of STEM by reading text and writing things down. Notes, lists, and step-by-step guides are your superpower.",
    strengths: [
      "Reading articles & guides",
      "Taking detailed notes",
      "Making lists & summaries",
      "Writing to remember",
    ],
  },
  kinesthetic: {
    key: "kinesthetic",
    name: "Kinesthetic Learner",
    shortName: "Kinesthetic",
    icon: Hand,
    colorVar: "var(--kinesthetic)",
    tagline: "You learn best by doing.",
    description:
      "You learn STEM by building, touching, moving, and experimenting. Hands-on projects and real experiments make ideas stick.",
    strengths: [
      "Hands-on building & tinkering",
      "Doing experiments",
      "Learning through movement",
      "Interactive games & blocks",
    ],
  },
}

export const STYLE_ORDER: StyleKey[] = [
  "visual",
  "auditory",
  "readwrite",
  "kinesthetic",
]

/**
 * "How to learn" tool / platform recommendations.
 * We never tell kids *what* to learn — only *how* and *with which tools*.
 * Recommendations are tailored per learning style + age group.
 */
export type ToolRecommendation = {
  name: string
  what: string // what the tool is
  how: string // how to use it for their style
  free: boolean
}

type RecMap = Record<StyleKey, Record<AgeGroup, ToolRecommendation[]>>

export const RECOMMENDATIONS: RecMap = {
  visual: {
    early: [
      { name: "Khan Academy Kids", what: "Animated lessons app", how: "Watch the colorful animations and point at the shapes you see.", free: true },
      { name: "PBS Kids Games", what: "Picture-based science games", how: "Play games where you match and tap bright pictures.", free: true },
    ],
    elementary: [
      { name: "BrainPOP Jr.", what: "Animated explainer videos", how: "Watch a short cartoon, then draw what you saw.", free: false },
      { name: "Tinybop / Toca", what: "Visual exploration apps", how: "Tap, zoom, and watch how things work on screen.", free: false },
    ],
    middle: [
      { name: "PhET Simulations", what: "Interactive science visuals", how: "Drag the sliders and watch the diagram change in real time.", free: true },
      { name: "Khan Academy", what: "Whiteboard video lessons", how: "Watch the drawn-out steps, pause, and sketch them yourself.", free: true },
    ],
    teen: [
      { name: "3Blue1Brown", what: "Animated math videos", how: "Watch visual proofs to *see* why math works.", free: true },
      { name: "Desmos", what: "Visual graphing calculator", how: "Type equations and watch the graph draw itself.", free: true },
    ],
  },
  auditory: {
    early: [
      { name: "Songs for Littles", what: "Learning songs", how: "Sing along to number and shape songs out loud.", free: true },
      { name: "Khan Academy Kids", what: "Read-aloud stories", how: "Listen to the voice read, then say the answer back.", free: true },
    ],
    elementary: [
      { name: "Brains On!", what: "Science podcast for kids", how: "Listen to an episode in the car and talk about it.", free: true },
      { name: "GoNoodle", what: "Audio + movement", how: "Follow the spoken instructions and chant the facts.", free: true },
    ],
    middle: [
      { name: "But Why Podcast", what: "Question & answer podcast", how: "Listen, then explain the answer to someone else.", free: true },
      { name: "YouTube (audio focus)", what: "Spoken explainers", how: "Close your eyes and just listen, then summarize aloud.", free: true },
    ],
    teen: [
      { name: "Crash Course", what: "Fast spoken lessons", how: "Listen at your pace and repeat key terms out loud.", free: true },
      { name: "Science Vs / Radiolab", what: "Science discussion podcasts", how: "Listen and debate the ideas with a friend.", free: true },
    ],
  },
  readwrite: {
    early: [
      { name: "Picture word books", what: "Early STEM readers", how: "Read labels aloud and trace the words.", free: true },
      { name: "Endless Alphabet", what: "Word-building app", how: "Build words for science objects you see.", free: false },
    ],
    elementary: [
      { name: "Epic!", what: "Kids' reading library", how: "Read STEM books and write one fact you learned.", free: false },
      { name: "DK Findout!", what: "Illustrated reference site", how: "Read short articles and make a fact list.", free: true },
    ],
    middle: [
      { name: "CK-12", what: "Free digital textbooks", how: "Read a section, then write your own summary.", free: true },
      { name: "Wikipedia / Simple Wiki", what: "Reference articles", how: "Read and take bullet-point notes in your own words.", free: true },
    ],
    teen: [
      { name: "Brilliant", what: "Text-based problem courses", how: "Read the concept, then write out each solving step.", free: false },
      { name: "MIT OpenCourseWare", what: "University notes & readings", how: "Read lecture notes and rewrite them as flashcards.", free: true },
    ],
  },
  kinesthetic: {
    early: [
      { name: "Magna-Tiles / blocks", what: "Building toys", how: "Build shapes with your hands to feel how they fit.", free: false },
      { name: "Sensory science kits", what: "Touch-and-do kits", how: "Mix, pour, and feel simple experiments.", free: false },
    ],
    elementary: [
      { name: "Snap Circuits", what: "Hands-on electronics", how: "Click pieces together to build a working circuit.", free: false },
      { name: "ScratchJr", what: "Drag-and-drop coding", how: "Move blocks with your fingers to make things happen.", free: true },
    ],
    middle: [
      { name: "Scratch", what: "Block-based coding", how: "Build and remix projects by dragging blocks.", free: true },
      { name: "LEGO / Arduino kits", what: "Buildable robotics", how: "Build a real device and test it with your hands.", free: false },
    ],
    teen: [
      { name: "Tinkercad", what: "3D design & circuits", how: "Build and simulate real projects you can 3D print.", free: true },
      { name: "Arduino / Raspberry Pi", what: "Maker hardware", how: "Wire up real components and run your own experiments.", free: false },
    ],
  },
}

/** Generic "how to study" techniques per style, used as study tips. */
export const STUDY_TIPS: Record<StyleKey, string[]> = {
  visual: [
    "Turn notes into colorful mind maps and diagrams.",
    "Watch a video first, then sketch what you understood.",
    "Use highlighters to color-code different ideas.",
  ],
  auditory: [
    "Read your notes out loud or record yourself.",
    "Explain the idea to someone else (or a pet!).",
    "Make up a song or rhyme for tricky facts.",
  ],
  readwrite: [
    "Rewrite ideas in your own words.",
    "Make lists, definitions, and step-by-step guides.",
    "Turn what you learn into flashcards.",
  ],
  kinesthetic: [
    "Build a model or do an experiment for the topic.",
    "Walk around while you review out loud.",
    "Use objects or blocks to act out the idea.",
  ],
}
