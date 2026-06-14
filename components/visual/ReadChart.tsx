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
        <div className="h-64 w-full bg-card rounded-3xl p-4 text-foreground border-4 border-border shadow-sm">
          <ResponsiveContainer width="100%" height="100%">
            {level.chartType === "bar" ? (
              <BarChart data={level.chartData}>
                <XAxis dataKey="name" tick={{ fontSize: 24, fill: "var(--foreground)" }} />
                <Tooltip cursor={{fill: 'var(--muted)'}} />
                <Bar dataKey="value" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            ) : level.chartType === "line" ? (
              <LineChart data={level.chartData}>
                <XAxis dataKey="name" tick={{ fill: "var(--foreground)" }} />
                <YAxis tick={{ fill: "var(--foreground)" }} />
                <Tooltip />
                <Line type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={4} />
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
                      ? "border-destructive bg-destructive/10 text-destructive animate-[shake_0.5s_ease-in-out]"
                      : "border-primary bg-primary/10 text-foreground shadow-[0_4px_0_var(--color-primary-shadow)] translate-y-[-4px]"
                    : "border-border bg-card text-muted-foreground hover:bg-muted shadow-sm"
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
