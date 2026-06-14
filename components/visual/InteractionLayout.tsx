import { useState, useEffect } from "react"
import { Volume2, X, Heart } from "lucide-react"
import { Mascot } from "@/components/mascot"

interface InteractionLayoutProps {
  question: string
  ttsSpeak: (text: string) => void
  children: React.ReactNode
  onSkip: () => void
  onCheck: () => void
  onContinue: () => void
  canCheck: boolean
  status: "idle" | "correct" | "incorrect"
  progress?: number // 0 to 100
  onClose?: () => void
}

export function InteractionLayout({
  question,
  ttsSpeak,
  children,
  onSkip,
  onCheck,
  onContinue,
  canCheck,
  status,
  progress = 20,
  onClose,
}: InteractionLayoutProps) {
  const [skipCooldown, setSkipCooldown] = useState(0)

  // Duolingo colors (dark mode)
  const bgMain = "bg-[#131f24]"
  const textMain = "text-white"
  const greenButton = "bg-[#58cc02] hover:bg-[#46a302] border-[#58cc02] text-[#131f24]"
  const disabledButton = "bg-[#37464f] text-[#52656d]"
  const redButton = "bg-[#ea2b2b] hover:bg-[#c92424] border-[#ea2b2b] text-white"

  useEffect(() => {
    // Auto-play the question on mount (requires user to have interacted with the document before, which they did by clicking START)
    ttsSpeak(question)
  }, [question, ttsSpeak])

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col ${bgMain} font-sans`}>
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-4 md:px-8 max-w-4xl mx-auto w-full">
        <button
          onClick={onClose}
          className="p-2 text-[#52656d] hover:text-white transition-colors"
        >
          <X className="h-6 w-6" />
        </button>
        
        <div className="flex-1 mx-4 h-4 bg-[#37464f] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#58cc02] rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            {/* Glossy highlight on progress bar */}
            <div className="absolute top-1 left-2 right-2 h-1 bg-white/20 rounded-full" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[#ff4b4b] font-bold text-lg">
          <Heart className="h-6 w-6 fill-current" />
          <span>5</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 pb-32">
        
        <div className="flex items-start gap-4 mb-8 w-full">
          <Mascot size={100} animate={true} />
          
          <div className="flex flex-col items-start gap-2">
            {/* The speech bubble pointing to the mascot */}
            <div className="relative bg-white text-[#131f24] p-4 rounded-2xl rounded-tl-none font-bold text-xl md:text-2xl flex items-center gap-3">
              <button 
                onClick={() => ttsSpeak(question)}
                className="text-[#1CB0F6] hover:opacity-80 transition-opacity"
              >
                <Volume2 className="h-8 w-8 fill-current" />
              </button>
              <span>{question}</span>
              {/* Little triangle tail for speech bubble */}
              <div className="absolute top-0 -left-3 w-0 h-0 border-t-[16px] border-t-white border-l-[16px] border-l-transparent"></div>
            </div>
          </div>
        </div>

        {children}
      </div>

      {/* Footer */}
      <div className="fixed bottom-0 left-0 right-0 border-t-2 border-[#37464f]">
        <div className={`transition-colors ${
          status === "correct"
            ? "bg-[#131f24]" 
            : status === "incorrect"
            ? "bg-[#ffdfe0] text-[#ea2b2b]" 
            : "bg-[#131f24]"
        }`}>
          
          <div className="max-w-4xl mx-auto px-4 py-6 md:px-8 flex flex-col md:flex-row items-center justify-between gap-4 relative">
            {status === "idle" ? (
              <>
                <button
                  onClick={onSkip}
                  className="w-full md:w-auto px-6 py-3 font-bold text-[#52656d] border-2 border-[#37464f] rounded-xl hover:bg-[#202f36] transition-colors"
                >
                  SKIP
                </button>
                <button
                  onClick={onCheck}
                  disabled={!canCheck}
                  className={`w-full md:w-auto px-12 py-3 rounded-xl font-extrabold uppercase transition-all shadow-[0_4px_0_var(--tw-shadow-color)] active:shadow-none active:translate-y-1 ${
                    canCheck
                      ? "bg-[#58cc02] text-[#131f24] hover:bg-[#46a302] shadow-[#46a302]"
                      : "bg-[#37464f] text-[#52656d] shadow-[#202f36] cursor-not-allowed"
                  }`}
                >
                  CHECK
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  {/* Mascot reaction area */}
                  <div className="hidden md:block -ml-8 -mt-20">
                    <Mascot size={120} animate={true} />
                  </div>
                  <div className={`font-bold text-2xl ${
                    status === "correct" ? "text-[#58cc02]" : "text-[#ea2b2b]"
                  }`}>
                    {status === "correct" ? "Great work!" : "Not quite!"}
                  </div>
                </div>
                <button
                  onClick={onContinue}
                  className={`w-full md:w-auto px-12 py-3 rounded-xl font-extrabold uppercase transition-all shadow-[0_4px_0_var(--tw-shadow-color)] active:shadow-none active:translate-y-1 ${
                    status === "correct"
                      ? "bg-[#58cc02] text-[#131f24] hover:bg-[#46a302] shadow-[#46a302]"
                      : "bg-[#ea2b2b] text-white hover:bg-[#c92424] shadow-[#c92424]"
                  }`}
                >
                  CONTINUE
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
