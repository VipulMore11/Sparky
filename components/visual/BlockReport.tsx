"use client"
import { useState, useEffect } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import Confetti from "react-confetti"

export function BlockReport({ scores, onClose, isFinal }: { scores: number[]; onClose: () => void; isFinal?: boolean }) {
  const [showConfetti, setShowConfetti] = useState(isFinal)

  // Radar data
  // Visual learning averages mock
  const data = [
    { subject: "Pattern Recognition", A: 100 },
    { subject: "Diagram Interpretation", A: 100 },
    { subject: "Visual Memory", A: 100 },
  ]

  // Calculate actual mock based on scores array 
  // In reality, each level would map to a skill, but we just use the scores array to determine the total
  const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1)
  
  // adjust radar based on average (just for visuals)
  data[0].A = Math.max(50, avg)
  data[1].A = Math.max(40, avg - 5)
  data[2].A = Math.max(60, avg + 5)

  let label = "Medium"
  let message = "Mix visual aids with other methods for best results."
  if (avg > 80) {
    label = "High"
    message = "You learn best through visuals! Use diagrams, color-coded notes, and infographics."
  } else if (avg < 50) {
    label = "Low"
    message = "Try adding more hands-on or auditory elements to reinforce visual content."
  }

  return (
    <div className="fixed inset-0 z-[200] flex flex-col bg-[#131f24] font-sans text-white p-4 items-center justify-center">
      {showConfetti && <Confetti recycle={false} onConfettiComplete={() => setShowConfetti(false)} />}
      
      <div className="w-full max-w-lg bg-[#202f36] border-4 border-[#37464f] rounded-3xl p-8 flex flex-col items-center">
        <h2 className="text-3xl font-extrabold text-[#1CB0F6] mb-2 uppercase tracking-wide">
          {isFinal ? "Path Complete!" : "Block Complete!"}
        </h2>
        <p className="text-[#52656d] font-bold text-lg mb-8">Here's your Visual Learning Profile</p>

        <div className="w-full h-64 bg-[#131f24] rounded-2xl mb-8">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
              <PolarGrid stroke="#37464f" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: '#52656d', fontSize: 12, fontWeight: 'bold' }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar name="Score" dataKey="A" stroke="#1CB0F6" fill="#1CB0F6" fillOpacity={0.5} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-[#131f24] p-4 rounded-2xl border-2 border-[#37464f] w-full mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-[#52656d]">Visual Affinity</span>
            <span className={`font-extrabold text-xl ${label === 'High' ? 'text-[#58cc02]' : label === 'Medium' ? 'text-[#ff9600]' : 'text-[#ea2b2b]'}`}>{label}</span>
          </div>
          <p className="text-sm font-semibold text-white/80">{message}</p>
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl font-extrabold text-xl uppercase transition-all bg-[#1CB0F6] text-white hover:bg-[#1899D6] shadow-[0_4px_0_#1899D6] active:shadow-none active:translate-y-1"
        >
          {isFinal ? "FINISH" : "CONTINUE"}
        </button>
      </div>
    </div>
  )
}
