import type { AgeGroup } from "./learning-styles"

export type VisualInteractionType =
  | "ImageChoice"
  | "LabelDiagram"
  | "SequenceImages"
  | "SpotDifference"
  | "MatchPairs"
  | "FillBlankWithVisual"
  | "ReadChart"
  | "BuildPattern"

export interface VisualLevel {
  id: number
  block: number // 0 to 3
  topic: string
  interactionType: VisualInteractionType
  question: string
  // Props for ImageChoice / FillBlankWithVisual / BuildPattern
  options?: string[]
  correctAnswer?: string
  // Props for LabelDiagram
  diagramType?: "House" | "Tree" | "Flower" | "SolarSystem"
  dropZones?: { id: string; x: number; y: number; label: string }[]
  // Props for SequenceImages
  sequenceItems?: string[]
  expectedSequence?: string[]
  // Props for SpotDifference
  spotBase?: string
  spotDiff?: string
  spotDiffIndex?: number
  spotGridSize?: number
  // Props for MatchPairs
  matchPairs?: { id: string; image: string; text: string }[]
  // Props for ReadChart
  chartData?: any[]
  chartType?: "bar" | "line" | "pie"
  // Props for BuildPattern
  patternSequence?: string[]
}

export function getVisualLevels(ageGroup: AgeGroup | null): VisualLevel[] {
  const isEarly = ageGroup === "early"
  const isMiddle = ageGroup === "elementary"

  const levels: VisualLevel[] = [
    // BLOCK 1: Shapes & Patterns (Levels 0-4)
    {
      id: 0,
      block: 0,
      topic: "Identify Shapes",
      interactionType: "ImageChoice",
      question: "Which shape is a circle?",
      options: ["🟦", "🟩", "🔴", "🔺"],
      correctAnswer: "🔴",
    },
    {
      id: 1,
      block: 0,
      topic: "Match Shape to Name",
      interactionType: "MatchPairs",
      question: "Match the shape to its name.",
      matchPairs: [
        { id: "1", image: "🔴", text: "Circle" },
        { id: "2", image: "🔺", text: "Triangle" },
        { id: "3", image: "🟦", text: "Square" },
      ],
    },
    {
      id: 2,
      block: 0,
      topic: "Sequence Shapes",
      interactionType: "SequenceImages",
      question: "Order the shapes by number of sides (fewest to most).",
      sequenceItems: ["🟦", "🔵", "🔺"],
      expectedSequence: ["🔵", "🔺", "🟦"], // Circle (0), Triangle (3), Square (4)
    },
    {
      id: 3,
      block: 0,
      topic: "Spot the Difference",
      interactionType: "SpotDifference",
      question: "Which pattern is different?",
      spotBase: "🟦",
      spotDiff: "🟪",
      spotDiffIndex: 3,
      spotGridSize: 5,
    },
    {
      id: 4,
      block: 0,
      topic: "Build a Pattern",
      interactionType: "BuildPattern",
      question: "What comes next in the pattern?",
      patternSequence: ["🔴", "🟦", "🔴", "🟦", "🔴"],
      options: ["🔴", "🟦", "🟩", "🔺"],
      correctAnswer: "🟦",
    },

    // BLOCK 2: Light & Colour (Levels 5-9)
    {
      id: 5,
      block: 1,
      topic: "Identify Colors",
      interactionType: "ImageChoice",
      question: "Which apple is green?",
      options: ["🍎", "🍏"],
      correctAnswer: "🍏",
    },
    {
      id: 6,
      block: 1,
      topic: "Missing Color",
      interactionType: "FillBlankWithVisual",
      question: "Fill the blank with the warm color.",
      patternSequence: ["❄️", "🧊", "?"],
      options: ["🔥", "💧", "🌧️", "💨"],
      correctAnswer: "🔥",
    },
    {
      id: 7,
      block: 1,
      topic: "Color Mix Pairs",
      interactionType: "MatchPairs",
      question: "Match the mix to the result.",
      matchPairs: [
        { id: "1", image: "🔴 + 🟡", text: "🟠 Orange" },
        { id: "2", image: "🔵 + 🟡", text: "🟢 Green" },
        { id: "3", image: "🔴 + 🔵", text: "🟣 Purple" },
      ],
    },
    {
      id: 8,
      block: 1,
      topic: "Spot Color Difference",
      interactionType: "SpotDifference",
      question: "Spot the slightly different shade.",
      spotBase: "🟢",
      spotDiff: "🟩",
      spotDiffIndex: 7,
      spotGridSize: 9,
    },
    {
      id: 9,
      block: 1,
      topic: "Light Sources",
      interactionType: "LabelDiagram",
      question: "Label the light sources.",
      diagramType: "House",
      dropZones: [
        { id: "sun", x: 10, y: 10, label: "☀️ Sun" },
        { id: "lamp", x: 70, y: 60, label: "💡 Lamp" },
      ],
    },

    // BLOCK 3: Diagrams & Maps (Levels 10-14)
    {
      id: 10,
      block: 2,
      topic: "Map Symbols",
      interactionType: "ImageChoice",
      question: "Which symbol means 'Hospital'?",
      options: ["🏥", "🏦", "🏨", "🏫"],
      correctAnswer: "🏥",
    },
    {
      id: 11,
      block: 2,
      topic: "Tree Diagram",
      interactionType: "LabelDiagram",
      question: "Label the parts of the tree.",
      diagramType: "Tree",
      dropZones: [
        { id: "leaves", x: 50, y: 20, label: "Leaves 🍃" },
        { id: "trunk", x: 50, y: 60, label: "Trunk 🪵" },
        { id: "roots", x: 50, y: 90, label: "Roots 🪢" },
      ],
    },
    {
      id: 12,
      block: 2,
      topic: "Weather Map",
      interactionType: "MatchPairs",
      question: "Match the weather symbol to its meaning.",
      matchPairs: [
        { id: "1", image: "☀️", text: "Sunny" },
        { id: "2", image: "🌧️", text: "Rain" },
        { id: "3", image: "🌩️", text: "Storm" },
      ],
    },
    {
      id: 13,
      block: 2,
      topic: "Process Sequence",
      interactionType: "SequenceImages",
      question: "Order the life cycle of a butterfly.",
      sequenceItems: ["🦋", "🐛", "🥚"],
      expectedSequence: ["🥚", "🐛", "🦋"],
    },
    {
      id: 14,
      block: 2,
      topic: "Find the Path",
      interactionType: "FillBlankWithVisual",
      question: "Which piece completes the path?",
      patternSequence: ["🛤️", "🛤️", "?"],
      options: ["🛤️", "🛑", "🚧", "🌲"],
      correctAnswer: "🛤️",
    },

    // BLOCK 4: Data Visualisation (Levels 15-19)
    {
      id: 15,
      block: 3,
      topic: "Read the Chart",
      interactionType: "ReadChart",
      question: "Which fruit is the most popular?",
      chartType: "bar",
      chartData: [
        { name: "🍎", value: 4 },
        { name: "🍌", value: 7 },
        { name: "🍇", value: 3 },
      ],
      options: ["🍎 Apple", "🍌 Banana", "🍇 Grapes"],
      correctAnswer: "🍌 Banana",
    },
    {
      id: 16,
      block: 3,
      topic: "Temperature Line",
      interactionType: "ReadChart",
      question: "Which day was the hottest?",
      chartType: "line",
      chartData: [
        { name: "Mon", value: 20 },
        { name: "Tue", value: 25 },
        { name: "Wed", value: 22 },
        { name: "Thu", value: 28 },
      ],
      options: ["Mon", "Tue", "Wed", "Thu"],
      correctAnswer: "Thu",
    },
    {
      id: 17,
      block: 3,
      topic: "Pie Chart Portions",
      interactionType: "ReadChart",
      question: "Which section is exactly half?",
      chartType: "pie",
      chartData: [
        { name: "Blue", value: 50 },
        { name: "Red", value: 25 },
        { name: "Green", value: 25 },
      ],
      options: ["Blue", "Red", "Green"],
      correctAnswer: "Blue",
    },
    {
      id: 18,
      block: 3,
      topic: "Data Sequence",
      interactionType: "SequenceImages",
      question: "Order the groups from smallest to largest.",
      sequenceItems: ["🔴🔴🔴", "🔴", "🔴🔴"],
      expectedSequence: ["🔴", "🔴🔴", "🔴🔴🔴"],
    },
    {
      id: 19,
      block: 3,
      topic: "Data Pattern",
      interactionType: "BuildPattern",
      question: "Follow the growing pattern. What comes next?",
      patternSequence: ["📏", "📏📏", "📏📏📏"],
      options: ["📏", "📏📏", "📏📏📏📏", "🛑"],
      correctAnswer: "📏📏📏📏",
    },
  ]

  // Simplify for early learners if necessary
  if (isEarly) {
    levels.forEach((l) => {
      // Simplifications if needed (e.g., replace ReadChart with simple image choices)
      if (l.interactionType === "ReadChart") {
        l.interactionType = "ImageChoice"
        l.question = "Tap the biggest fruit stack!"
        l.options = ["🍎🍎", "🍎🍎🍎🍎🍎", "🍎"]
        l.correctAnswer = "🍎🍎🍎🍎🍎"
      }
    })
  }

  return levels
}
