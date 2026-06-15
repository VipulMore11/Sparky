import { NextResponse } from "next/server"
import Groq from "groq-sdk"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { seeImagine, listenSpeak, readWrite, handsOnExplore } = body

    if (!process.env.GROQ_API_KEY) {
      throw new Error("GROQ_API_KEY is not set.")
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY })

    const prompt = `You are an expert educational psychologist. Based on the learner's learning style percentages:
- See & Imagine (Visual): ${seeImagine}%
- Listen & Speak (Auditory): ${listenSpeak}%
- Read & Write: ${readWrite}%
- Hands-On Explore (Kinesthetic): ${handsOnExplore}%

Generate highly detailed, in-depth, and comprehensive personalised advice in the following four sections.
CRITICAL FORMATTING RULE: You MUST use standard Markdown syntax for all formatting. Because this output is inside JSON, you MUST separate every single bullet point with two newlines (\n\n). If you do not use \n\n, the text will collapse into a single unreadable paragraph.
Format every point as a standard Markdown bulleted list starting with a dash, where the main concept is in **bold**, followed by a detailed explanation. For example:

- **First Concept:** Detailed explanation goes here...

- **Second Concept:** Detailed explanation goes here...

Do not write generic paragraphs or use HTML.

1. STUDY TRICKS (detailed, actionable, for the learner): Focus heavily on their top learning styles. Provide 4-5 highly detailed techniques with concrete examples of how to apply them to their daily homework.

2. SUPPORTIVE TEACHING STRATEGIES FOR PARENTS: Provide concrete activities, games, and home learning ideas that align with the child's strengths. Go into depth on exactly how to execute these activities.

3. TYPES OF WEBSITES & RESOURCES: Do NOT recommend specific brand names or companies (e.g., do NOT say "Khan Academy", "Crash Course", or "Duolingo"). Instead, describe the *types* or *categories* of websites, apps, and resources the parent should search for (e.g., "**Interactive 3D Simulation Apps:** Look for apps that let the child spin and interact with physics models"). Provide 4-5 detailed bullet points.

4. HOW PARENTS CAN HELP: Focus on direct, interactive, and daily involvement. Provide 4-5 in-depth bullet points. You MUST include strategies similar to:
- **Ask what they are learning:** Take the initiative to ask them exactly what topic they are covering in school today.
- **Discuss the topic together:** Have deep, engaging conversations about the topic rather than just checking if homework is done.
- **Provide matching media:** If they are auditory, find audio documentaries or podcasts for them to listen to; if visual, find visual charts to look at together.

You MUST return valid JSON exactly matching this structure without any markdown fences:
{
  "studyTricks": "string",
  "parentTeachingStrategies": "string",
  "recommendedResources": "string",
  "parentHelpTips": "string"
}`

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      model: "llama-3.3-70b-versatile",
      response_format: { type: "json_object" },
    })

    const responseText = chatCompletion.choices[0]?.message?.content || "{}"
    const json = JSON.parse(responseText)

    return NextResponse.json(json)
  } catch (error: any) {
    // Check if it's a rate limit error
    if (error?.status === 429 || error?.message?.includes('429')) {
      console.warn("Groq API: Rate limit exceeded. Falling back to default advice.")
    } else {
      console.error("Groq API Error:", error?.message || error)
    }
    
    // Fallback JSON if API fails
    return NextResponse.json({
      studyTricks: "**Visualise concepts:** Draw diagrams and use colour-coding. \n\n**Talk it out:** Explain topics aloud to friends or family.",
      parentTeachingStrategies: "**Hands-on learning:** Use everyday objects like coins or blocks to teach math.\n\n**Visual schedules:** Create charts for daily routines to provide structure.",
      recommendedResources: "**Khan Academy** - Video lessons for visual learners.\n**Scratch** - Interactive coding for hands-on learners.",
      parentHelpTips: "Encourage curiosity by asking 'why' and 'how' questions daily. Celebrate effort rather than just results to build a growth mindset."
    })
  }
}
