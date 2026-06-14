"use client"

import React, { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Step } from "@/lib/rw-types"
import { Lightbulb, Info } from "lucide-react"

interface StepViewProps {
  step: Step
  answer: unknown
  setAnswer: (ans: unknown) => void
  locked: boolean
  correct: boolean | null
  onHint: () => void
}

export function RWStepViews({ step, answer, setAnswer, locked, correct, onHint }: StepViewProps) {
  if (step.kind === "intro") return null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          {step.kind !== "match" && step.kind !== "read-order" && step.passage && (
            <div className="mb-6 rounded-2xl bg-muted p-5 text-lg leading-relaxed text-foreground/90 border-2 border-border">
              {step.passage}
            </div>
          )}
          <h3 className="text-xl font-extrabold text-foreground">{step.prompt}</h3>
        </div>
      </div>

      <div className="mt-2">
        {step.kind === "read-choice" && (
          <ReadChoiceView step={step} answer={answer as number | null} setAnswer={setAnswer} locked={locked} correct={correct} />
        )}
        {step.kind === "read-order" && (
          <ReadOrderView step={step} answer={answer as string[]} setAnswer={setAnswer} locked={locked} correct={correct} />
        )}
        {step.kind === "write-short" && (
          <WriteShortView step={step} answer={answer as string} setAnswer={setAnswer} locked={locked} correct={correct} onHint={onHint} />
        )}
        {step.kind === "write-fill" && (
          <WriteFillView step={step} answer={answer as string} setAnswer={setAnswer} locked={locked} correct={correct} />
        )}
        {step.kind === "match" && (
          <MatchView step={step} answer={answer as Record<string, string>} setAnswer={setAnswer} locked={locked} correct={correct} />
        )}
      </div>
    </div>
  )
}

function ReadChoiceView({ step, answer, setAnswer, locked, correct }: any) {
  return (
    <div className="flex flex-col gap-3">
      {step.options.map((opt: string, i: number) => {
        const isSelected = answer === i
        const isCorrectOption = correct && isSelected
        const isWrongOption = correct === false && isSelected

        return (
          <button
            key={i}
            disabled={locked}
            onClick={() => setAnswer(i)}
            className={cn(
              "flex min-h-[64px] w-full items-center justify-between rounded-2xl border-2 p-4 text-left font-bold transition-all",
              isSelected ? "border-primary bg-primary/10 ring-4 ring-primary/20" : "border-border bg-card hover:border-primary/50",
              locked && !isSelected && "opacity-50",
              isCorrectOption && "border-success bg-success/10 text-success ring-success/20",
              isWrongOption && "border-destructive bg-destructive/10 text-destructive ring-destructive/20"
            )}
          >
            <span className="text-lg">{opt}</span>
            <div className={cn(
              "flex size-6 shrink-0 items-center justify-center rounded-full border-2",
              isSelected ? "border-primary bg-primary" : "border-muted-foreground/30",
              isCorrectOption && "border-success bg-success",
              isWrongOption && "border-destructive bg-destructive"
            )}>
              {isSelected && <div className="size-2.5 rounded-full bg-background" />}
            </div>
          </button>
        )
      })}
    </div>
  )
}

function ReadOrderView({ step, answer = [], setAnswer, locked, correct }: any) {
  const [pool, setPool] = useState<string[]>([])
  
  // Initialize shuffled pool
  useEffect(() => {
    if (!locked && (answer || []).length === 0 && pool.length === 0) {
      const shuffled = [...step.items].sort(() => Math.random() - 0.5)
      setPool(shuffled)
    }
  }, [step.items, locked, answer, pool.length])

  const handlePoolClick = (item: string) => {
    if (locked) return
    setPool(pool.filter(i => i !== item))
    setAnswer([...(answer || []), item])
  }

  const handleAnswerClick = (item: string) => {
    if (locked) return
    setAnswer((answer || []).filter((i: string) => i !== item))
    setPool([...pool, item])
  }

  return (
    <div className="flex flex-col gap-6">
      {step.passage && (
        <div className="rounded-2xl bg-muted p-5 text-lg leading-relaxed text-foreground/90 border-2 border-border">
          {step.passage}
        </div>
      )}
      <div className="flex flex-col gap-2 min-h-[120px] rounded-2xl border-2 border-dashed border-border bg-muted/30 p-4">
        {(answer || []).length === 0 && <span className="text-muted-foreground font-semibold text-center mt-6">Tap items below to add them in order</span>}
        {(answer || []).map((item: string, i: number) => (
          <button
            key={`ans-${i}`}
            onClick={() => handleAnswerClick(item)}
            disabled={locked}
            className={cn(
              "flex min-h-[56px] w-full items-center gap-4 rounded-xl border-2 border-primary bg-primary/10 px-4 text-left font-bold text-primary transition-all",
              correct === false && "border-destructive bg-destructive/10 text-destructive"
            )}
          >
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-background text-sm">
              {i + 1}
            </span>
            {item}
          </button>
        ))}
      </div>
      
      {pool.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {pool.map((item, i) => (
            <button
              key={`pool-${i}`}
              onClick={() => handlePoolClick(item)}
              disabled={locked}
              className="rounded-xl border-2 border-border bg-card px-4 py-3 font-bold hover:border-primary/50 transition-all active:translate-y-1"
            >
              {item}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

function WriteShortView({ step, answer = "", setAnswer, locked, correct, onHint }: any) {
  const [showHint, setShowHint] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <textarea
        value={answer || ""}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={locked}
        placeholder="Type your answer here..."
        className={cn(
          "min-h-[160px] w-full resize-y rounded-2xl border-2 border-border bg-card p-5 text-lg font-medium outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary focus:ring-4 focus:ring-primary/20",
          correct === false && "border-destructive focus:border-destructive focus:ring-destructive/20"
        )}
      />
      {!locked && step.hintText && (
        <div>
          {!showHint ? (
            <Button
              variant="ghost"
              onClick={() => {
                setShowHint(true)
                onHint()
              }}
              className="text-primary font-bold"
            >
              <Lightbulb className="mr-2 size-5" />
              Need a hint?
            </Button>
          ) : (
            <div className="flex items-start gap-3 rounded-xl bg-primary/10 p-4 text-primary font-medium">
              <Info className="size-6 shrink-0" />
              <p>{step.hintText}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function WriteFillView({ step, answer = "", setAnswer, locked, correct }: any) {
  return (
    <div className="flex flex-wrap items-center gap-3 text-xl font-medium leading-loose">
      {step.before && <span>{step.before}</span>}
      <input
        type="text"
        value={answer || ""}
        onChange={(e) => setAnswer(e.target.value)}
        disabled={locked}
        className={cn(
          "w-48 rounded-xl border-b-4 border-l-2 border-r-2 border-t-2 border-border bg-card px-4 py-2 font-bold text-primary outline-none transition-all focus:border-primary",
          correct === false && "border-destructive text-destructive"
        )}
      />
      {step.after && <span>{step.after}</span>}
    </div>
  )
}

function MatchView({ step, answer = {}, setAnswer, locked, correct }: any) {
  const [leftSelected, setLeftSelected] = useState<string | null>(null)
  
  // Shuffle right items initially
  const [rightItems, setRightItems] = useState<{ id: string; text: string }[]>([])
  
  useEffect(() => {
    if (rightItems.length === 0) {
      const rights = step.pairs.map((p: any) => ({ id: p.right, text: p.right }))
      setRightItems(rights.sort(() => Math.random() - 0.5))
    }
  }, [step.pairs, rightItems.length])

  const handleLeftClick = (leftText: string) => {
    if (locked) return
    // If it's already paired, unpair it
    if (answer[leftText]) {
      const newAns = { ...answer }
      delete newAns[leftText]
      setAnswer(newAns)
      setLeftSelected(null)
      return
    }
    setLeftSelected(leftSelected === leftText ? null : leftText)
  }

  const handleRightClick = (rightText: string) => {
    if (locked || !leftSelected) return
    
    // Pair them up
    setAnswer({ ...answer, [leftSelected]: rightText })
    setLeftSelected(null)
  }

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Left Column */}
      <div className="flex flex-col gap-3">
        {step.pairs.map((p: any, i: number) => {
          const isPaired = !!answer[p.left]
          const isSelected = leftSelected === p.left
          const pairedRight = answer[p.left]
          
          return (
            <div key={`l-${i}`} className="flex flex-col gap-2">
              <button
                onClick={() => handleLeftClick(p.left)}
                disabled={locked}
                className={cn(
                  "min-h-[64px] rounded-xl border-2 p-3 text-center font-bold transition-all",
                  isPaired ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card hover:border-primary/50",
                  isSelected && "border-primary ring-4 ring-primary/20",
                  correct === false && isPaired && "border-destructive bg-destructive text-destructive-foreground"
                )}
              >
                {p.left}
              </button>
            </div>
          )
        })}
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-3">
        {rightItems.map((r, i) => {
          // Find if this right item is used in any pairing
          const pairedLeft = Object.keys(answer).find(k => answer[k] === r.text)
          const isPaired = !!pairedLeft

          return (
            <button
              key={`r-${i}`}
              onClick={() => handleRightClick(r.text)}
              disabled={locked || (isPaired && !locked)} // if paired, can't click right side directly, must click left to unpair
              className={cn(
                "min-h-[64px] rounded-xl border-2 p-3 text-center font-bold transition-all",
                isPaired ? "border-primary bg-primary/10 text-primary" : "border-border bg-card hover:border-primary/50",
                correct === false && isPaired && "border-destructive bg-destructive/10 text-destructive",
                !isPaired && leftSelected && "border-primary/50 animate-pulse"
              )}
            >
              {isPaired ? (
                <span className="flex flex-col items-center gap-1">
                  <span className="text-xs uppercase text-primary/70 font-extrabold">{pairedLeft}</span>
                  <span>{r.text}</span>
                </span>
              ) : (
                r.text
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
