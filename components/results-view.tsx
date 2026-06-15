"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowRight, RefreshCw, Loader2, Sparkles, Info } from "lucide-react"
import { Mascot } from "@/components/mascot"
import { useProfile } from "@/lib/use-profile"
import { useLearningProfile, type LearningMix } from "@/lib/use-learning-profile"
import { LEARNING_MIX_STYLES } from "@/lib/learning-styles-names"
import SHA256 from "crypto-js/sha256"
import ReactMarkdown from "react-markdown"

type AdviceResponse = {
  studyTricks: string
  parentTeachingStrategies: string
  recommendedResources: string
  parentHelpTips: string
}

export function ResultsView() {
  const router = useRouter()
  const { profile, ready } = useProfile()
  const { percentages, loading: mixLoading } = useLearningProfile()
  
  const [advice, setAdvice] = useState<AdviceResponse | null>(null)
  const [loadingAdvice, setLoadingAdvice] = useState(false)
  const [error, setError] = useState(false)
  const [cacheLoaded, setCacheLoaded] = useState(false)

  // Load cached advice on mount (no API call)
  useEffect(() => {
    if (!percentages || mixLoading) return
    const hash = getHash(percentages)
    const cacheKey = `gemini_advice_${hash}`
    const cached = localStorage.getItem(cacheKey)
    if (cached) {
      try {
        setAdvice(JSON.parse(cached))
      } catch (e) {}
    }
    setCacheLoaded(true)
  }, [percentages, mixLoading])

  const getHash = (p: LearningMix) => {
    // Round to integers to avoid floating point differences
    const rounded = {
      seeImagine: Math.round(p.seeImagine),
      listenSpeak: Math.round(p.listenSpeak),
      readWrite: Math.round(p.readWrite),
      handsOnExplore: Math.round(p.handsOnExplore)
    }
    return SHA256(JSON.stringify(rounded)).toString()
  }

  const fetchAdvice = useCallback(async (forceRefresh = false) => {
    if (!percentages || mixLoading) return
    if (loadingAdvice) return

    const hash = getHash(percentages)
    const cacheKey = `gemini_advice_${hash}`

    if (!forceRefresh) {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        try {
          setAdvice(JSON.parse(cached))
          return
        } catch (e) {}
      }
    }

    setLoadingAdvice(true)
    setError(false)

    try {
      const res = await fetch("/api/generate-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(percentages)
      })

      if (!res.ok) throw new Error("Failed to fetch advice")

      const data = await res.json()
      setAdvice(data)
      localStorage.setItem(cacheKey, JSON.stringify(data))
    } catch (err) {
      console.error(err)
      setError(true)
    } finally {
      setLoadingAdvice(false)
    }
  }, [percentages, mixLoading, loadingAdvice])

  if (!ready || mixLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        Loading your analysis...
      </div>
    )
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 font-sans">
      {/* Header */}
      <div className="flex flex-col items-center gap-5 text-center mb-10">
        <div className="flex items-center gap-4">
          <Mascot size={120} animate />
          <div className="bg-white text-[#131f24] p-4 rounded-2xl rounded-tl-none font-bold text-xl md:text-2xl shadow-sm border-2 border-[#E5E5E5] text-left">
            {profile.name ? `${profile.name}, here's your learning mix!` : "Here's your learning mix!"}
            <div className="text-sm text-[#52656d] font-normal mt-1">Based on your activity across the paths.</div>
          </div>
        </div>
      </div>

      {/* Stacked Bar Chart Section */}
      <section className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 shadow-sm mb-8">
        <h2 className="text-xl font-extrabold text-[#37464f] mb-4">Your Learning Profile</h2>
        
        <div className="h-10 w-full flex rounded-xl overflow-hidden mb-6 relative border-2 border-[#E5E5E5] bg-[#F7F7F7]">
          {LEARNING_MIX_STYLES.map((style) => {
            const pct = percentages[style.id as keyof LearningMix] || 0
            if (pct === 0) return null
            return (
              <div 
                key={style.id}
                className="h-full flex items-center justify-center text-white font-bold text-xs transition-all duration-1000 ease-out"
                style={{ width: `${pct}%`, backgroundColor: style.color }}
                title={`${style.name}: ${pct}%`}
              >
                {pct > 10 ? `${pct}%` : ""}
              </div>
            )
          })}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {LEARNING_MIX_STYLES.map((style) => {
            const pct = percentages[style.id as keyof LearningMix] || 0
            return (
              <div key={style.id} className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-md shrink-0" style={{ backgroundColor: style.color }} />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-[#37464f] leading-tight">{style.name}</span>
                  <span className="text-xs font-semibold text-[#52656d]">{pct}%</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* AI Insights Section - Manual trigger only */}
      <section className="mb-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-extrabold text-[#37464f] flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-[#1CB0F6]" />
            Personalised AI Insights
          </h2>
          <button 
            onClick={() => fetchAdvice(true)} 
            disabled={loadingAdvice}
            className="flex items-center gap-2 px-4 py-2 bg-[#1CB0F6] text-white rounded-xl text-sm font-bold hover:bg-[#1899D6] transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loadingAdvice ? "animate-spin" : ""}`} />
            {advice ? "Regenerate Advice" : "Generate Advice"}
          </button>
        </div>

        {/* Show info when no advice generated yet */}
        {!advice && !loadingAdvice && (
          <div className="bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-2xl p-8 text-center text-[#52656d]">
            <Info className="h-10 w-10 mx-auto mb-3 text-[#1CB0F6]" />
            <p className="text-lg font-medium">Click "Generate Advice" to get personalised study tips, parent strategies, and more based on your learning profile.</p>
            <p className="text-sm mt-2">(AI analysis is free and limited; each profile combination is cached to avoid repeated requests.)</p>
          </div>
        )}

        {loadingAdvice && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {advice && !loadingAdvice && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <AdviceCard 
              title="Study Tricks" 
              content={advice.studyTricks} 
              color="#58CC71"
            />
            <AdviceCard 
              title="Teaching Strategies for Parents" 
              content={advice.parentTeachingStrategies} 
              color="#1CB0F6"
            />
            <AdviceCard 
              title="Recommended Resources" 
              content={advice.recommendedResources} 
              color="#FF9600"
            />
            <AdviceCard 
              title="How Parents Can Help" 
              content={advice.parentHelpTips} 
              color="#CE82FF"
            />
          </div>
        )}

        {error && !loadingAdvice && (
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 text-center text-red-700">
            <p>Something went wrong while generating advice. Please try again later.</p>
          </div>
        )}
      </section>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pb-12">
        <Link
          href="/"
          className="w-full sm:w-auto px-8 py-4 rounded-2xl border-2 border-[#E5E5E5] bg-white text-[#52656d] font-extrabold text-center uppercase tracking-wide transition-all hover:bg-[#F7F7F7] active:scale-95"
        >
          Retake Assessment
        </Link>
        <Link
          href="/learn"
          className="w-full sm:w-auto px-10 py-4 rounded-2xl bg-[#1CB0F6] text-white font-extrabold text-center uppercase tracking-wide transition-all shadow-[0_4px_0_#1899D6] active:shadow-none active:translate-y-1"
        >
          Go to My Learning Path <ArrowRight className="inline h-5 w-5 ml-1 -mt-1" />
        </Link>
      </div>
    </main>
  )
}

function AdviceCard({ title, content, color }: { title: string; content: string; color: string }) {
  return (
    <div className="bg-white rounded-3xl border-2 border-[#E5E5E5] p-6 shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-extrabold mb-4 pb-2 border-b-2 border-[#F7F7F7]" style={{ color }}>
        {title}
      </h3>
      <div className="prose prose-sm max-w-none text-[#37464f]">
        <ReactMarkdown>{content}</ReactMarkdown>
      </div>
    </div>
  )
}