import { useState, useEffect } from "react"
import type { AuditoryInteractionProps } from "./types"
import { InteractionLayout } from "./InteractionLayout"
import { Send } from "lucide-react"

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
        <div className="flex-1 bg-slate-50 p-4 rounded-2xl flex flex-col gap-3 max-h-64 overflow-y-auto border-2 border-slate-200">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded-2xl max-w-[80%] ${
                m.sender === "ai"
                  ? "bg-white border-2 border-slate-200 self-start"
                  : "bg-[#1CB0F6] text-white self-end"
              }`}
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
              className="flex-1 p-3 rounded-xl border-2 border-slate-200 focus:border-[#1CB0F6] focus:outline-none"
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend()
              }}
            />
            <button
              onClick={handleSend}
              disabled={!inputText.trim()}
              className="p-3 bg-[#1CB0F6] text-white rounded-xl shadow-[0_4px_0_#1899D6] hover:bg-[#1899D6] active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:shadow-none transition-all"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </InteractionLayout>
  )
}
