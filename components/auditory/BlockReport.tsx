import { useMemo } from "react"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from "recharts"
import Confetti from "react-confetti"

interface BlockReportProps {
  scores: number[] // Last 5 scores
  blockIndex: number
  onContinue: () => void
}

export function BlockReport({ scores, blockIndex, onContinue }: BlockReportProps) {
  const isFinal = blockIndex === 3

  const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)

  let affinityLabel = "Low"
  if (averageScore > 80) affinityLabel = "High"
  else if (averageScore > 50) affinityLabel = "Medium"

  const data = useMemo(() => {
    const listeningComp = scores[0] || 0
    const verbalExp = ((scores[1] || 0) + (scores[2] || 0)) / 2
    const explanationQual = ((scores[3] || 0) + (scores[4] || 0)) / 2

    return [
      { subject: "Listening Comprehension", A: listeningComp, fullMark: 100 },
      { subject: "Verbal Expression", A: verbalExp, fullMark: 100 },
      { subject: "Explanation Quality", A: explanationQual, fullMark: 100 },
    ]
  }, [scores])

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto py-12 px-4 h-full relative">
      {isFinal && <Confetti recycle={false} numberOfPieces={500} />}
      
      <h2 className="text-3xl font-extrabold text-foreground mb-2 text-center">
        {isFinal ? "Auditory Path Complete!" : `Block ${blockIndex + 1} Complete!`}
      </h2>
      <p className="text-muted-foreground font-bold mb-8 text-center">
        Here is your Auditory Affinity Report
      </p>

      <div className="w-full h-80 mb-8 bg-card rounded-3xl border-2 border-border p-4 sm:p-6">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="65%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "currentColor", fontSize: 12, fontWeight: "bold" }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Student"
              dataKey="A"
              stroke="var(--primary)"
              fill="var(--primary)"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-4 mb-8 w-full justify-center">
        <div className="bg-primary/10 p-6 rounded-2xl border-2 border-primary text-center flex-1">
          <p className="text-primary font-bold text-sm uppercase mb-1">Average Score</p>
          <p className="text-3xl font-extrabold text-primary">{averageScore}%</p>
        </div>
        <div className="bg-success/10 p-6 rounded-2xl border-2 border-success text-center flex-1">
          <p className="text-success font-bold text-sm uppercase mb-1">Auditory Affinity</p>
          <p className="text-3xl font-extrabold text-success">{affinityLabel}</p>
        </div>
      </div>

      <p className="text-center text-muted-foreground font-semibold mb-12 max-w-md">
        {affinityLabel === "High"
          ? "You excel at listening and speaking! Keep using auditory paths to maximize your learning."
          : affinityLabel === "Medium"
          ? "You have a solid foundation in auditory learning. Mix it up with other styles!"
          : "Auditory learning might not be your primary style, and that's okay!"}
      </p>

      <button
        onClick={onContinue}
        className="w-full max-w-sm px-8 py-4 bg-primary text-primary-foreground rounded-2xl border-b-4 border-primary/50 font-bold text-xl active:translate-y-1 active:border-b-0 transition-all uppercase"
      >
        {isFinal ? "Finish Path" : "Continue to Next Block"}
      </button>
    </div>
  )
}
