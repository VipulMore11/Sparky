import type { AgeGroup } from "./learning-styles"

export type InteractionType =
  | "ListenAndChoose"
  | "ListenAndMatch"
  | "ListenAndSequence"
  | "Echo"
  | "SpeakShortAnswer"
  | "RecordExplanation"
  | "DialogueDebate"
  | "TypeWriteFallback"

export interface AuditoryLevel {
  id: number
  block: number // 0 to 3
  topic: string
  interactionType: InteractionType
  question: string
  options?: string[]
  correctAnswer?: string
  expectedSequence?: string[]
  matchPairs?: { sound: string; image: string }[]
  expectedKeywords?: string[]
  echoPhrase?: string
  aiScript?: string[]
}

export function getAuditoryLevels(ageGroup: AgeGroup | null): AuditoryLevel[] {
  const isEarly = ageGroup === "early"
  const isMiddle = ageGroup === "elementary"
  // For older users, we include speaking and debating.
  // For younger users, we downgrade speaking tasks to tap-based tasks.

  const levels: AuditoryLevel[] = [
    // BLOCK 1: Sound & Vibration (0-4)
    {
      id: 0,
      block: 0,
      topic: "What makes sound?",
      interactionType: "ListenAndChoose",
      question: "Which animal makes a roaring sound?",
      options: ["lion", "elephant", "giraffe"],
      correctAnswer: "lion",
    },
    {
      id: 1,
      block: 0,
      topic: "Matching Sounds",
      interactionType: "ListenAndMatch",
      question: "Match the sound to the picture.",
      matchPairs: [
        { sound: "Meow", image: "cat" },
        { sound: "Woof", image: "dog" },
      ],
    },
    {
      id: 2,
      block: 0,
      topic: "Sound Sequence",
      interactionType: "ListenAndSequence",
      question: "Put the sounds in order: Bell, Drum, Whistle",
      options: ["Bell", "Drum", "Whistle"],
      expectedSequence: ["Bell", "Drum", "Whistle"],
    },
    {
      id: 3,
      block: 0,
      topic: "Echo Word",
      interactionType: "Echo",
      question: "Say the word you hear!",
      echoPhrase: "vibration",
    },
    {
      id: 4,
      block: 0,
      topic: "Sound Concept",
      interactionType: isEarly ? "ListenAndChoose" : "SpeakShortAnswer",
      question: "What do we call the back-and-forth movement that creates sound?",
      expectedKeywords: ["vibration", "shake"],
      options: ["vibration", "color", "light"],
      correctAnswer: "vibration",
    },

    // BLOCK 2: Water Cycle (5-9)
    {
      id: 5,
      block: 1,
      topic: "Rain Sounds",
      interactionType: "ListenAndChoose",
      question: "Which sound means it's raining?",
      options: ["Thunder", "Splashing drops", "Wind blowing"],
      correctAnswer: "Splashing drops",
    },
    {
      id: 6,
      block: 1,
      topic: "Water Match",
      interactionType: "ListenAndMatch",
      question: "Match the water state to its sound.",
      matchPairs: [
        { sound: "Bubbling", image: "boiling" },
        { sound: "Cracking", image: "ice" },
      ],
    },
    {
      id: 7,
      block: 1,
      topic: "Cycle Order",
      interactionType: "ListenAndSequence",
      question: "Order the water cycle steps:",
      options: ["Evaporation", "Condensation", "Precipitation"],
      expectedSequence: ["Evaporation", "Condensation", "Precipitation"],
    },
    {
      id: 8,
      block: 1,
      topic: "Echo Concept",
      interactionType: "Echo",
      question: "Repeat this important word!",
      echoPhrase: "evaporation",
    },
    {
      id: 9,
      block: 1,
      topic: "Explain the Cycle",
      interactionType: isEarly || isMiddle ? "SpeakShortAnswer" : "RecordExplanation",
      question: "How does rain form in the clouds?",
      expectedKeywords: ["clouds", "heavy", "drop", "water"],
    },

    // BLOCK 3: Simple Machines (10-14)
    {
      id: 10,
      block: 2,
      topic: "Machine Sounds",
      interactionType: "ListenAndChoose",
      question: "Which of these is a simple machine?",
      options: ["Lever", "Car", "Computer"],
      correctAnswer: "Lever",
    },
    {
      id: 11,
      block: 2,
      topic: "Machine Action",
      interactionType: "ListenAndMatch",
      question: "Match the machine to what it does.",
      matchPairs: [
        { sound: "Lifting", image: "Pulley" },
        { sound: "Rolling", image: "Wheel" },
      ],
    },
    {
      id: 12,
      block: 2,
      topic: "Pulley Setup",
      interactionType: "ListenAndSequence",
      question: "How do you use a pulley? Order the steps:",
      options: ["Attach rope", "Pull down", "Lift object"],
      expectedSequence: ["Attach rope", "Pull down", "Lift object"],
    },
    {
      id: 13,
      block: 2,
      topic: "Echo Term",
      interactionType: "Echo",
      question: "Repeat after me:",
      echoPhrase: "fulcrum",
    },
    {
      id: 14,
      block: 2,
      topic: "Machine Debate",
      interactionType: isEarly || isMiddle ? "SpeakShortAnswer" : "DialogueDebate",
      question: "Which simple machine is the most useful everyday?",
      expectedKeywords: ["wheel", "inclined plane", "lever"],
      aiScript: ["I think the wheel is best. What do you think?", "Interesting choice! Why is that?", "That makes sense!"],
    },

    // BLOCK 4: Ecosystems (15-19)
    {
      id: 15,
      block: 3,
      topic: "Forest Sounds",
      interactionType: "ListenAndChoose",
      question: "Which of these is a living part of a forest?",
      options: ["Rock", "Tree", "River"],
      correctAnswer: "Tree",
    },
    {
      id: 16,
      block: 3,
      topic: "Animal Match",
      interactionType: "ListenAndMatch",
      question: "Match the animal to its habitat.",
      matchPairs: [
        { sound: "Frog croak", image: "Pond" },
        { sound: "Bird chirp", image: "Tree" },
      ],
    },
    {
      id: 17,
      block: 3,
      topic: "Food Chain",
      interactionType: "ListenAndSequence",
      question: "Order the food chain from smallest to largest:",
      options: ["Grass", "Rabbit", "Fox"],
      expectedSequence: ["Grass", "Rabbit", "Fox"],
    },
    {
      id: 18,
      block: 3,
      topic: "Echo Ecosystem",
      interactionType: "Echo",
      question: "Say the word loudly:",
      echoPhrase: "ecosystem",
    },
    {
      id: 19,
      block: 3,
      topic: "Save the Earth",
      interactionType: isEarly || isMiddle ? "SpeakShortAnswer" : "RecordExplanation",
      question: "Why is it important to protect our ecosystems?",
      expectedKeywords: ["animals", "plants", "balance", "home", "earth"],
    },
  ]

  // For 3-5 year olds, downgrade SpeakShortAnswer to Echo since it doesn't do STT well.
  if (isEarly) {
    levels.forEach(l => {
      if (l.interactionType === "SpeakShortAnswer") {
        l.interactionType = "Echo"
        l.echoPhrase = l.expectedKeywords?.[0] || "good job"
      }
    })
  }

  return levels
}
