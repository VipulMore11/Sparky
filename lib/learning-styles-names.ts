export type LearningMixStyle = {
  id: string
  name: string
  color: string
}

export const LEARNING_MIX_STYLES: LearningMixStyle[] = [
  { id: "seeImagine", name: "See & Imagine", color: "#58CC71" }, // Green (Visual)
  { id: "listenSpeak", name: "Listen & Speak", color: "#1CB0F6" }, // Blue (Auditory)
  { id: "readWrite", name: "Read & Write", color: "#FF9600" }, // Orange (Read/Write)
  { id: "handsOnExplore", name: "Hands-On Explore", color: "#CE82FF" }, // Purple (Kinesthetic)
]
