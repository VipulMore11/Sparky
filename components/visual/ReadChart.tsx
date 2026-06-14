"use client"
import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts"
import { InteractionLayout } from "./InteractionLayout"
import type { VisualInteractionProps } from "./types"

export function ReadChart(props: VisualInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [selected, setSelected] = useState<string | null>(null)
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")

  const handleCheck = () => {
    if (selected === level.correctAnswer) {
      setStatus("correct")
      onComplete(100)
    } else {
      setStatus("incorrect")
    }
  }

  const handleContinue = () => {
    if (status === "correct") onNext()
    else {
      setStatus("idle")
      setSelected(null)
    }
  }

  const COLORS = ['#1CB0F6', '#58CC71', '#FF4B4B', '#FF9600']

  return (
    <InteractionLayout
      question={level.question}
      ttsSpeak={ttsSpeak || (() => {})}
      onSkip={() => {
        onComplete(0)
        onNext()
      }}
      onCheck={handleCheck}
      onContinue={handleContinue}
      canCheck={selected !== null}
      status={status}
      progress={props.progress}
      onClose={props.onClose}
    >
      <div className="flex flex-col gap-8 w-full max-w-xl">
        
        {/* Chart Area */}
        <div className="h-64 w-full bg-white rounded-3xl p-4 text-black border-4 border-[#37464f]">
          <ResponsiveContainer width="100%" height="100%">
            {level.chartType === "bar" ? (
              <BarChart data={level.chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 24 }} />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#1CB0F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : level.chartType === "line" ? (
              <LineChart data={level.chartData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="#1CB0F6" strokeWidth={4} />
              </LineChart>
            ) : level.chartType === "pie" ? (
              <PieChart>
                <Pie data={level.chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {level.chartData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            ) : <div />}
          </ResponsiveContainer>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-3">
          {level.options?.map((opt, i) => {
            const isWrong = status === "incorrect" && selected === opt
            return (
              <button
                key={i}
                onClick={() => status === "idle" && setSelected(opt)}
                className={`w-full text-left px-6 py-4 rounded-2xl text-xl font-bold transition-all border-4 ${
                  selected === opt
                    ? isWrong
                      ? "border-[#ea2b2b] bg-[#ffdfe0] text-[#ea2b2b] animate-[shake_0.5s_ease-in-out]"
                      : "border-[#1CB0F6] bg-[#1CB0F6]/10 text-white shadow-[0_4px_0_#1899D6] translate-y-[-4px]"
                    : "border-[#37464f] bg-[#202f36] text-[#52656d] hover:bg-[#37464f] shadow-[0_4px_0_#131f24]"
                }`}
              >
                {opt}
              </button>
            )
          })}
        </div>

      </div>
    </InteractionLayout>
  )
}
