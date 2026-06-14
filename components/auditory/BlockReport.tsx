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
    // We just map the 5 scores to three axes arbitrarily or use specific indices if we tracked them
    // For simplicity, we just create some fake axes based on the scores
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
      
      <h2 className="text-3xl font-extrabold text-slate-800 mb-2">
        {isFinal ? "Auditory Path Complete!" : `Block ${blockIndex + 1} Complete!`}
      </h2>
      <p className="text-slate-500 font-bold mb-8">
        Here is your Auditory Affinity Report
      </p>

      <div className="w-full h-64 mb-8 bg-white rounded-3xl shadow-sm border-2 border-slate-100 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
            <PolarGrid />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "#64748b", fontSize: 12, fontWeight: "bold" }} />
            <PolarRadiusAxis angle={30} domain={[0, 100]} />
            <Radar
              name="Student"
              dataKey="A"
              stroke="#1CB0F6"
              fill="#1CB0F6"
              fillOpacity={0.5}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-8 mb-8 w-full justify-center">
        <div className="bg-[#DDF4FF] p-6 rounded-2xl border-2 border-[#1CB0F6] text-center flex-1">
          <p className="text-[#1CB0F6] font-bold text-sm uppercase mb-1">Average Score</p>
          <p className="text-3xl font-extrabold text-[#1CB0F6]">{averageScore}%</p>
        </div>
        <div className="bg-[#D7FFB8] p-6 rounded-2xl border-2 border-[#58CC71] text-center flex-1">
          <p className="text-[#58CC71] font-bold text-sm uppercase mb-1">Auditory Affinity</p>
          <p className="text-3xl font-extrabold text-[#58CC71]">{affinityLabel}</p>
        </div>
      </div>

      <p className="text-center text-slate-600 font-semibold mb-12 max-w-md">
        {affinityLabel === "High"
          ? "You excel at listening and speaking! Keep using auditory paths to maximize your learning."
          : affinityLabel === "Medium"
          ? "You have a solid foundation in auditory learning. Mix it up with other styles!"
          : "Auditory learning might not be your primary style, and that's okay!"}
      </p>

      <button
        onClick={onContinue}
        className="w-full max-w-sm px-8 py-4 bg-[#58CC71] text-white rounded-2xl font-bold text-xl shadow-[0_6px_0_#46A35A] hover:bg-[#46A35A] active:translate-y-1 active:shadow-none transition-all"
      >
        {isFinal ? "FINISH PATH" : "CONTINUE TO NEXT BLOCK"}
      </button>
    </div>
  )
}
