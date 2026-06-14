import { useState, useEffect } from "react"
import type { AuditoryInteractionProps } from "./types"
import { InteractionLayout } from "./InteractionLayout"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"

export function DialogueDebate(props: AuditoryInteractionProps) {
  const { level, onComplete, onNext, ttsSpeak } = props
  const [messages, setMessages] = useState<{ sender: "ai" | "user"; text: string }[]>([])
  const [inputText, setInputText] = useState("")
  const [turn, setTurn] = useState(0)
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle")

  const aiScript = level.aiScript || ["I think that's true. What about you?"]

  useEffect(() => {
    if (messages.length === 0) {
      const firstAiMsg = aiScript[0]
      setMessages([{ sender: "ai", text: firstAiMsg }])
      ttsSpeak(firstAiMsg)
    }
  }, [messages.length, aiScript, ttsSpeak])

  const handleSend = () => {
    if (!inputText.trim()) return

    const newMsgs = [...messages, { sender: "user" as const, text: inputText }]
    setMessages(newMsgs)
    setInputText("")

    const nextTurn = turn + 1
    if (nextTurn < aiScript.length) {
      setTimeout(() => {
        const reply = aiScript[nextTurn]
        setMessages((prev) => [...prev, { sender: "ai", text: reply }])
        ttsSpeak(reply)
        setTurn(nextTurn)
      }, 1000)
    } else {
      setTimeout(() => {
        setStatus("correct")
        onComplete(100)
      }, 1000)
    }
  }

  const handleContinue = () => {
    if (status === "correct") onNext()
  }

  return (
    <InteractionLayout
      question={level.question}
      ttsSpeak={ttsSpeak}
      onSkip={() => {
        onComplete(0)
        onNext()
      }}
      onCheck={handleSend}
      onContinue={handleContinue}
      canCheck={false} // Custom submit button
      status={status}
      progress={props.progress}
      onClose={props.onClose}
    >
      <div className="w-full max-w-md flex flex-col gap-4">
        <div className="flex-1 bg-muted/30 p-4 rounded-3xl flex flex-col gap-3 max-h-64 overflow-y-auto border-2 border-border">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "p-3 rounded-2xl max-w-[80%]",
                m.sender === "ai"
                  ? "bg-card border-2 border-border text-foreground self-start"
                  : "bg-primary text-primary-foreground self-end"
              )}
            >
              <p className="font-bold text-sm">{m.text}</p>
            </div>
          ))}
        </div>

        {status === "idle" && (
          <div className="flex gap-2">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Type your response..."
              className="flex-1 p-4 rounded-2xl border-2 border-border bg-card text-foreground font-bold focus:border-primary focus:ring-4 focus:ring-primary/20 focus:outline-none transition-all"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend()
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-4 bg-primary text-primary-foreground rounded-2xl border-b-4 border-primary/50 hover:bg-primary/90 active:translate-y-1 active:border-b-0 disabled:opacity-50 disabled:border-b-0 transition-all flex items-center justify-center"
            >
              <Send className="h-6 w-6" />
            </button>
          </div>
        )}
      </div>
    </InteractionLayout>
  )
}
