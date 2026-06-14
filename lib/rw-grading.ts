import type { Step } from "./rw-types"

function norm(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim()
}

export function countKeywords(text: string, keywords: string[]): number {
  const words = new Set(norm(text).split(" ").filter(Boolean))
  // also allow substring matches for multi-word keywords
  const t = norm(text)
  let hits = 0
  const seen = new Set<string>()
  for (const kw of keywords) {
    const k = norm(kw)
    if (seen.has(k)) continue
    if (k.includes(" ") ? t.includes(k) : words.has(k)) {
      hits++
      seen.add(k)
    }
  }
  return hits
}

export function isAnswerReady(step: Step, answer: unknown): boolean {
  switch (step.kind) {
    case "intro":
      return true
    case "read-choice":
      return typeof answer === "number" && answer >= 0
    case "read-order":
      return Array.isArray(answer) && answer.length === step.items.length
    case "write-short":
      return typeof answer === "string" && norm(answer).split(" ").filter(Boolean).length >= 1
    case "write-fill":
      return typeof answer === "string" && answer.trim().length > 0
    case "match":
      return (
        answer != null &&
        typeof answer === "object" &&
        Object.keys(answer as object).length === step.pairs.length
      )
    default:
      return false
  }
}

export function gradeStep(step: Step, answer: unknown): boolean {
  switch (step.kind) {
    case "intro":
      return true
    case "read-choice":
      return answer === step.answer
    case "read-order":
      return Array.isArray(answer) && step.items.every((it, i) => answer[i] === it)
    case "write-short":
      return countKeywords(String(answer ?? ""), step.keywords) >= step.minKeywords
    case "write-fill":
      return step.answers.map((a) => a.toLowerCase().trim()).includes(String(answer ?? "").toLowerCase().trim())
    case "match": {
      const map = answer as Record<string, string>
      return step.pairs.every((p) => map[p.left] === p.right)
    }
    default:
      return false
  }
}
