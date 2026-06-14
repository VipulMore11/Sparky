"use client"

import { useEffect, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { Send, X, MessageCircle } from "lucide-react"
import { Mascot } from "@/components/mascot"
import { LEARNING_STYLES, type AgeGroup, type StyleKey } from "@/lib/learning-styles"
import { cn } from "@/lib/utils"

function messageText(m: UIMessage): string {
  return (m.parts ?? [])
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("")
}

type MascotChatProps = {
  style: StyleKey
  name: string
  ageGroup: AgeGroup | null
}

export function MascotChat({ style, name, ageGroup }: MascotChatProps) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState("")
  const scrollRef = useRef<HTMLDivElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      prepareSendMessagesRequest: ({ messages }) => ({
        body: {
          messages,
          context: { name, style: LEARNING_STYLES[style].name, ageGroup },
        },
      }),
    }),
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" })
  }, [messages, open])

  const busy = status === "streaming" || status === "submitted"

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!input.trim() || busy) return
    sendMessage({ text: input })
    setInput("")
  }

  const suggestions = [
    "How should I study?",
    "What apps are good for me?",
    "Help me focus!",
  ]

  return (
    <>
      {/* launcher */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close Sparky chat" : "Ask Sparky"}
        className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border-b-4 border-primary/40 bg-primary px-4 py-3 font-extrabold text-primary-foreground shadow-lg transition-all hover:brightness-105 active:translate-y-0.5 active:border-b-2"
      >
        {open ? <X className="h-5 w-5" /> : <MessageCircle className="h-5 w-5" />}
        <span className="hidden sm:inline">{open ? "Close" : "Ask Sparky"}</span>
      </button>

      {/* panel */}
      {open && (
        <div className="fixed bottom-24 right-5 z-40 flex h-[28rem] w-[min(22rem,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-3xl border-2 border-border bg-card shadow-2xl">
          {/* header */}
          <div className="flex items-center gap-3 border-b border-border bg-accent/40 px-4 py-3">
            <Mascot size={44} animate={false} />
            <div>
              <p className="font-extrabold leading-tight">Sparky</p>
              <p className="text-xs text-muted-foreground">Your learning guide</p>
            </div>
          </div>

          {/* messages */}
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.length === 0 && (
              <div className="flex flex-col gap-3">
                <div className="rounded-2xl rounded-tl-sm bg-muted px-3 py-2 text-sm leading-relaxed">
                  Hi{name ? `, ${name}` : ""}! I&apos;m Sparky. Ask me how to learn
                  STEM your way, or which tools fit a{" "}
                  {LEARNING_STYLES[style].shortName.toLowerCase()} learner like you!
                </div>
                <div className="flex flex-wrap gap-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => sendMessage({ text: s })}
                      className="rounded-full border-2 border-border px-3 py-1 text-xs font-bold transition-colors hover:bg-accent"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={cn(
                  "flex",
                  m.role === "user" ? "justify-end" : "justify-start",
                )}
              >
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed",
                    m.role === "user"
                      ? "rounded-tr-sm bg-primary text-primary-foreground"
                      : "rounded-tl-sm bg-muted",
                  )}
                >
                  {messageText(m) || (
                    <span className="inline-flex gap-1">
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.2s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.1s]" />
                      <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* input */}
          <form onSubmit={submit} className="flex items-center gap-2 border-t border-border p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Sparky anything…"
              className="flex-1 rounded-xl border-2 border-border bg-background px-3 py-2 text-sm outline-none focus:border-primary"
            />
            <button
              type="submit"
              disabled={!input.trim() || busy}
              aria-label="Send"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-all disabled:opacity-40 active:translate-y-0.5"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
    </>
  )
}
