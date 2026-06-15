<div align="center">

<img src="public/icon.svg" alt="SparkPath Logo" width="80" height="80" />

# ⚡ Sparky

### *Helping every child learn in the way that works best for them.*

A **Duolingo-inspired**, mascot-guided STEM learning platform that identifies each child's unique learning style through a multimodal VARK assessment, then delivers a fully personalized learning path, brain games, and AI-powered tutoring — all with **no account or login required**.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38BDF8?logo=tailwindcss)](https://tailwindcss.com/)
[![AI SDK](https://img.shields.io/badge/Vercel_AI_SDK-6.x-000000?logo=vercel)](https://sdk.vercel.ai/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

---

## 📋 Table of Contents

- [💡 Inspiration](#-inspiration)
- [🌟 What It Does](#-what-it-does)
- [🛠️ How We Built It](#️-how-we-built-it)
- [⚠️ Challenges We Ran Into](#️-challenges-we-ran-into)
- [🏆 Accomplishments We're Proud Of](#-accomplishments-were-proud-of)
- [📚 What We Learned](#-what-we-learned)
- [🔮 What's Next for Sparky](#-whats-next-for-sparky)
- [✨ Key Features](#-key-features)
- [🔄 How the Assessment System Works](#-how-the-assessment-system-works)
- [🛠 Tech Stack & Dependencies](#-tech-stack--dependencies)
- [📦 Prerequisites & Installation](#-prerequisites--installation)
- [💻 Usage Examples](#-usage-examples)
- [📡 API Documentation](#-api-documentation)
- [📁 Project Structure](#-project-structure)
- [📸 UI Screenshots](#-ui-screenshots)
- [🤝 Contribution Guide](#-contribution-guide)
- [📄 License](#-license)

---

## 💡 Inspiration

Growing up, I was often scolded for poor academic performance. Over time, I started believing that I simply wasn't smart enough. It's easy to feel that way when other children receive praise while you're met with disappointment.

The frustration grew because I was genuinely trying hard, yet classmates who barely seemed to study often performed better than I did. Fortunately, I discovered something that changed everything. Following the traditional advice of repeatedly writing and practicing never worked for me — it only made learning more frustrating.

Later, I started **speaking aloud what I was studying**, and suddenly everything clicked.

This realization made me question whether I was ever bad at learning in the first place. Maybe I simply wasn't being taught in a way that matched how I learned best. More insights emerged when I started helping my younger sister with her studies.

Whenever I explained concepts to her, she understood them almost instantly. However, when my mother taught her using traditional repetitive writing methods, they often struggled for hours without much progress.

That experience inspired a simple but powerful question:

> **What if we could help children discover how they learn best — and help parents understand how to teach them more effectively?**

That's how **Sparky** was born.

---

## 🌟 What It Does

**Sparky** is an **AI-powered learning platform** designed for children in their early developmental years and their parents.

The platform begins with an **age-based gamified onboarding experience** and introduces children to interactive STEM activities, educational games, audio and video learning modules, and cognitive assessments. Through these experiences, Sparky analyzes engagement patterns, learning preferences, cognitive strengths, and retention behaviors to generate **personalized learning reports** and **adaptive learning plans**.

Instead of forcing every child into the same learning framework, Sparky helps identify which learning approaches work best for each child, how different methods can be combined effectively, and ways to maximize retention and learning outcomes.

### For Children
- Complete a fun, mascot-guided VARK assessment to discover their primary learning style
- Follow a Duolingo-style personalized stage path built around how *they* learn
- Play 12+ research-valid brain games spanning cognitive, social-emotional, and decision-making categories
- Chat with **Sparky**, an AI guide who recommends real tools and study techniques tailored to their style and age

### For Parents
Sparky provides actionable recommendations that help parents adapt their teaching style, incorporate multimodal learning techniques, create engaging learning environments at home, and support their child's unique learning needs.

### Our Goal
- ✅ **Increase academic engagement**
- ✅ **Build learning confidence**
- ✅ **Improve retention**
- ✅ **Reduce academic frustration**
- ✅ **Strengthen parent-child learning experiences**

---

## 🛠️ How We Built It

We built **Sparky** as a modern AI-powered web platform focused on helping children discover how they learn best while providing parents with meaningful insights.

### Frontend & Platform
Built with **Next.js**, **React**, **Tailwind CSS**, **shadcn/ui**, **Base UI**, and **Framer Motion** to create a fast, responsive, accessible, and child-friendly experience across all devices.

### Learning Experiences
We designed four interactive learner modules tailored around different learning approaches — **Visual**, **Auditory**, **Kinesthetic**, and **Read/Write** — where children engage through gamified STEM challenges, educational mini-games, interactive assessments, and audio/video learning activities.

### AI-Powered Features
To support auditory learners, we built an **AI Dialogue System** that enables children to listen actively, think critically, and respond conversationally. We integrated **Text-to-Speech (TTS)**, **Speech Recognition**, **AI Chat Assistance**, and the **Vercel AI SDK** to power intelligent conversations, personalized feedback, and adaptive learning.

### Analytics & Reporting
We developed progress tracking systems, learning analytics dashboards, and engagement visualizations to help both children and parents understand learning patterns and growth over time. Sparky generates customized reports containing learning insights, study recommendations, preferred learning techniques, and parent teaching recommendations.

---

## ⚠️ Challenges We Ran Into

**Making Learning Fun** — Our biggest challenge was ensuring the platform felt genuinely enjoyable rather than becoming "just another educational website." We invested significant effort into gamification systems, interactive activities, reward mechanisms, mini-games, and micro-animations while still collecting meaningful educational data.

**Tracking Learning Behaviors** — Because Sparky evaluates engagement patterns, learning preferences, and cognitive behaviors, we needed a reliable system to track interactions across multiple learning experiences without disrupting the user experience.

**Generating Actionable Insights** — Combining data from STEM challenges, audio modules, video content, assessments, and educational games into a single, easy-to-understand report for both children and parents proved to be one of the most complex challenges we faced.

---

## 🏆 Accomplishments We're Proud Of

One of our proudest achievements is seeing Sparky evolve from a personal childhood experience into a **fully interactive learning ecosystem**.

- ✅ Building a complete end-to-end learning platform
- ✅ Combining **AI-powered personalization** with **gamified learning**
- ✅ Creating personalized reports for both children and parents
- ✅ Supporting multiple age groups (ages 3–18) with age-appropriate experiences
- ✅ Successfully integrating Visual, Auditory, Kinesthetic, and Read/Write learning into a single cohesive platform

Most importantly, we're proud that Sparky has the potential to help children build confidence, reduce learning frustration, help parents better understand their children, and create healthier learning experiences at home.

---

## 📚 What We Learned

From a technical perspective, we discovered that building for children is fundamentally different from building traditional web applications. Simply displaying content wasn't enough.

We experimented extensively with animation libraries, gamification techniques, interactive UI components, AI conversations, speech technologies, and progress tracking systems until the experience felt engaging and natural.

> **Creating a great educational experience requires balancing technology, psychology, design, and learning science — not just writing code.**

---

## 🔮 What's Next for Sparky

Our next goal is to go much deeper into understanding how children learn and how different learning approaches can be combined to maximize engagement, retention, and outcomes.

### Enhanced Assessments
Rather than only identifying learning preferences, we want to build advanced assessments capable of discovering the **most effective combinations** of Visual, Auditory, Kinesthetic, and Read/Write learning for every individual child — with deeper behavioral insights, more actionable recommendations, continuously evolving learning plans, and long-term progress tracking.

### Parent Learning Module
We plan to develop a dedicated **Parent STEM Learning Module** with teaching guides, hands-on home experiments, interactive activities, age-appropriate strategies, and at-home learning resources — making STEM subjects more accessible and enjoyable for the whole family.

### Long-Term Vision
Our vision is for **Sparky** to become a comprehensive learning companion for both children and parents — helping families discover how children learn best, build confidence, and transform learning from a source of frustration into a source of curiosity and growth.

---

## ✨ Key Features

- 🎯 **VARK-Based Learning Style Detection** — 8-question multimodal assessment (visual, audio, text modalities) maps children to one of four styles: Visual, Auditory, Read/Write, or Kinesthetic
- 🧭 **Guided Mascot Onboarding** — 7-step animated onboarding flow with STEM video, embedded quiz, age selection, and name capture; no sign-up required
- 🗺️ **Personalized Stage Path** — Duolingo-style winding lesson map, unique per learning style, with lesson, chest, practice, and trophy stage types
- 🧠 **Rich Learner Modules** — Four fully distinct modules with age-adaptive STEM content for Early (3–5), Elementary (6–8), Middle (9–12), and Teen (13–18) groups
- 🎮 **Sparky's Brain Games Arcade** — 12 research-valid mini-games across 6 categories: Brain Teasers, Lightning Reflexes, Decision-Making, Pattern Learning, Social-Emotional, and Consumer Behavior
- 🤖 **AI Chat with Sparky** — A streaming AI assistant (Vercel AI SDK + GPT) that recommends learning tools and techniques tailored to each child's style and age group
- 📊 **Style Results Dashboard** — Animated breakdown of learning-style mix (percentages), curated tool recommendations, and personalized study tips
- 🔥 **XP & Progress Tracking** — Sparks (XP), streak counters, hearts, and daily quests — all persisted in `localStorage`, zero backend
- 🔒 **Privacy-First by Design** — No accounts, no tracking, no ads; all data stays on the child's device
- 📱 **Fully Responsive** — Mobile-first layout with a desktop sidebar, mobile top nav, and adaptive content

---

## 🔄 How the Assessment System Works

The assessment is the core engine of SparkPath. It determines the child's **primary learning style** and drives all downstream personalization — routing, content, tool recommendations, and AI chat context.

### Complete Assessment Flow Diagram

```mermaid
flowchart TD
    A([🏠 Child Visits SparkPath]) --> B{Profile in localStorage?}
    B -- Yes, assessment done --> C([🗺️ /learn — Personalized Dashboard])
    B -- No --> D[📺 Onboarding: Intro with Sparky]

    subgraph ONBOARDING ["🧭 Onboarding Flow — 7 Steps"]
        D --> E[Mission: Everyone learns differently!]
        E --> F[STEM Video Embed — SciShow Kids]
        F --> G[Video Quiz — What do engineers do?]
        G --> H{Correct Answer?}
        H -- ✅ Correct --> I[🎉 Celebration Message]
        H -- ❌ Wrong --> J[🌟 Encouragement — Keep trying!]
        I & J --> K[Age Group Selection\nEarly · Elementary · Middle · Teen]
        K --> L[Name Input — Stored Locally Only]
        L --> M[Ready Screen — START QUEST]
    end

    M --> N([⚡ /assessment — 8-Question Quiz])

    subgraph ASSESSMENT ["📋 VARK Assessment Engine"]
        N --> Q1[Q1 Visual — Science Kit Scenario]
        Q1 --> Q2[Q2 Audio — TTS Spoken\nMemory Technique Question]
        Q2 --> Q3[Q3 Text — Circuit Reading Task]
        Q3 --> Q4[Q4 Visual — Learning Format Preference]
        Q4 --> Q5[Q5 Audio — TTS Math Problem Style]
        Q5 --> Q6[Q6 Text — Struggling Learner Aid]
        Q6 --> Q7[Q7 Visual — Project Showcase Format]
        Q7 --> Q8[Q8 Audio — TTS End-of-Day Learning]
        Q8 --> SCORE[scoreAssessment\nTally each answer's StyleKey]
    end

    subgraph SCORING ["📊 Score Calculation"]
        SCORE --> S1[Count answers per style\nvisual · auditory · readwrite · kinesthetic]
        S1 --> S2[Calculate percentages\nstyle_count ÷ total × 100]
        S2 --> S3[Rank styles strongest → weakest]
        S3 --> S4[primary = ranked 0\nSave full result to localStorage Profile]
    end

    S4 --> R([🏆 /results — Personalized Results Page])

    subgraph RESULTS ["🎯 Results & Personalization"]
        R --> R1[Display Primary Learning Style Card\nVisual · Auditory · Read Write · Kinesthetic]
        R1 --> R2[Show Learning Mix Bar Chart\nAll 4 styles with animated percentages]
        R2 --> R3[Tool Recommendations Grid\nFiltered by style + age group]
        R3 --> R4[Study Tips Checklist\nTailored to primary style]
        R4 --> R5[CTA: GO TO MY LEARNING PATH →]
    end

    R5 --> C

    subgraph DASHBOARD ["🗺️ Personalized Learning Dashboard"]
        C --> D1[Sidebar — 4 Learner Module Links]
        D1 --> D2{Primary Style Module}
        D2 --> D3[👁️ Visual Module\nImages · Diagrams · Videos]
        D2 --> D4[👂 Auditory Module\nTTS · Listen · Speak · Echo]
        D2 --> D5[📖 Read/Write Module\nRead-Choice · Fill · Order · Short-Answer]
        D2 --> D6[✋ Kinesthetic Module\nBuild · Color · Maze · Garden Games]
        D3 & D4 & D5 & D6 --> D7[Duolingo Stage Path\nLesson → Chest → Practice → Trophy]
        D7 --> D8[Right Rail\nDaily Quests · Leaderboard · Style Spotlight]
        D8 --> D9[🤖 Ask Sparky — AI Chat Widget\nStreaming GPT · Style and Age Aware]
    end

    C --> GAMES([🎮 /learn/games — Brain Games Arcade])

    subgraph GAMES_ARCADE ["🎮 Brain Games Categories"]
        GAMES --> G1[🧠 Brain Teasers\nColor Crash · Path Finder]
        GAMES --> G2[⚡ Lightning Reflexes\nFlash Tap · Blink Gap]
        GAMES --> G3[🎯 Decision Making\nRisk Run · Trust Trade]
        GAMES --> G4[🔢 Pattern Learning\nPattern Path · Symbol Switch]
        GAMES --> G5[🤝 Social Emotional\nEmpathy Echo · Mood Mirror]
        GAMES --> G6[🛒 Consumer Behavior\nBrand Battle · Impulse Cart]
    end
```

---

### Assessment Scoring Detail

Each of the 8 questions maps its 4 answer options to a `StyleKey`:

| Example Option (Q1) | Maps to Style |
|---|---|
| "Watch the video showing how it works" | `visual` |
| "Listen to someone explain it to me" | `auditory` |
| "Read the instruction booklet" | `readwrite` |
| "Just start building it with my hands" | `kinesthetic` |

After all 8 answers are collected, the `scoreAssessment()` function in [`lib/assessment.ts`](lib/assessment.ts) tallies and ranks:

```typescript
const scores = { visual: 0, auditory: 0, readwrite: 0, kinesthetic: 0 }
for (const style of Object.values(answers)) {
  scores[style] += 1
}
const total = Object.values(scores).reduce((a, b) => a + b, 0)
const percentages = {
  visual:       Math.round((scores.visual / total) * 100),
  auditory:     Math.round((scores.auditory / total) * 100),
  readwrite:    Math.round((scores.readwrite / total) * 100),
  kinesthetic:  Math.round((scores.kinesthetic / total) * 100),
}
const ranked = (Object.keys(scores) as StyleKey[]).sort((a, b) => scores[b] - scores[a])
// ranked[0] === primaryStyle → drives all downstream content
```

### Question Modality Types

SparkPath delivers each question in a **different sensory modality** so the assessment itself samples every learning channel:

| Modality | Label | How It Works |
|---|---|---|
| `visual` | 👁️ LOOK | Image-based cards and visual scenario prompts |
| `audio` | 🔊 LISTEN | Auto-played TTS via `SpeechSynthesisUtterance`; replay button available |
| `text` | 📖 READ | Written passage the child reads silently, then answers |

---

## 🛠 Tech Stack & Dependencies

### Core Framework

| Package | Version | Role |
|---|---|---|
| `next` | 16.2.6 | App Router, SSR, and API Routes |
| `react` / `react-dom` | ^19 | UI rendering |
| `typescript` | 5.7.3 | End-to-end type safety |

### AI & Streaming

| Package | Version | Role |
|---|---|---|
| `ai` | ^6.0.205 | Vercel AI SDK — `streamText`, `convertToModelMessages` |
| `@ai-sdk/react` | ^3.0.207 | `useChat` hook for client-side streaming |

### UI & Styling

| Package | Version | Role |
|---|---|---|
| `tailwindcss` | ^4.2.0 | Utility-first CSS framework |
| `shadcn` / `@base-ui/react` | latest | Accessible headless component primitives |
| `framer-motion` / `motion` | ^12.40.0 | Page transitions and micro-animations |
| `lucide-react` | ^1.16.0 | Icon library |
| `class-variance-authority` | ^0.7.1 | Component variant management |
| `clsx` + `tailwind-merge` | latest | Conditional className composition |

### Additional Libraries

| Package | Role |
|---|---|
| `react-confetti` | Celebration animation on assessment completion |
| `react-speech-recognition` | Voice input in auditory learning module |
| `recharts` | Progress and score charts |
| `@vercel/analytics` | Production usage analytics |
| `regenerator-runtime` | Async/generator runtime support |

---

## 📦 Prerequisites & Installation

### Prerequisites

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9 or **pnpm** ≥ 8
- An **OpenAI-compatible API key** for the Sparky AI chat feature

### 1. Clone the Repository

```bash
git clone https://github.com/VipulMore11/Sparky.git
cd Sparky
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using pnpm (recommended — lock file included)
pnpm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# OpenAI or OpenAI-compatible API key
# The chat route uses model: "openai/gpt-5.4-mini"
OPENAI_API_KEY=sk-...your-key-here...
```

> **Note:** The Sparky AI chat (`/api/chat`) is the only feature requiring an API key. All assessment, learning modules, and games work fully offline without it.

### 4. Start the Development Server

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Build for Production

```bash
npm run build
npm run start
```

---

## 💻 Usage Examples

### Scoring the Assessment

```typescript
import { QUESTIONS, scoreAssessment, type Answers } from "@/lib/assessment"

const answers: Answers = {}
answers["q1"] = "visual"
answers["q2"] = "auditory"
// ... 8 answers total

const result = scoreAssessment(answers)
console.log(result.primary)      // "visual"
console.log(result.percentages)  // { visual: 50, auditory: 25, readwrite: 13, kinesthetic: 13 }
console.log(result.ranked)       // ["visual", "auditory", "readwrite", "kinesthetic"]
```

### Reading & Updating the Learner Profile

All profile state is managed through `useProfile()` — a custom hook backed by `localStorage`:

```typescript
import { useProfile } from "@/lib/use-profile"

function MyComponent() {
  const { profile, ready, update, reset } = useProfile()

  if (!ready) return <div>Loading...</div>

  // Read profile
  console.log(profile.name)         // "Alex"
  console.log(profile.primaryStyle) // "visual"
  console.log(profile.sparks)       // 50
  console.log(profile.ageGroup)     // "middle"

  // Award XP after completing a stage
  update({ sparks: profile.sparks + 10 })

  // Reset all data (retake assessment)
  reset()
}
```

### Getting Age-Matched Tool Recommendations

```typescript
import { RECOMMENDATIONS } from "@/lib/learning-styles"

// Tools for a visual, middle-school learner
const tools = RECOMMENDATIONS["visual"]["middle"]
// [
//   { name: "PhET Simulations", what: "Interactive science visuals",
//     how: "Drag the sliders and watch the diagram change in real time.", free: true },
//   { name: "Khan Academy", what: "Whiteboard video lessons",
//     how: "Watch the drawn-out steps, pause, and sketch them yourself.", free: true }
// ]
```

### Sending a Message to the Sparky AI Chat

```typescript
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport } from "ai"

const { messages, sendMessage, status } = useChat({
  transport: new DefaultChatTransport({
    api: "/api/chat",
    prepareSendMessagesRequest: ({ messages }) => ({
      body: {
        messages,
        context: {
          name: "Alex",
          style: "Visual Learner",
          ageGroup: "middle",
        },
      },
    }),
  }),
})

sendMessage({ text: "What apps are good for me?" })
// Sparky streams back a warm, 2-4 sentence tool recommendation
```

---

## 📡 API Documentation

### `POST /api/chat`

Streams a child-safe AI response from Sparky, the SparkPath mascot guide.

**Endpoint:** `POST /api/chat`  
**Max Duration:** 30 seconds (streaming)  
**Content-Type:** `application/json`

#### Request Body

```json
{
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "parts": [{ "type": "text", "text": "What apps are good for me?" }]
    }
  ],
  "context": {
    "name": "Alex",
    "style": "Visual Learner",
    "ageGroup": "middle"
  }
}
```

| Field | Type | Required | Description |
|---|---|---|---|
| `messages` | `UIMessage[]` | ✅ | Full conversation history (Vercel AI SDK `UIMessage` format) |
| `context.name` | `string` | ❌ | Child's first name or nickname (defaults to `"the learner"`) |
| `context.style` | `string` | ❌ | Primary learning style label (defaults to `"mixed"`) |
| `context.ageGroup` | `"early" \| "elementary" \| "middle" \| "teen"` | ❌ | Age group (defaults to `"unknown"`) |

#### Response

Returns a **streaming UI message response** (`text/event-stream`). Each SSE event delivers incremental text chunks. The client-side `useChat` hook processes these automatically.

#### System Prompt Rules

Sparky is instructed to:
- Guide on **HOW** to learn (tools, platforms, techniques) — never **WHAT** to study
- Keep replies to 2–4 sentences, warm and playful
- Use age-appropriate language (very simple for `early`/`elementary`)
- Never ask for personal information
- Stay in character as Sparky at all times
- No links; only name well-known platforms by name

#### Example Response (streamed)

```
"Hi Alex! For a visual learner like you, Khan Academy is amazing —
watch the colorful whiteboard videos and then try sketching what you saw.
PhET Simulations is also great for seeing science in action with sliders and graphs!"
```

#### Error Responses

| Status | Meaning |
|---|---|
| `400` | Malformed request body |
| `401` | Missing or invalid `OPENAI_API_KEY` |
| `500` | Upstream model error |

---

## 📁 Project Structure

```
stem-education-platform/
│
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout (fonts, metadata, analytics)
│   ├── page.tsx                  # Home → OnboardingFlow
│   ├── assessment/
│   │   └── page.tsx              # VARK assessment route → AssessmentFlow
│   ├── results/
│   │   └── page.tsx              # Results route → ResultsView
│   ├── learn/
│   │   ├── page.tsx              # Redirects to /learn/[primaryStyle]
│   │   ├── [style]/
│   │   │   └── page.tsx          # Learner module (visual/auditory/readwrite/kinesthetic)
│   │   └── games/
│   │       ├── page.tsx          # Brain Games arcade hub
│   │       ├── cognitive/        # Stroop Sprint, Trail Tracker
│   │       ├── perception-reaction/  # Flash Reflex, Blink Gap
│   │       ├── decision-making/  # Risk Run, Trust Trade
│   │       ├── learning-pattern/ # Pattern Path, Symbol Switch
│   │       ├── social-emotional/ # Empathy Echo, Mood Mirror
│   │       └── consumer-behavior/# Brand Battle, Impulse Cart
│   └── api/
│       └── chat/
│           └── route.ts          # Sparky AI streaming chat endpoint
│
├── components/
│   ├── assessment-flow.tsx       # 8-question VARK assessment UI
│   ├── onboarding-flow.tsx       # 7-step intro wizard
│   ├── results-view.tsx          # Style results, tools, tips
│   ├── flow-shell.tsx            # Shared shell for onboarding/assessment
│   ├── mascot.tsx                # Sparky mascot + SpeechBubble
│   ├── dashboard/
│   │   ├── dashboard-shell.tsx   # Sidebar + MobileNav wrapper
│   │   ├── sidebar.tsx           # Desktop sidebar + MobileModuleNav
│   │   ├── stage-path.tsx        # Duolingo-style winding stage map
│   │   ├── right-rail.tsx        # Daily quests, leaderboard, style spotlight
│   │   ├── mascot-chat.tsx       # Floating AI chat widget (Sparky)
│   │   ├── rw-lesson-player.tsx  # Read/Write lesson engine
│   │   └── rw-step-views.tsx     # Step renderers (choice/fill/order/short)
│   ├── visual/                   # Visual module interaction components
│   │   ├── VisualApp.tsx, ImageChoice.tsx, LabelDiagram.tsx
│   │   ├── MatchPairs.tsx, ReadChart.tsx, BuildPattern.tsx
│   │   ├── SequenceImages.tsx, FillBlankWithVisual.tsx
│   │   ├── SpotDifference.tsx, BlockReport.tsx
│   ├── auditory/                 # Auditory module interaction components
│   │   ├── AuditoryApp.tsx, ListenAndChoose.tsx, ListenAndMatch.tsx
│   │   ├── ListenAndSequence.tsx, Echo.tsx, SpeakShortAnswer.tsx
│   │   ├── RecordExplanation.tsx, DialogueDebate.tsx
│   │   └── TypeWriteFallback.tsx
│   ├── kinesthetic/              # Kinesthetic module games (18 components)
│   │   ├── KinestheticApp.tsx, ColorLab.tsx, BridgeBuilder.tsx
│   │   ├── WaterPath.tsx, AnimalHouse.tsx, Garden.tsx
│   │   ├── PuppyMaze.tsx, Playground.tsx, Results.tsx
│   │   ├── MiddleIceCream.tsx, MiddlePetRobot.tsx
│   │   ├── MiddleTreehouse.tsx, MiddleWaterPark.tsx
│   │   └── TeenDreamRoom.tsx, TeenEscapeRoom.tsx
│   │       TeenFoodTruck.tsx, TeenThemePark.tsx
│   └── ui/                       # shadcn/ui primitives (Button, Card, Badge…)
│
├── lib/
│   ├── assessment.ts             # QUESTIONS array + scoreAssessment()
│   ├── learning-styles.ts        # StyleKey types, LEARNING_STYLES,
│   │                             # RECOMMENDATIONS, STUDY_TIPS
│   ├── stages.ts                 # Stage definitions + getStages() per module
│   ├── rw-content.ts             # Age-grouped R/W lesson content (4 age tiers)
│   ├── rw-types.ts               # TypeScript types for R/W lesson steps
│   ├── rw-grading.ts             # Keyword-based short-answer grading logic
│   ├── auditory-levels.ts        # Auditory lesson content per age group
│   ├── visual-levels.ts          # Visual lesson content per age group
│   ├── visual-store.ts           # Visual module progress state
│   ├── kinesthetic-store.ts      # Kinesthetic module progress state
│   ├── use-profile.ts            # useProfile() hook — localStorage profile manager
│   └── utils.ts                  # cn() className helper
│
├── public/                       # Static assets
│   ├── mascot.png                # Sparky mascot image
│   ├── icon.svg / icon-*.png    # App icons (light/dark + Apple)
│   └── placeholder-*.svg/png    # Layout placeholder assets
│
├── Screenshots/                  # UI screenshots for documentation
├── next.config.mjs               # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
├── components.json               # shadcn/ui component registry config
├── postcss.config.mjs            # PostCSS + Tailwind setup
└── package.json                  # Dependencies and scripts
```

---

## 📸 UI Screenshots

### 1. Welcome / Onboarding — Sparky Introduction

<div align="center">
<img src="Screenshots/onboarding.png" alt="SparkPath Onboarding Screen — Sparky Welcome" width="700">
</div>

> Sparky greets the child, explains the platform's mission, and begins the 7-step onboarding flow. No sign-up, no password — everything is saved right on the device.

---

### 2. Assessment — VARK-Style Quiz

<div align="center">
<img src="Screenshots/assessment.png" alt="SparkPath VARK Assessment Screen" width="700">
</div>

> Each of the 8 questions is delivered in one of three modalities: visual prompt, TTS audio, or text passage. The child taps their best-fit answer from 4 styled option cards.

---

### 3. Results — Personalized Learning Profile

<div align="center">
<img src="Screenshots/results.png" alt="SparkPath Results Screen — Visual Learner" width="700">
</div>

> After the assessment, the child sees their primary learning style, a full learning-mix bar chart with all 4 style percentages, curated tool recommendations (filtered by style + age), and personalized study tips.

---

### 4. Learning Dashboard — Duolingo-Style Stage Path

<div align="center">
<img src="Screenshots/dashboard.png" alt="SparkPath Learning Dashboard" width="700">
</div>

> The main learning hub: a winding stage path unique to the child's primary style, with XP sparks, streak counter, hearts, daily quests, and a leaderboard unlock tracker in the right rail.

---

### 5. Sparky's Brain Games Arcade

<div align="center">
<img src="Screenshots/games.png" alt="Sparky's Brain Games Arcade" width="700">
</div>

> 12 research-valid mini-games across 6 categories. Each card shows game name, description, difficulty badge, duration, and a "Why play this?" rationale grounded in learning science.

---

### 6. Ask Sparky — AI Chat Widget

<div align="center">
<img src="Screenshots/sparky-chat.png" alt="Sparky AI Chat Widget" width="700">
</div>

> Floating AI chat panel powered by a streaming GPT endpoint. Sparky knows the child's name, learning style, and age group, and responds with warm, 2–4 sentence tool recommendations. Quick-reply suggestions are shown on first open.

---

## 🤝 Contribution Guide

We welcome contributions of all kinds — bug fixes, new brain games, new lesson content, accessibility improvements, and documentation!

### Getting Started

1. **Fork** the repository on GitHub
2. **Clone** your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/Sparky.git
   cd Sparky
   ```
3. **Create a feature branch:**
   ```bash
   git checkout -b feat/your-feature-name
   ```
4. **Install dependencies** and start the dev server:
   ```bash
   pnpm install && pnpm dev
   ```

### Development Guidelines

- **TypeScript is required** — all new files must be `.ts` or `.tsx` with proper typing
- **Follow the existing component pattern** — use `"use client"` only where client-side hooks are needed
- **Learning content** — never prescribe *what* to study; guide on *how* to learn and which tools help
- **Child safety first** — all text and AI prompts must be age-appropriate, encouraging, and safe
- **No new server-side state** — the app is intentionally zero-backend except for the chat API; profile state stays in `localStorage`
- **Respect the VARK framework** — new assessment questions must map all 4 options to unique `StyleKey` values

### Adding a New Brain Game

1. Create your game component under `app/learn/games/[category]/[game-name]/page.tsx`
2. Add the game entry to the `gameCategories` array in `app/learn/games/page.tsx`
3. Include `name`, `description`, `concept`, `difficulty`, `duration`, and `href`

### Adding New Read/Write Lesson Content

Age-grouped lesson content lives in [`lib/rw-content.ts`](lib/rw-content.ts). Each lesson follows this schema:

```typescript
{
  id: "rw-l4",
  title: "Your Lesson Title",
  subtitle: "Short description",
  xp: 20,
  steps: [
    { kind: "intro", title: "Step Title", body: "Intro text." },
    { kind: "read-choice", prompt: "Question?", options: ["A","B","C","D"], answer: 0 },
    { kind: "write-fill", prompt: "Fill: ___ is correct.", before: "", after: "", answers: ["answer"] },
    { kind: "write-short", prompt: "Explain...", keywords: ["key1","key2"], minKeywords: 1 },
  ]
}
```

### Submitting a Pull Request

1. Ensure no TypeScript errors: `npm run build`
2. Lint your code: `npm run lint`
3. Write a clear PR description explaining *what* changed and *why*
4. Reference any related issues with `Closes #<issue-number>`

### Reporting Issues

Please use [GitHub Issues](https://github.com/VipulMore11/Sparky/issues) and include:
- Your environment (OS, Node version, browser)
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if relevant

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2026 VipulMore11

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

<div align="center">

Built with ❤️ for every child who was told they weren't trying hard enough — when really, they just needed to learn differently.

**[⭐ Star this repo](https://github.com/VipulMore11/Sparky)** if Sparky sparks something in you!

</div>
