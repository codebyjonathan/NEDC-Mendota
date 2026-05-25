import OpenAI from "openai"
import { isLikelyOffensiveText } from "@/lib/chat-safety"
import { enforceRateLimit, sanitizeTextInput } from "@/lib/server/api-security"
import { NextRequest } from "next/server"

let client: OpenAI | undefined

function getClient() {
  if (!client) {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY")
    client = new OpenAI({ apiKey })
  }

  return client
}

export const runtime = "nodejs"
export const maxDuration = 30

// Goal: Implement AI-powered emotional support systems.
// This prompt constrains the assistant to short, supportive safety-plan guidance
// while explicitly rejecting harmful/off-topic generation.
const SAFETY_PLAN_PROMPT = `
You are a supportive mental health assistant who helps users create
a simple and realistic safety plan. Provide calm, short suggestions.
Avoid medical advice. Ask gentle questions when needed.
Never generate hate speech, slurs, harassment, explicit sexual content,
graphic violence, or instructions for wrongdoing. If asked for disallowed
content, refuse briefly and redirect to a safe coping step.
`

const FALLBACK_RESPONSE =
  "I am here with you. Try one next step: 1) name one person to contact, 2) pick one calming activity for 10 minutes, 3) remove one immediate trigger from your space."

export async function POST(req: NextRequest) {
  try {
    const limited = enforceRateLimit(req, { key: "safety-chat:post", maxRequests: 20, windowMs: 60_000 })
    if (limited) return limited

    const { messages } = await req.json()

    if (!messages || messages.length === 0) {
      return new Response(JSON.stringify({ text: "No messages received." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const rawLastUserMessage = [...messages].reverse().find((m: any) => m?.role === "user")?.content || ""
    const normalizedLastUserMessage = sanitizeTextInput(rawLastUserMessage, {
      maxLen: 2000,
      strict: true,
    })
    if (!normalizedLastUserMessage.ok) {
      return new Response(
        JSON.stringify({
          blocked: true,
          reason: "invalid_input",
          text: normalizedLastUserMessage.reason,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }
    const lastUserMessage = normalizedLastUserMessage.value
    // Safety strength: layered local screening to quickly block unsafe or abusive inputs.
    if (isLikelyOffensiveText(lastUserMessage)) {
      return new Response(
        JSON.stringify({
          blocked: true,
          reason: "offensive_input",
          text: "Unable to send this message because it appears offensive or unsafe.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return new Response(JSON.stringify({ text: FALLBACK_RESPONSE, fallback: true, reason: "missing_api_key" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    }

    const openai = getClient()
    const model = process.env.OPENAI_MODEL || "gpt-4o-mini"

    const userModeration = await openai.moderations.create({
      model: "omni-moderation-latest",
      input: String(lastUserMessage),
    })
    // Safety strength: model-side moderation validates user input before generation.
    if (userModeration.results?.[0]?.flagged) {
      return new Response(
        JSON.stringify({
          blocked: true,
          reason: "moderation_blocked_input",
          text: "Unable to send this message because it appears offensive or unsafe.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      )
    }

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "system", content: SAFETY_PLAN_PROMPT }, ...messages],
      max_tokens: 220,
    })

    let aiMessage = response.choices?.[0]?.message?.content ?? FALLBACK_RESPONSE

    if (isLikelyOffensiveText(aiMessage)) {
      // Safety strength: output post-check and safe redirect prevent harmful replies.
      aiMessage =
        "I can't help with offensive or harmful language. We can focus on one safe next step right now, like reaching out to a trusted person."
    } else {
      const outputModeration = await openai.moderations.create({
        model: "omni-moderation-latest",
        input: aiMessage,
      })
      if (outputModeration.results?.[0]?.flagged) {
        aiMessage =
          "I can't help with that. I can help with a safe step right now, like breathing for one minute or contacting support at 988."
      }
    }

    return new Response(JSON.stringify({ text: aiMessage }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Safety Chat API error:", err)
    return new Response(
      JSON.stringify({
        text: FALLBACK_RESPONSE,
        fallback: true,
        error: err instanceof Error ? err.message : "Unknown error",
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    )
  }
}

export async function GET(req: NextRequest) {
  const limited = enforceRateLimit(req, { key: "safety-chat:get", maxRequests: 60, windowMs: 60_000 })
  if (limited) return limited

  return new Response(
    JSON.stringify({
      ok: true,
      route: "/api/safety-chat",
      hasOpenAIKey: Boolean(process.env.OPENAI_API_KEY),
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  )
}
